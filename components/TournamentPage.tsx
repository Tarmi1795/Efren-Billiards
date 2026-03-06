import React, { useEffect, useState } from 'react';
import { useTournamentData } from '../hooks/useTournaments';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TournamentBracket from './TournamentBracket';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, UserPlus, CheckCircle, Loader2 } from 'lucide-react';
import Button from './ui/Button';

const TournamentPage: React.FC = () => {
    const formatUrl = () => {
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
            return new URLSearchParams(hashParts[1]).get('id');
        }
        return null;
    };
    const tournamentId = formatUrl();
    const { tournament, matches, participants, loading, error } = useTournamentData(tournamentId);
    const { user, profile } = useAuth();

    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [regError, setRegError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!user || !tournamentId) return;
        const checkRegistration = async () => {
            const { data } = await supabase
                .from('tournament_participants')
                .select('id')
                .eq('tournament_id', tournamentId)
                .eq('player_id', user.id)
                .maybeSingle();
            if (data) setRegistered(true);
        };
        checkRegistration();
    }, [user, tournamentId]);

    // Handle auto-registration returning from login
    useEffect(() => {
        if (user && tournamentId && !registered && !registering) {
            const pendingTourney = localStorage.getItem('pendingTournamentRegistration');
            if (pendingTourney === tournamentId) {
                localStorage.removeItem('pendingTournamentRegistration');
                handleRegister();
            }
        }
    }, [user, tournamentId, registered, registering]);

    const handleRegister = async () => {
        if (!user || !tournamentId) return;
        setRegistering(true);
        setRegError(null);

        try {
            const { data: existingPlayer } = await supabase
                .from('players')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!existingPlayer) {
                const { error: pErr } = await supabase.from('players').insert({
                    id: user.id,
                    name: profile?.full_name || user.email?.split('@')[0] || 'Player',
                    avatar_url: profile?.avatar_url || null,
                    rating: 1500,
                } as any);
                if (pErr) throw pErr;
            }

            const nextSeed = participants.length + 1;

            const { error: rErr } = await supabase.from('tournament_participants').insert({
                tournament_id: tournamentId,
                player_id: user.id,
                seed: nextSeed,
            } as any);
            if (rErr) throw rErr;

            setRegistered(true);
        } catch (err: any) {
            setRegError(err.message || 'Registration failed.');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-dark-900 px-6 text-center flex flex-col items-center">
                <div className="w-64 h-12 bg-dark-800 animate-pulse rounded-lg mb-8"></div>
                <div className="w-full max-w-4xl h-[60vh] bg-dark-800 animate-pulse rounded-3xl border border-white/10"></div>
                <p className="mt-8 text-brand font-bold uppercase tracking-widest animate-pulse">Syncing with Supabase...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-24 min-h-screen bg-dark-900 px-6 flex items-center justify-center">
                <div className="bg-red-900/20 text-red-500 border border-red-500/50 p-8 rounded-xl max-w-md text-center">
                    <p className="font-bold uppercase tracking-widest mb-2">Error Loading Bracket</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block flex items-center justify-center gap-2">
                        <Trophy size={16} /> Official Tournament Record
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
                        {tournament?.name || 'Tournament View'}
                    </h1>

                    <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-full border border-white/10">
                            <Calendar size={16} className="text-brand" /> {new Date(tournament?.created_at || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-full border border-white/10">
                            <Users size={16} className="text-brand" /> {participants.length} Registered
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        {!user ? (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    if (tournamentId) localStorage.setItem('pendingTournamentRegistration', tournamentId);
                                    window.location.hash = '#login';
                                }}
                                className="px-8 py-3 uppercase tracking-widest font-black flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <UserPlus size={18} /> Sign In to Register
                            </Button>
                        ) : registered ? (
                            <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-sm">
                                <CheckCircle size={18} /> You are registered
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleRegister}
                                disabled={registering}
                                className="px-8 py-3 uppercase tracking-widest font-black flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                {registering ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                {registering ? 'Registering...' : 'Register Now'}
                            </Button>
                        )}
                        {regError && <p className="text-red-500 text-xs mt-1">{regError}</p>}
                    </div>
                </motion.div>

                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Live Bracket View</h2>
                    <TournamentBracket matches={matches} />
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;