import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';
import Reveal from './ui/Reveal';

interface GameGalleryProps {
    gameType: 'billiards' | 'chess' | 'darts';
}

const defaultContent = {
    billiards: {
        title: "World-Class Yalin Tables",
        images: [
            "https://images.unsplash.com/photo-1595859703086-1d1230e87dcb?q=80&w=1470&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1549488344-c6b12a0614f1?q=80&w=1470&auto=format&fit=crop"
        ]
    },
    chess: {
        title: "Premium Chess Lounge",
        images: [
            "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1471&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=1476&auto=format&fit=crop"
        ]
    },
    darts: {
        title: "Tournament-Grade Darts",
        images: [
            "https://images.unsplash.com/photo-1629168953153-f7cc8cbee015?q=80&w=1470&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596728362799-923cb5c1c876?q=80&w=1470&auto=format&fit=crop"
        ]
    }
};

const GameGallery: React.FC<GameGalleryProps> = ({ gameType }) => {
    const { data: galleryData, loading } = useCMSContent(`game-gallery-${gameType}`, defaultContent[gameType]);
    
    const [currentIndex, setCurrentIndex] = useState(0);

    const title = galleryData?.title || defaultContent[gameType].title;
    const images = galleryData?.images || defaultContent[gameType].images;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (loading) return null;
    if (!images || images.length === 0) return null;

    return (
        <div className="py-16 max-w-5xl mx-auto px-6">
            <Reveal variant="fade-up">
                <div className="text-center mb-8">
                    <p className="text-brand font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 mb-2">
                        <ImageIcon size={16} /> Gallery
                    </p>
                    <h3 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">{title}</h3>
                </div>

                <div className="relative rounded-3xl overflow-hidden group border border-white/10 shadow-2xl bg-dark-900 aspect-video md:aspect-[21/9]">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex]}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full object-cover"
                            alt={`${gameType} gallery image ${currentIndex + 1}`}
                        />
                    </AnimatePresence>

                    {images.length > 1 && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            <button 
                                onClick={handlePrev} 
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-brand text-white hover:text-black rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={handleNext} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-brand text-white hover:text-black rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                            >
                                <ChevronRight size={24} />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_: any, idx: number) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === idx ? 'bg-brand w-8' : 'bg-white/50 hover:bg-white'}`}
                                        title={`Go to image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </Reveal>
        </div>
    );
};

export default GameGallery;
