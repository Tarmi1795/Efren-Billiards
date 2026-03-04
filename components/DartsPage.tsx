import React, { useEffect } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

const DartsPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <Reveal>
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <img src="https://iili.io/qK7s7gs.md.png" className="w-full h-full object-cover scale-105" alt="Professional Darts" />
                    <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest text-center px-4">Professional Darts</h1>
                    </div>
                </div>
            </Reveal>

            <Section id="content" className="py-20 max-w-4xl mx-auto px-6 text-center text-gray-300">
                <Reveal variant="fade-up">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
                        Step up to the oche in our dedicated darts zone.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Featuring tournament-grade boards and a focused atmosphere, it's the perfect place to sharpen your aim or challenge friends to a high-stakes match. Our electronic and classic steel-tip setups cater to all variants of the game. Get your favorite drink from the cafe and let the friendly competition begin!
                    </p>
                    <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300">
                        Book a Board
                    </Button>
                </Reveal>
            </Section>
        </div>
    );
}

export default DartsPage;
