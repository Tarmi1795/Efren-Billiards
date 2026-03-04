import React, { useEffect } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';

const EventPlacePage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <Reveal>
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <img src="https://iili.io/qK7s4rg.png" className="w-full h-full object-cover scale-105" alt="Premium Event Place" />
                    <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest text-center px-4">Premium Event Place</h1>
                    </div>
                </div>
            </Reveal>

            <Section id="content" className="py-20 max-w-4xl mx-auto px-6 text-center text-gray-300">
                <Reveal variant="fade-up">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
                        From corporate team-building to private birthday celebrations, our versatile event space offers the perfect backdrop.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        We provide customizable layouts, high-end audio-visual equipment, and a dedicated service team to make your gathering truly unforgettable. The space can accommodate both intimate parties and large-scale corporate functions, complete with custom catering and entertainment packages. Let us take care of the details while you enjoy the occasion.
                    </p>
                    <Button variant="primary" onClick={() => window.location.hash = '#contact'} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300">
                        Inquire Now
                    </Button>
                </Reveal>
            </Section>
        </div>
    );
}

export default EventPlacePage;
