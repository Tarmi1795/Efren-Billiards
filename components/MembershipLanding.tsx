import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Facebook, Instagram } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type Plan = {
  id: string;
  name: string;
  initial: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  notIncluded?: string[];
  highlight?: boolean;
  metallicGradient: string;
  textColor: string;
  borderColor: string;
};

const plans: Plan[] = [
  {
    id: 'gold',
    name: 'Gold',
    initial: 'G',
    monthlyPrice: 85,
    annualPrice: 59,
    features: [
      '3 Hours Free Play / Month',
      'Discounted Rate: QAR 30/hr',
      'Free Signature Coffee / Visit',
      'Free Haircut (Coming Soon)',
      '7 Career Coaching Sessions',
      '3 Hours Event Space Usage',
    ],
    highlight: true,
    metallicGradient: 'bg-gradient-to-br from-[#FFFACD]/90 via-[#FFD700]/90 to-[#B8860B]/90',
    textColor: 'text-black',
    borderColor: 'border-[#8B6508]/20',
  },
  {
    id: 'silver',
    name: 'Silver',
    initial: 'S',
    monthlyPrice: 60,
    annualPrice: 42,
    features: [
      '2 Hours Free Play / Month',
      'Discounted Rate: QAR 30/hr',
      '20% Off Food & Drinks',
      '5 Career Coaching Sessions',
      '20% Off Event Space',
    ],
    notIncluded: ['Free Haircut'],
    metallicGradient: 'bg-gradient-to-br from-[#F5F5F5]/90 via-[#C0C0C0]/90 to-[#757575]/90',
    textColor: 'text-black',
    borderColor: 'border-[#404040]/20',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    initial: 'B',
    monthlyPrice: 35,
    annualPrice: 24,
    features: [
      '1 Hour Free Play / Month',
      'Discounted Rate: QAR 30/hr',
      '20% Off Food & Drinks',
      '3 Career Coaching Sessions',
    ],
    notIncluded: ['Priority Booking', 'Event Space Access', 'Free Haircut'],
    metallicGradient: 'bg-gradient-to-br from-[#E8C39E]/90 via-[#CD7F32]/90 to-[#8B4513]/90',
    textColor: 'text-black',
    borderColor: 'border-[#5D2906]/20',
  },
];

const MembershipLanding: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

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
        type: "spring",
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
          className="w-full h-full object-cover scale-[1.35] pointer-events-none"
          src="https://www.youtube.com/embed/RfiLxYAGQYY?autoplay=1&mute=1&loop=1&playlist=RfiLxYAGQYY&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1" 
          title="Background Video" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          style={{ border: 'none' }}
        ></iframe>
      </div>

      {/* Main Content */}
      <section className="relative pt-24 md:pt-40 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center z-10 flex-grow w-full">
        
        {/* Toggle Switch - Segmented Control */}
        <div className="flex items-center mb-12 md:mb-20 border border-white/10 bg-black/40 backdrop-blur-md p-1 rounded-lg">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              'px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-md',
              !isAnnual ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              'px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-md',
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
                  Most Popular ★
                </div>
              )}

              <div className={cn("p-8 flex flex-col h-full relative z-10", plan.textColor)}>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-12 mt-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-2">{plan.name} Tier</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-5xl font-black tracking-tighter">
                        {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">QAR / MO</span>
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
                    'w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border shadow-lg hover:shadow-xl active:scale-95',
                    plan.highlight 
                      ? 'bg-black text-gold border-black hover:bg-gray-900' 
                      : 'bg-black/10 border-black/20 text-black hover:bg-black hover:text-white'
                  )}
                >
                  Select {plan.name}
                </button>
                
                <p className="text-[10px] text-center mt-6 opacity-50 uppercase tracking-widest">Terms & Conditions Apply</p>
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
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.08 1.08-1.15 1.84-.04.52.16 1.09.43 1.48.56.78 1.55 1.25 2.52 1.25.99.01 1.88-.47 2.45-1.25.43-.59.62-1.36.63-2.09.02-4.99 0-9.98 0-14.96.95-.03 1.92 0 2.88 0z"/>
                 </svg>
            </a>
        </div>
      </section>
    </div>
  );
};

export default MembershipLanding;
