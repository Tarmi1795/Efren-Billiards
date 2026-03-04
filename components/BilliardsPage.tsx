import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Bell, AlertCircle, ArrowRight } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

// Mock Data Types
interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
    instructor: string;
}

const clinicSlots: TimeSlot[] = [
    { id: '1', time: '14:00 - 14:30', available: true, instructor: 'Coach Alex' },
    { id: '2', time: '15:00 - 15:30', available: false, instructor: 'Coach Alex' },
    { id: '3', time: '16:00 - 16:30', available: false, instructor: 'Coach Sarah' },
    { id: '4', time: '18:00 - 18:30', available: true, instructor: 'Coach Sarah' },
];

const BilliardsPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [showClinicModal, setShowClinicModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [notified, setNotified] = useState<Record<string, boolean>>({});

    const handleNotify = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotified(prev => ({ ...prev, [id]: true }));
    }

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <Reveal>
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <img src="https://iili.io/qK7iGKg.md.jpg" className="w-full h-full object-cover scale-105" alt="World-Class Billiards" />
                    <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest text-center px-4">World-Class Billiards</h1>
                    </div>
                </div>
            </Reveal>

            <Section id="content" className="py-20 max-w-4xl mx-auto px-6 text-center text-gray-300">
                <Reveal variant="fade-up">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
                        Experience the game on professional Yalin tables, the same used in the Qatar Billiard World Cup.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Our tables are meticulously maintained to ensure consistent play for both casual enthusiasts and serious competitors. Whether you're practicing for your next tournament or enjoying a relaxed evening with friends, our billiards area is designed to provide the ultimate playing experience. We offer premium cues, pristine felt, and a dedicated staff ready to reset your racks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
                            Book a Table
                        </Button>
                        <Button variant="outline" onClick={() => setShowClinicModal(true)} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full w-full sm:w-auto flex items-center justify-center gap-2 border-brand text-brand hover:bg-brand hover:text-black transition-colors duration-300">
                            Book Pro Clinic
                        </Button>
                    </div>
                </Reveal>
            </Section>

            {/* Pro Clinic Booking Modal */}
            <AnimatePresence>
                {showClinicModal && (
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
                            className="bg-dark-800 border border-white/10 rounded-3xl p-6 md:p-10 max-w-xl w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]"
                        >
                            <button onClick={() => setShowClinicModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-dark-900 rounded-full p-2">
                                <X size={20} />
                            </button>

                            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
                                30-Min Pro Tune-up <span className="bg-brand text-black text-[10px] tracking-widest px-2 py-1 rounded-full whitespace-nowrap align-middle">NEW</span>
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 border-b border-dark-700 pb-6">
                                Book a quick clinic with our resident pros to fix your stance, stroke, or strategy before your big match. Includes cue demoing.
                            </p>

                            <div className="space-y-3 mb-8">
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                    <Calendar size={14} className="text-brand" /> Today's Slots
                                </h4>

                                {clinicSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        onClick={() => slot.available && setSelectedSlot(slot.id)}
                                        className={`p-4 rounded-xl border flex justify-between items-center transition-all ${!slot.available
                                                ? 'bg-dark-900/50 border-dark-700 opacity-60 cursor-not-allowed'
                                                : selectedSlot === slot.id
                                                    ? 'bg-brand/10 border-brand text-white cursor-pointer shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                                                    : 'bg-dark-900 border-white/5 text-gray-300 hover:border-brand/50 cursor-pointer'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-bold flex items-center gap-2"><Clock size={14} className={selectedSlot === slot.id ? 'text-brand' : 'text-gray-500'} /> {slot.time}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{slot.instructor}</p>
                                        </div>

                                        {!slot.available ? (
                                            notified[slot.id] ? (
                                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1"><Bell size={12} /> Alert Set</span>
                                            ) : (
                                                <button onClick={(e) => handleNotify(slot.id, e)} className="text-xs font-bold bg-dark-800 text-gray-400 px-3 py-1.5 rounded uppercase tracking-wider hover:text-white border border-white/10 transition-colors">
                                                    Notify Me
                                                </button>
                                            )
                                        ) : (
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedSlot === slot.id ? 'border-brand' : 'border-gray-600'}`}>
                                                {selectedSlot === slot.id && <div className="w-2 h-2 bg-brand rounded-full"></div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                disabled={!selectedSlot}
                                onClick={() => alert("Mock Booking Confirmed!")}
                                className="py-4 text-sm"
                            >
                                {selectedSlot ? 'Confirm Booking' : 'Select a Slot'}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default BilliardsPage;
