import React, { useEffect } from 'react';
import { useTournamentData } from '../hooks/useTournaments';
import Navbar from './Navbar';
import Footer from './Footer';
import TournamentBracket from './TournamentBracket';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, UserPlus } from 'lucide-react';
import Button from './ui/Button';

const TournamentPage: React.FC = () => {
    // Determine tournament_id from hash routing ex: #tournaments?id=SIM123
    const formatUrl = () => {
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
            return new URLSearchParams(hashParts[1]).get('id');
        }
        return 'default-simul-id'; // Fallback for direct #tournaments navigation
    };
    const tournamentId = formatUrl();
    const { tournament, matches, participants, loading, error } = useTournamentData(tournamentId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Skeleton loader component
    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-dark-900 px-6 text-center flex flex-col items-center">
                <div className="w-64 h-12 bg-dark-800 animate-pulse rounded-lg mb-8"></div>
                <div className="w-full max-w-4xl h-[60vh] bg-dark-800 animate-pulse rounded-3xl border border-white/10"></div>
                <p className="mt-8 text-brand font-bold uppercase tracking-widest animate-pulse">Syncing closely with Supabase...</p>
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
            {/* Header info */}
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

                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="primary"
                            onClick={() => alert("Supabase Integration Pending: This will open the registration form connecting to the tournament_participants table.")}
                            className="px-8 py-3 uppercase tracking-widest font-black flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <UserPlus size={18} /> Register Now
                        </Button>
                    </div>
                </motion.div>

                {/* Bracket Rendering */}
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Live Bracket View</h2>
                    <TournamentBracket matches={matches} />
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;