import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Facebook, Instagram, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCMSContent } from '../hooks/useCMSContent';

// Utility for merging classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type Plan = {
  id: string;
  name: string;
  initial?: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  notIncluded?: string[];
  highlight?: boolean;
  metallicGradient?: string;
  textColor?: string;
  borderColor?: string;
};

const MembershipLanding: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: cmsData, loading } = useCMSContent('membership-plans', {
    plans: [
      {
        id: 'gold',
        name: 'Gold',
        priceMonthly: 85,
        priceAnnual: 59,
        features: [
          'Free 3 hours playing time monthly',
          'Discounted table rate: QAR30/hour',
          'Free 1 large Efren signature coffee per visit',
          'Free haircut (Soon to offer)',
          'Free use of event place for 3 hours on your birthday (Valued @ QAR600)',
          '20% Discounts in food and drinks',
          '20% discount on event place rental',
          '20% discount on photobooth and 360 videbooth rental',
          'Free 7 sessions of professional career coaching (transferrable)'
        ],
        highlight: true,
      },
      {
        id: 'silver',
        name: 'Silver',
        priceMonthly: 60,
        priceAnnual: 42,
        features: [
          'Free 2 hours playing time monthly',
          'Discounted table rate: QAR30/hour',
          'Free haircut (Soon to offer)',
          'Free use of event place for 2 hours on your birthday (Valued @ QAR400)',
          '20% Discounts in food and drinks',
          '20% discount on event place rental',
          '20% discount on photobooth and 360 videbooth rental',
          'Free 5 sessions of professional career coaching (transferrable)'
        ],
      },
      {
        id: 'bronze',
        name: 'Bronze',
        priceMonthly: 35,
        priceAnnual: 24,
        features: [
          'Free 1 hour playing time monthly',
          'Discounted table rate: QAR30/hour',
          'Free haircut (Soon to offer)',
          'Free use of event place for 1 hour on your birthday (Valued @ QAR200)',
          '20% Discounts in food and drinks',
          '20% discount on event place rental',
          '20% discount on photobooth and 360 videbooth rental',
          'Free 3 sessions of professional career coaching (transferrable)'
        ],
      },
    ]
  });

  const plans: Plan[] = (cmsData.plans || []).map((p: any) => ({
    ...p,
    initial: p.name?.[0] || 'M',
    monthlyPrice: p.priceMonthly,
    annualPrice: p.priceAnnual,
    highlight: p.isGold || p.popular,
    metallicGradient: p.isGold || p.id === 'gold'
      ? 'bg-gradient-to-br from-[#FFFACD]/90 via-[#FFD700]/90 to-[#B8860B]/90' 
      : p.popular || p.id === 'silver'
        ? 'bg-gradient-to-br from-[#F5F5F5]/90 via-[#C0C0C0]/90 to-[#757575]/90'
        : 'bg-gradient-to-br from-[#E8C39E]/90 via-[#CD7F32]/90 to-[#8B4513]/90',
    textColor: 'text-black',
    borderColor: p.isGold || p.id === 'gold'
      ? 'border-[#8B6508]/20' 
      : p.popular || p.id === 'silver'
        ? 'border-[#404040]/20'
        : 'border-[#5D2906]/20'
  }));

  const { data: videoData } = useCMSContent('videos', {
    videos: [
      { title: 'Hero Background', url: 'https://www.youtube.com/embed/RfiLxYAGQYY' },
      { title: 'Cinematic Highlights', url: 'https://www.youtube.com/embed/KfPa315R4DI' },
      { title: 'Membership Background', url: 'https://www.youtube.com/embed/RfiLxYAGQYY' }
    ]
  });

  const cmsVideoUrl = videoData.videos?.[2]?.url || videoData.videos?.[0]?.url;
  const bgUrl = cmsVideoUrl || 'https://www.youtube.com/embed/RfiLxYAGQYY';
  const isVideo = bgUrl.includes('youtube.com') || bgUrl.includes('youtu.be');

  let embedUrl = bgUrl;
  if (isVideo) {
      let videoId = '';
      if (bgUrl.includes('v=')) {
          videoId = bgUrl.split('v=')[1]?.split('&')[0];
      } else if (bgUrl.includes('youtu.be/')) {
          videoId = bgUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (bgUrl.includes('embed/')) {
          videoId = bgUrl.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1`;
      }
  }

  useEffect(() => {
    if (hasInteracted || !isVideo) return;

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

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: (index: number) => ({
      x: typeof window !== 'undefined' && window.innerWidth >= 768 ? `-${index * 110}%` : 0, // Stack on left for desktop
      y: typeof window !== 'undefined' && window.innerWidth < 768 ? 50 : 0, // Slide up for mobile
      opacity: 0,
      scale: 0.9,
      rotate: typeof window !== 'undefined' && window.innerWidth >= 768 ? -5 * (2 - index) : 0, // Fan effect
    }),
    visible: (index: number) => ({
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 60,
        damping: 12,
        mass: 1,
        delay: index * 0.15, // Manual stagger
      },
    }),
  };

  return (
    <div className='min-h-screen font-sans overflow-hidden flex flex-col relative text-white'>

      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black/60 z-10"></div> {/* Dark Overlay */}
        <iframe
          ref={iframeRef}
          className="w-full h-full object-cover scale-[1.35] pointer-events-auto"
          src={embedUrl}
          title="Background Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          style={{ border: 'none' }}
        ></iframe>
      </div>

      {/* Sound Toggle Button */}
      <div className="absolute top-24 right-6 md:top-32 md:right-10 z-20">
        <button
          onClick={toggleSound}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-gold hover:border-gold hover:text-black transition-all duration-300 group shadow-lg"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <section className="relative pt-24 md:pt-40 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center z-10 flex-grow w-full">

        {/* Convincing Social Media CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24 w-full max-w-4xl text-center relative px-4"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] -z-10 border border-white/5 shadow-2xl backdrop-blur-sm"></div>

          <div className="py-12 md:py-16 px-6">
            <span className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">Limited Time Membership Open</span>
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase mb-6 leading-tight">
              Ready to <span className="text-gold">Level Up</span> Your Game?
            </h2>
            <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-widest mb-10 max-w-xl mx-auto leading-loose">
              Don't just be a player. Be part of the legacy. Join Qatar's premium community for billiards, networking, and elite experiences. Your seat at the table is waiting.
            </p>

            <button
              onClick={() => window.open('https://wa.me/97451622111?text=Hi! I saw your post. I want to join the Efren Billiards community.', '_blank')}
              className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-sm uppercase text-black bg-gold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:shadow-[0_0_50px_rgba(197,160,89,0.5)]"
            >
              Get My MEMBERSHIP Access
            </button>

            <div className="mt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
              <span className="flex items-center gap-2"><Check size={12} strokeWidth={3} /> No Hidden Fees</span>
              <span className="flex items-center gap-2"><Check size={12} strokeWidth={3} /> Instant Approval</span>
              <span className="flex items-center gap-2"><Check size={12} strokeWidth={3} /> Community Perks</span>
            </div>
          </div>
        </motion.div>

        {/* Toggle Switch - Segmented Control */}
        <div className="flex items-center mb-12 md:mb-20 border border-white/10 bg-black/40 backdrop-blur-md p-1 rounded-lg">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              'px-8 py-3 text-sm font-bold uppercase transition-all duration-300 rounded-md',
              !isAnnual ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              'px-8 py-3 text-sm font-bold uppercase transition-all duration-300 rounded-md',
              isAnnual ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            )}
          >
            Annual <span className="text-[10px] ml-1 opacity-70">(-30%)</span>
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className={cn(
                "relative flex flex-col border transition-transform duration-300 hover:-translate-y-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm",
                plan.metallicGradient,
                plan.borderColor
              )}
            >
              {/* Shine Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Most Popular Ribbon */}
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 bg-black/90 text-gold text-[10px] font-bold uppercase tracking-[0.2em] py-2 text-center z-20 border-b border-gold/30">
                  {plan.id === 'gold' || (plan as any).isGold ? 'Best Value ★' : 'Most Popular ★'}
                </div>
              )}

              <div className={cn("p-8 flex flex-col h-full relative z-10", plan.textColor)}>

                {/* Header */}
                <div className="flex justify-between items-start mb-12 mt-4">
                  <div>
                    <h3 className="text-2xl font-bold uppercase opacity-90 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-4xl font-extrabold tracking-tighter">
                        {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-sm font-medium opacity-70"> / month</span>
                    </div>
                  </div>
                  {/* Oversized Initial */}
                  <span className="font-serif text-8xl leading-none opacity-20 mix-blend-overlay">
                    {plan.initial}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-12 flex-grow">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Check size={16} strokeWidth={2} className="shrink-0 mt-0.5 opacity-80" />
                      <span className="text-xs uppercase tracking-wider font-semibold leading-relaxed opacity-90">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded?.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 opacity-40">
                      <X size={16} strokeWidth={2} className="shrink-0 mt-0.5" />
                      <span className="text-xs uppercase tracking-wider leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    const text = `Hi, I am interested in the *${plan.name} Membership* (${isAnnual ? 'Annual' : 'Monthly'} Plan).`;
                    window.open(`https://wa.me/97451622111?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className={cn(
                    'w-full py-4 text-sm font-bold uppercase transition-all duration-300 border shadow-lg hover:shadow-xl active:scale-95',
                    plan.highlight
                      ? 'bg-black text-gold border-black hover:bg-gray-900'
                      : 'bg-black/10 border-black/20 text-black hover:bg-black hover:text-white'
                  )}
                >
                  Be A {plan.name} Member Now!
                </button>

                <p className="text-[10px] text-center mt-6 opacity-50 uppercase tracking-widest">
                  <a href="#terms" className="hover:text-gold transition-colors underline">Terms & Conditions Apply</a>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Media Links */}
        <div className="mt-24 flex gap-12 justify-center items-center">
          <a href="https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className={cn("transition-colors duration-300 hover:scale-110 text-gray-400 hover:text-white")}>
            <Facebook size={24} strokeWidth={1.5} />
          </a>
          <a href="https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm" target="_blank" rel="noopener noreferrer" className={cn("transition-colors duration-300 hover:scale-110 text-gray-400 hover:text-white")}>
            <Instagram size={24} strokeWidth={1.5} />
          </a>
          <a href="https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp" target="_blank" rel="noopener noreferrer" className={cn("transition-colors duration-300 hover:scale-110 text-gray-400 hover:text-white")}>
            {/* Custom TikTok Icon */}
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.08 1.08-1.15 1.84-.04.52.16 1.09.43 1.48.56.78 1.55 1.25 2.52 1.25.99.01 1.88-.47 2.45-1.25.43-.59.62-1.36.63-2.09.02-4.99 0-9.98 0-14.96.95-.03 1.92 0 2.88 0z" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default MembershipLanding;
