import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, MembershipTier } from '../types/database';

// ============================================================================
// Auth Context — manages session, user, and profile state globally
// ============================================================================

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    /** Fetches or refreshes the profile from Supabase `profiles` table */
    refreshProfile: () => Promise<void>;
    /** Signs out and clears all state */
    signOut: () => Promise<void>;
    /** Check if the current user has a specific tier */
    hasTier: (tier: MembershipTier) => boolean;
    /** Check if user is admin (tier === 'Admin' from DB, not JWT) */
    isAdmin: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    /** Fetch profile from public.profiles for the given user ID */
    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Profile may not exist yet (first login via OAuth).
                // A Postgres trigger should create it, but handle gracefully.
                console.warn('Profile fetch error:', error.message);
                setProfile(null);
                return;
            }
            setProfile(data as Profile);
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setProfile(null);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            await fetchProfile(user.id);
        }
    }, [user?.id, fetchProfile]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        window.location.hash = '#home';
    }, []);

    const hasTier = useCallback(
        (tier: MembershipTier) => profile?.tier === tier,
        [profile?.tier]
    );

    const isAdmin = profile?.tier === 'Admin';

    // Bootstrap: get the current session + listen for auth changes
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            // Safety timeout: if auth takes more than 3s, show the UI anyway
            const timeout = setTimeout(() => {
                if (mounted) {
                    console.warn('[Auth] Initialization took too long, forcing loading to false.');
                    setLoading(false);
                }
            }, 3000);

            try {
                // Fetch the initial session
                const { data: { session: s }, error } = await supabase.auth.getSession();
                if (error) console.error('Session error:', error.message);

                if (mounted) {
                    setSession(s);
                    setUser(s?.user ?? null);
                }

                if (s?.user && mounted) {
                    // This call might hang if there is an RLS recursion loop in Postgres
                    await fetchProfile(s.user.id);
                }
            } catch (err) {
                console.error('Unexpected error during auth initialization:', err);
            } finally {
                clearTimeout(timeout);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                if (!mounted) return;
                setSession(s);
                setUser(s?.user ?? null);

                if (s?.user) {
                    try {
                        await fetchProfile(s.user.id);
                    } catch (e) {
                        console.error('Auth state profile fetch error:', e);
                    }
                } else {
                    setProfile(null);
                }

                // Ensure loading is cleared on any state change
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    return (
        <AuthContext.Provider
            value={{ session, user, profile, loading, refreshProfile, signOut, hasTier, isAdmin }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/** Hook to consume auth context — must be used within <AuthProvider> */
export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
