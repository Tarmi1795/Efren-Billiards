import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Tournaments', href: '#tournaments' },
    { name: 'Billiards', href: '#billiards' },
    { name: 'Coffee Bar', href: '#coffee-menu' },
    { name: 'Events', href: '#events' },
    { name: 'Membership', href: '#membership-packages' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
    
    // Check if the target element exists in the current view
    const element = document.querySelector(href);
    
    if (element) {
      // If element exists (we are on the right page), prevent default browser jump and scroll smoothly
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
      // Manually update hash so URL reflects current section without reloading/jumping
      window.history.pushState(null, '', href);
    } 
    // If element doesn't exist (e.g. clicking "Tournaments" from Home, or "Billiards" from Tournaments),
    // we let the default anchor behavior happen. The hash changes, App.tsx detects it, and switches the route.
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/90 backdrop-blur-md py-4 shadow-lg border-b border-maroon' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
        
        {/* Logo */}
        <a href="#home" className="flex items-center gap-3 z-50 group" onClick={(e) => handleNavClick(e, '#home')}>
          <img 
            src="https://iili.io/q2fcFYN.png" 
            alt="Efren Billiards Logo" 
            className="h-10 w-auto md:h-12 object-contain"
          />
          <span className="text-xl font-bold tracking-tight uppercase text-white hidden md:block">
            Efren <span className="text-brand">Billiards</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth'})} className="px-4 py-2 text-xs border-maroon text-maroon hover:bg-maroon hover:text-white">
            Book a Table
          </Button>
          <Button variant="primary" onClick={() => window.location.hash = '#membership-packages'} className="px-4 py-2 text-xs">
            Become A Member
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-white z-50 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-dark-900 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-2xl font-bold uppercase text-white hover:text-brand"
            >
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-4 mt-8 w-64">
             <Button variant="primary" fullWidth onClick={() => { setIsOpen(false); window.location.hash = '#membership-packages'; }}>
              Join Club
            </Button>
            <Button variant="outline" fullWidth onClick={() => { setIsOpen(false); document.getElementById('contact')?.scrollIntoView(); }}>
              Book a Table
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;