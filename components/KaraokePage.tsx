import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Square, Search, Music, Star } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

// Mock Add-ons Data
interface ThemeAddon {
    id: string;
    name: string;
    price: number;
}

const themeAddons: ThemeAddon[] = [
    { id: '1', name: 'Neon Party Glasses Set (10x)', price: 30 },
    { id: '2', name: 'Retro Disco Wigs Bundle', price: 80 },
    { id: '3', name: 'Inflatable Guitars & Mics', price: 40 },
    { id: '4', name: 'Smoke Machine Rental', price: 150 },
    { id: '5', name: 'VIP Photobooth Props', price: 50 },
];

const KaraokePage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [showThemeModal, setShowThemeModal] = useState(false);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const totalAddonCost = selectedAddons.reduce((acc, currentId) => {
        const item = themeAddons.find(a => a.id === currentId);
        return acc + (item?.price || 0);
    }, 0);

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <Reveal>
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <img src="https://iili.io/qK7LeFn.png" className="w-full h-full object-cover scale-105" alt="Private Karaoke Rooms" />
                    <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest text-center px-4">Private Karaoke Rooms</h1>
                    </div>
                </div>
            </Reveal>

            <Section id="content" className="py-20 max-w-4xl mx-auto px-6 text-center text-gray-300">
                <Reveal variant="fade-up">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
                        Sing your heart out in our state-of-the-art private karaoke suites.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Featuring an extensive library of international hits updated weekly, premium concert-grade sound systems, and customizable mood lighting options, it's the ultimate social experience. Perfect for birthdays, after-work parties, or just a night out with friends.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
                            Book a Room
                        </Button>
                        <Button variant="outline" onClick={() => setShowThemeModal(true)} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full w-full sm:w-auto flex items-center justify-center gap-2 border-brand text-brand hover:bg-brand hover:text-black transition-colors duration-300">
                            Build Theme Box
                        </Button>
                    </div>
                </Reveal>
            </Section>

            {/* Theme Box Builder Modal */}
            <AnimatePresence>
                {showThemeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-dark-800 border border-white/10 rounded-3xl p-6 md:p-10 max-w-xl w-full relative shadow-[0_0_50px_rgba(197,160,89,0.3)] overflow-y-auto max-h-[90vh]"
                        >
                            <button onClick={() => setShowThemeModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-dark-900 rounded-full p-2">
                                <X size={20} />
                            </button>

                            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
                                <Star className="text-brand" /> Theme Box Builder
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 border-b border-dark-700 pb-6">
                                Upgrade your private room experience by pre-booking prop boxes. We'll have them set up before you arrive!
                            </p>

                            <div className="space-y-3 mb-8">
                                {themeAddons.map((addon) => (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`p-4 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${selectedAddons.includes(addon.id)
                                            ? 'bg-brand/10 border-brand text-white shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                                            : 'bg-dark-900 border-white/5 text-gray-300 hover:border-brand/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-brand">
                                                {selectedAddons.includes(addon.id) ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-600" />}
                                            </div>
                                            <p className="font-bold uppercase tracking-wider text-sm">{addon.name}</p>
                                        </div>
                                        <div className="font-mono text-brand font-black">
                                            +{addon.price} <span className="text-[10px] text-white">QAR</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-dark-700 pt-6 mb-6">
                                <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Total Add-on Cost:</span>
                                <motion.span
                                    key={totalAddonCost}
                                    initial={{ scale: 1.2, color: '#C5A059' }}
                                    animate={{ scale: 1, color: '#fff' }}
                                    className="text-3xl font-black font-mono"
                                >
                                    {totalAddonCost} <span className="text-sm text-brand tracking-widest uppercase font-sans">QAR</span>
                                </motion.span>
                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => {
                                    alert(`Mock Add-ons Saved! Added to your booking intent. Total: ${totalAddonCost} QAR`);
                                    setShowThemeModal(false);
                                }}
                                className="py-4 text-sm"
                            >
                                Save to My Booking
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default KaraokePage;
