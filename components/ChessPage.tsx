import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, X, Hash, Award } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

const ChessPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // State for Puzzle Widget
    const [puzzleAttempt, setPuzzleAttempt] = useState('');
    const [puzzleSolved, setPuzzleSolved] = useState(false);
    const [puzzleError, setPuzzleError] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [showHint, setShowHint] = useState(false);

    // State for Rebate Modal
    const [showRebateModal, setShowRebateModal] = useState(false);

    const handlePuzzleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (attemptsLeft === 0 || puzzleSolved) return;

        // Correct answer for the mock puzzle: "Nf3"
        if (puzzleAttempt.trim().toLowerCase() === 'nf3') {
            setPuzzleSolved(true);
            setPuzzleError(false);
        } else {
            setPuzzleError(true);
            setAttemptsLeft(prev => prev - 1);
            setTimeout(() => setPuzzleError(false), 2000);
        }
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

                {/* Gamification Widget: Puzzle of the Week */}
                <Reveal delay={200} className="mt-24">
                    <div className="bg-dark-800 rounded-3xl p-8 md:p-12 border border-brand/20 shadow-[0_0_40px_rgba(197,160,89,0.1)] relative overflow-hidden text-left">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 w-full">
                                <h3 className="text-brand font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2"><Brain size={16} /> Puzzle of the Week</h3>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Mate in 1</h4>
                                <p className="text-gray-400 mb-6 text-sm leading-relaxed">Solve this week's puzzle for a 10% discount on your next hours of play. White to move.</p>

                                <form onSubmit={handlePuzzleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            disabled={puzzleSolved || attemptsLeft === 0}
                                            value={puzzleAttempt}
                                            onChange={(e) => setPuzzleAttempt(e.target.value)}
                                            placeholder="Enter algebraic notation (e.g., Nf3)"
                                            className={`w-full bg-dark-900 border ${puzzleError ? 'border-red-500' : puzzleSolved ? 'border-green-500' : 'border-white/20 focus:border-brand'} rounded-xl px-4 py-4 text-white uppercase outline-none transition-colors duration-300 placeholder:normal-case font-mono`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold uppercase tracking-wider">{attemptsLeft} attempts left</span>
                                    </div>

                                    {!puzzleSolved ? (
                                        <div className="flex gap-4">
                                            <Button variant="primary" type="submit" className="flex-1 font-black" disabled={attemptsLeft === 0}>Submit Move</Button>
                                            <Button variant="outline" type="button" onClick={() => setShowHint(true)} className="border-white/10" disabled={showHint || attemptsLeft === 0}>Hint</Button>
                                        </div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-900/40 border border-green-500/50 rounded-xl">
                                            <p className="text-green-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-1"><Trophy size={16} /> Brilliant Move!</p>
                                            <p className="text-white">Your Promo Code: <span className="font-mono bg-dark-900 px-2 py-1 rounded text-brand border border-brand/30 ml-2 font-bold tracking-widest">EFRENMATE10</span></p>
                                        </motion.div>
                                    )}

                                    {showHint && !puzzleSolved && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-brand mt-4 italic">
                                            Hint: Look at the knight on d4...
                                        </motion.div>
                                    )}

                                    {attemptsLeft === 0 && !puzzleSolved && (
                                        <p className="text-red-400 text-sm font-bold mt-4 uppercase tracking-wider">Out of attempts. Check back next week!</p>
                                    )}
                                </form>
                            </div>
                            <div className="w-full md:w-64 rounded-xl border-4 border-dark-900 overflow-hidden shadow-2xl bg-white p-2 flex items-center justify-center aspect-square">
                                {/* Mock Chessboard Image */}
                                <img src="https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=400&auto=format&fit=crop" alt="Chess Puzzle Board" className="w-full h-full object-cover filter grayscale" />
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
        </div>
    );
}

export default ChessPage;
