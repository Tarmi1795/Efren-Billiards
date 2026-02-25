import React, { useRef } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const images = [
    { src: "https://iili.io/q2MSG29.md.jpg", alt: "Life at Efren's" },
    { src: "https://iili.io/q2MSWmb.md.jpg", alt: "Tournament Night" },
    { src: "https://iili.io/q2MSM7e.md.jpg", alt: "Premium Tables" },
    { src: "https://iili.io/q2MSVku.md.jpg", alt: "Lounge Vibes" },
    { src: "https://iili.io/q2MSjhx.md.jpg", alt: "Coffee & Billiards" },
    { src: "https://iili.io/q2MSOBV.md.jpg", alt: "Competition" },
    { src: "https://iili.io/q2MSwLQ.md.jpg", alt: "Community" },
    { src: "https://iili.io/q2MSeEB.md.jpg", alt: "Focus" },
    { src: "https://iili.io/q2MSSYF.md.jpg", alt: "Break Shot" },
    { src: "https://iili.io/q2MSUkg.md.jpg", alt: "Victory" },
    { src: "https://iili.io/q2MSgpa.md.jpg", alt: "Strategy" },
    { src: "https://iili.io/q2MS4TJ.md.jpg", alt: "Practice" },
    { src: "https://iili.io/q2MSPQR.md.jpg", alt: "Events" },
    { src: "https://iili.io/q2MSsBp.md.jpg", alt: "Team Play" },
    { src: "https://iili.io/q2MSLEN.md.jpg", alt: "Champions" },
    { src: "https://iili.io/q2MSQ4I.md.jpg", alt: "The Hall" },
    { src: "https://iili.io/q2MSbvn.md.jpg", alt: "Details" },
    { src: "https://iili.io/q2MSmps.md.jpg", alt: "Atmosphere" },
    { src: "https://iili.io/q2MU9jf.md.jpg", alt: "Efren Billiards" },
    { src: "https://iili.io/q2MUdCl.md.jpg", alt: "Join Us" },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Section id="gallery-carousel" className="bg-dark-900 pt-0 pb-16">
      <Reveal>
        <div className="mb-8 px-2">
            <div>
                <h2 className="text-brand font-bold uppercase tracking-wider mb-2">Visual Tour</h2>
                <h3 className="text-3xl font-extrabold text-white uppercase">Life at Efren's</h3>
            </div>
        </div>
      </Reveal>

      <Reveal width="100%" delay={200}>
        <div className="relative group">
            {/* Left Button */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-brand hover:scale-110 transition-all backdrop-blur-sm shadow-lg border border-white/10"
                aria-label="Previous image"
            >
                <ChevronLeft size={32} />
            </button>

            {/* Right Button */}
            <button 
                onClick={() => scroll('right')}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-brand hover:scale-110 transition-all backdrop-blur-sm shadow-lg border border-white/10"
                aria-label="Next image"
            >
                <ChevronRight size={32} />
            </button>

            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 no-scrollbar scroll-smooth relative z-10 px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((img, idx) => (
                    <div 
                        key={idx} 
                        className="flex-none w-[300px] md:w-[450px] aspect-video relative group/item snap-center rounded-xl overflow-hidden cursor-pointer shadow-lg bg-dark-800"
                    >
                        <img 
                            src={img.src} 
                            alt={img.alt} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110 group-hover/item:rotate-1" 
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <p className="text-white font-bold uppercase tracking-wider translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300">
                                {img.alt}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </Reveal>
    </Section>
  );
};

export default ImageCarousel;