import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, CheckCircle, Loader2, UserPlus, UserMinus, Users, ChevronDown, ChevronUp, X } from 'lucide-react';
import Button from './ui/Button';
import AuthModal from './auth/AuthModal';
import type { Tournament, Registration, Profile } from '../types/database';

interface TournamentWithParticipants extends Tournament {
    participants?: { user_id: string; profiles: Profile }[];
}

const TournamentCard: React.FC<{
    tournament: TournamentWithParticipants;
    isRegistered: boolean;
    isRegistering: boolean;
    onRegister: (id: string) => void;
    onUnregister: (id: string) => void;
}> = ({ tournament, isRegistered, isRegistering, onRegister, onUnregister }) => {
    const [showParticipants, setShowParticipants] = useState(false);
    const [participants, setParticipants] = useState<{ user_id: string; profiles: Profile }[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const fetchParticipants = async () => {
        if (participants.length > 0) {
            setShowParticipants(!showParticipants);
            return;
        }
        
        setLoadingParticipants(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('user_id, profiles(*)')
                .eq('tournament_id', tournament.id);
            
            if (error) throw error;
            setParticipants(data as any || []);
            setShowParticipants(true);
        } catch (err) {
            console.error('Failed to fetch participants', err);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const showRegisterButton = ['billiards', 'darts', 'chess'].includes(tournament.game_type?.toLowerCase());

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 border border-white/10 rounded-2xl p-6 flex flex-col h-full hover:border-brand/30 transition-colors"
        >
            <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{tournament.name}</h3>
                    <span className="bg-dark-900 text-brand text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand/20">
                        {tournament.game_type}
                    </span>
                </div>
                {tournament.description && (
                    <p className="text-sm text-gray-400 mb-4">{tournament.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand" /> 
                        {tournament.start_date ? new Date(tournament.start_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : new Date(tournament.created_at || Date.now()).toLocaleDateString()}
                    </div>
                    {tournament.prize_amount && (
                        <div className="flex items-center gap-2 text-brand">
                            <Trophy size={14} /> QAR {tournament.prize_amount.toLocaleString()}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
                <button 
                    onClick={fetchParticipants}
                    className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-4"
                >
                    <span className="flex items-center gap-2"><Users size={14} /> Participants</span>
                    {loadingParticipants ? <Loader2 size={14} className="animate-spin" /> : showParticipants ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                    {showParticipants && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            {participants.length === 0 ? (
                                <p className="text-xs text-gray-500 italic">No participants yet.</p>
                            ) : (
                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {participants.map((p, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex items-center gap-2 bg-dark-900 p-2 rounded-lg border border-white/5">
                                            <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-[10px] font-bold text-brand">
                                                {p.profiles?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            {p.profiles?.full_name || 'Unknown Player'}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {showRegisterButton && (
                    <div className="pt-4 border-t border-white/5">
                        {isRegistered ? (
                            <Button
                                variant="outline"
                                onClick={() => onUnregister(tournament.id)}
                                disabled={isRegistering}
                                fullWidth
                                className="py-3 uppercase tracking-widest font-black flex items-center justify-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                            >
                                {isRegistering ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <UserMinus size={18} />
                                )}
                                {isRegistering ? 'Processing...' : 'Unregister'}
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => onRegister(tournament.id)}
                                disabled={isRegistering}
                                fullWidth
                                className="py-3 uppercase tracking-widest font-black flex items-center justify-center gap-2"
                            >
                                {isRegistering ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <UserPlus size={18} />
                                )}
                                {isRegistering ? 'Registering...' : 'Register'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const TournamentPage: React.FC = () => {
    const { user, profile, refreshProfile } = useAuth();
    const [tournaments, setTournaments] = useState<TournamentWithParticipants[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Map of tournamentId -> registration status
    const [registrations, setRegistrations] = useState<Record<string, boolean>>({});
    const [inFlight, setInFlight] = useState<Record<string, boolean>>({});
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Profile Onboarding State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [pendingTournamentId, setPendingTournamentId] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTournaments();
    }, []);

    useEffect(() => {
        if (user) {
            fetchRegistrations();
        } else {
            setRegistrations({});
        }
    }, [user]);

    const fetchTournaments = async () => {
        try {
            const { data, error } = await (supabase.from('tournaments') as any)
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setTournaments(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tournaments.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrations = async () => {
        if (!user) return;
        try {
            const { data, error } = await (supabase.from('registrations') as any)
                .select('tournament_id')
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            const regMap: Record<string, boolean> = {};
            data?.forEach((r: any) => {
                regMap[r.tournament_id] = true;
            });
            setRegistrations(regMap);
        } catch (err) {
            console.error('Error fetching registrations:', err);
        }
    };

    const handleRegisterClick = async (tournamentId: string) => {
        if (!user) {
            localStorage.setItem('pendingTournamentRegistration', tournamentId);
            setIsAuthModalOpen(true);
            return;
        }

        // Check if profile is complete
        if (!profile?.full_name || !profile?.phone) {
            setProfileData({
                full_name: profile?.full_name || '',
                phone: profile?.phone || ''
            });
            setPendingTournamentId(tournamentId);
            setShowProfileModal(true);
            return;
        }

        await processRegistration(tournamentId);
    };

    const processRegistration = async (tournamentId: string) => {
        if (!user) return;
        setInFlight(prev => ({ ...prev, [tournamentId]: true }));
        
        try {
            const { error: rErr } = await (supabase.from('registrations') as any).insert({
                tournament_id: tournamentId,
                user_id: user.id,
            });
            
            if (rErr) {
                // Handle 409 (Already Registered) gracefully
                if (rErr.code === '23505') {
                    setRegistrations(prev => ({ ...prev, [tournamentId]: true }));
                } else {
                    throw rErr;
                }
            } else {
                setRegistrations(prev => ({ ...prev, [tournamentId]: true }));
            }
        } catch (err: any) {
            console.error('Registration failed:', err);
            if (err.status === 401 || err.code === '401') {
                setIsAuthModalOpen(true);
            } else {
                alert(err.message || 'Registration failed.');
            }
        } finally {
            setInFlight(prev => ({ ...prev, [tournamentId]: false }));
        }
    };

    const handleUnregister = async (tournamentId: string) => {
        if (!user) return;
        setInFlight(prev => ({ ...prev, [tournamentId]: true }));
        
        try {
            const { error: rErr } = await (supabase.from('registrations') as any)
                .delete()
                .eq('tournament_id', tournamentId)
                .eq('user_id', user.id);
            
            if (rErr) throw rErr;
            setRegistrations(prev => ({ ...prev, [tournamentId]: false }));
        } catch (err: any) {
            console.error('Unregistration failed:', err);
            alert(err.message || 'Unregistration failed.');
        } finally {
            setInFlight(prev => ({ ...prev, [tournamentId]: false }));
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setSavingProfile(true);
        try {
            const { error } = await (supabase.from('profiles') as any)
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone
                })
                .eq('id', user.id);
                
            if (error) throw error;
            
            await refreshProfile(); // Refresh profile in context
            setShowProfileModal(false);
            if (pendingTournamentId) {
                await processRegistration(pendingTournamentId);
                setPendingTournamentId(null);
            }
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            alert(err.message || 'Failed to save profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    // Handle auto-registration returning from login
    useEffect(() => {
        if (user) {
            const pendingTourney = localStorage.getItem('pendingTournamentRegistration');
            if (pendingTourney && !registrations[pendingTourney] && !inFlight[pendingTourney]) {
                localStorage.removeItem('pendingTournamentRegistration');
                handleRegisterClick(pendingTourney);
            }
        }
    }, [user, registrations, inFlight]);

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
                    <p className="font-bold uppercase tracking-widest mb-2">Error Loading Tournaments</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            
            {/* Profile Onboarding Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-800 border border-white/10 rounded-3xl p-6 md:p-10 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-dark-900 rounded-full p-2">
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Complete Profile</h3>
                        <p className="text-gray-400 text-sm mb-8">
                            Please provide your name and contact number to complete your registration.
                        </p>
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <Button
                                variant="primary"
                                fullWidth
                                type="submit"
                                disabled={savingProfile}
                                className="py-4 text-sm font-black uppercase tracking-widest flex justify-center items-center gap-2"
                            >
                                {savingProfile && <Loader2 size={16} className="animate-spin" />}
                                Save & Register
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block flex items-center justify-center gap-2">
                        <Trophy size={16} /> Official Tournament Record
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
                        Tournament Summary
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        View and register for upcoming tournaments.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => (
                        <TournamentCard 
                            key={tournament.id}
                            tournament={tournament}
                            isRegistered={!!registrations[tournament.id]}
                            isRegistering={!!inFlight[tournament.id]}
                            onRegister={handleRegisterClick}
                            onUnregister={handleUnregister}
                        />
                    ))}
                    
                    {tournaments.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No tournaments available at the moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;