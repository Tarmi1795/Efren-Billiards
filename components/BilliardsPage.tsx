import React, { useEffect } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

const BilliardsPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

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
                    <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300">
                        Book a Table
                    </Button>
                </Reveal>
            </Section>
        </div>
    );
}

export default BilliardsPage;
