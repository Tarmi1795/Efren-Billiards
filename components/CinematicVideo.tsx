import React, { useState, useRef, useEffect } from 'react';
import Reveal from './ui/Reveal';
import { Volume2, VolumeX } from 'lucide-react';

const CinematicVideo: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (hasInteracted) return;

    const handleFirstInteraction = () => {
      if (!hasInteracted && iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute',
          args: []
        }), '*');
        setIsMuted(false);
        setHasInteracted(true);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [hasInteracted]);

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: action,
        args: []
      }), '*');
      setIsMuted(!isMuted);
      setHasInteracted(true);
    }
  };

  return (
    <div id="cinematic-video" className="relative w-full bg-dark-900 -mt-1 z-0">
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        
        {/* Soft Edges / Vignette Effect */}
        {/* Top Fade */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-dark-900 via-dark-900/60 to-transparent z-20 pointer-events-none"></div>
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent z-20 pointer-events-none"></div>

        {/* Side/Corner Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#0F0F11_100%)] z-20 pointer-events-none opacity-80"></div>

        {/* Color Grading Overlay */}
        <div className="absolute inset-0 bg-brand/10 mix-blend-overlay z-10 pointer-events-none"></div>

        {/* YouTube Embed Container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            {/* 
                scale-[1.35]: Zooms in to ensure coverage and remove potential black bars.
                opacity-60: Blends video into the dark background for a subtle cinematic feel.
            */}
            <iframe 
                ref={iframeRef}
                className="w-full h-full object-cover scale-[1.35] opacity-60 pointer-events-auto"
                src="https://www.youtube.com/embed/KfPa315R4DI?autoplay=1&mute=1&loop=1&playlist=KfPa315R4DI&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1" 
                title="Cinematic Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
            ></iframe>
        </div>

        {/* Sound Toggle Button */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30">
          <button
            onClick={toggleSound}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-brand hover:border-brand transition-all duration-300 group shadow-lg"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <Reveal>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest opacity-40 select-none drop-shadow-2xl">
                    Game On
                </h2>
            </Reveal>
        </div>
      </div>
    </div>
  );
};

export default CinematicVideo;