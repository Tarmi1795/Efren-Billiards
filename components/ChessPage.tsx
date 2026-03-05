import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, X, Award, Calendar, Swords } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

interface TopPlayer {
    id: string;
    rank: number;
    name: string;
    rating: number;
    title?: string;
}

const topPlayers: TopPlayer[] = [
    { id: '1', rank: 1, name: 'Eugenio T.', rating: 2450, title: 'GM' },
    { id: '2', rank: 2, name: 'Wesley S.', rating: 2380, title: 'IM' },
    { id: '3', rank: 3, name: 'Rogelio A.', rating: 2200, title: 'FM' },
    { id: '4', rank: 4, name: 'Julio C.', rating: 2150 },
    { id: '5', rank: 5, name: 'Mark P.', rating: 2100 },
];

const ChessPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // State for Rebate Modal
    const [showRebateModal, setShowRebateModal] = useState(false);

    // State for Challenge Modal
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<TopPlayer | null>(null);

    const handleChallengeClick = (player: TopPlayer) => {
        setSelectedPlayer(player);
        setShowChallengeModal(true);
    };

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <Reveal>
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1471&auto=format&fit=crop" className="w-full h-full object-cover scale-105" alt="Chess Lounge" />
                    <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest text-center px-4">Chess Lounge</h1>
                    </div>
                </div>
            </Reveal>

            <Section id="content" className="py-20 max-w-4xl mx-auto px-6 text-center text-gray-300">
                <Reveal variant="fade-up">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
                        Engage your mind in our quiet, premium chess area.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Challenge your focus and strategic thinking. We offer beautifully crafted, weighted tournament chess sets and digital clocks for those who love speed chess. The lounge area provides a serene environment perfect for studying openings, casual play, or intense competition, all while enjoying our specialty coffee.
                    </p>
                    <div className="flex gap-4 justify-center font-black">
                        <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-8 py-4 text-sm uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform duration-300">
                            Book a Table
                        </Button>
                        <Button variant="outline" onClick={() => setShowRebateModal(true)} className="px-8 py-4 text-sm uppercase tracking-[0.1em] rounded-full hover:border-maroon transition-colors duration-300 border-white/20">
                            Claim "Losing King" Rebate
                        </Button>
                    </div>
                </Reveal>

                {/* Grandmaster Simul & Player Challenges */}
                <Reveal delay={200} className="mt-24">
                    <div className="bg-dark-800 rounded-3xl p-8 md:p-12 border border-brand/20 shadow-[0_0_40px_rgba(197,160,89,0.1)] relative overflow-hidden text-left">
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Monthly Simul Info */}
                            <div className="flex-1 w-full">
                                <h3 className="text-brand font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2"><Brain size={16} /> Elite Events</h3>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Grandmaster Simul</h4>
                                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                    Join our monthly exhibition event! Face off against top-ranked masters in a simultaneous exhibition match. Think you have what it takes to draw or defeat a Grandmaster?
                                </p>

                                <div className="bg-dark-900 p-6 rounded-xl border border-white/5 mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-brand/20 p-3 rounded-full text-brand">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold uppercase tracking-wider text-sm">Next event: April 15th</p>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">Seats are limited to 20 boards</p>
                                        </div>
                                    </div>
                                    <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="w-full font-black text-sm uppercase tracking-widest py-3 hover:scale-105 transition-transform duration-300">
                                        Reserve a Board
                                    </Button>
                                </div>
                            </div>

                            {/* Top Ranked Players & Challenge */}
                            <div className="flex-1 w-full">
                                <h3 className="text-brand font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2"><Trophy size={16} /> Rank Poll</h3>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">Top Ranked Players</h4>

                                <div className="space-y-3">
                                    {topPlayers.map((player) => (
                                        <div key={player.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-xl border border-white/5 hover:border-brand/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-6 font-black text-gray-500 text-sm">
                                                    #{player.rank}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                                        {player.name}
                                                        {player.title && <span className="bg-brand text-black text-[10px] px-1.5 py-0.5 rounded font-black">{player.title}</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">Rating: {player.rating}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleChallengeClick(player)}
                                                className="text-[10px] font-bold uppercase tracking-widest bg-dark-800 text-brand px-3 py-1.5 rounded border border-brand/30 hover:bg-brand hover:text-black transition-colors flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            >
                                                <Swords size={12} /> Challenge
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Section>

            {/* Losing King Rebate Modal */}
            <AnimatePresence>
                {showRebateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
                        >
                            <button onClick={() => setShowRebateModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="w-16 h-16 bg-maroon/20 rounded-full flex items-center justify-center mb-6 text-maroon">
                                <Award size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">The "Losing King" Rebate</h3>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                Did you put up a valiant fight that lasted over 30 minutes, only to get mated? Keep your chin up. Show your game record to the counter and claim a <span className="text-white font-bold">10% loss rebate</span> on your table fee.
                            </p>
                            <div className="bg-dark-900 p-4 rounded-xl border border-white/5 mb-8 text-center">
                                <span className="text-xs text-brand font-bold uppercase tracking-widest block mb-1">Mention Code at Counter</span>
                                <span className="font-mono text-2xl font-black text-white tracking-[0.2em]">GGWP10</span>
                            </div>
                            <Button variant="primary" fullWidth onClick={() => setShowRebateModal(false)}>
                                Back to Board
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Challenge Modal */}
            <AnimatePresence>
                {showChallengeModal && selectedPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl"
                        >
                            <button onClick={() => setShowChallengeModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="w-12 h-12 bg-dark-900 border border-brand/20 rounded-full flex items-center justify-center mb-6 text-brand">
                                <Swords size={20} />
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Schedule Challenge</h3>
                            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                                Request a seated match against <span className="text-white font-bold">{selectedPlayer.name} {selectedPlayer.title && `(${selectedPlayer.title})`}</span>. If accepted, you will receive an email to confirm the table booking.
                            </p>

                            <form className="space-y-4 mb-8" onSubmit={(e) => { e.preventDefault(); alert('Challenge request sent successfully!'); setShowChallengeModal(false); }}>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preferred Date</label>
                                    <input type="date" className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white uppercase outline-none focus:border-brand transition-colors text-sm" required />
                                </div>
                                <Button variant="primary" type="submit" fullWidth className="py-4">
                                    Send Challenge Request
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ChessPage;
