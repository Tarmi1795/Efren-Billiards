import React, { useEffect } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

const ChessPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

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
                    <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300">
                        Book a Table
                    </Button>
                </Reveal>
            </Section>
        </div>
    );
}

export default ChessPage;
