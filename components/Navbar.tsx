import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

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
    { name: 'Membership', href: '#membership-packages' },
    { name: 'Contact', href: '#contact' },
  ];

  const serviceLinks = [
    { name: 'Billiards', href: '#billiards-service' },
    { name: 'Darts', href: '#darts' },
    { name: 'Chess', href: '#chess' },
    { name: 'Sports Cafe', href: '#coffee-menu' },
    { name: 'Premium Event Place', href: '#event-place' },
    { name: 'Private Karaoke', href: '#karaoke' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
    // Check if the target element exists in the current view
    const element = document.querySelector(href);

    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', href);
    }
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
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
            Home
          </a>
          <a href="#tournaments" onClick={(e) => handleNavClick(e, '#tournaments')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
            Tournaments
          </a>

          {/* Services Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors py-2 outline-none">
              Services <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute top-full left-0 mt-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 z-50 pt-2">
              <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                {serviceLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-black hover:bg-brand transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <a href="#membership-packages" onClick={(e) => handleNavClick(e, '#membership-packages')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
            Membership
          </a>
          <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
            Contact
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Button variant="outline" onClick={() => { window.location.hash = '#contact'; }} className="px-4 py-2 text-xs border-maroon text-maroon hover:bg-maroon hover:text-white">
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
        <div className={`fixed inset-0 bg-dark-900 z-40 flex flex-col items-center justify-center gap-6 transition-transform duration-500 ease-in-out lg:hidden overflow-y-auto pt-24 pb-12 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="text-xl font-bold uppercase text-white hover:text-brand">Home</a>
          <a href="#tournaments" onClick={(e) => handleNavClick(e, '#tournaments')} className="text-xl font-bold uppercase text-white hover:text-brand">Tournaments</a>

          <div className="flex flex-col items-center w-full">
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="flex items-center gap-2 text-xl font-bold uppercase text-white hover:text-brand mb-2"
            >
              Services <ChevronDown size={20} className={`transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`flex flex-col items-center gap-4 overflow-hidden transition-all duration-300 w-full ${mobileServicesOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              {serviceLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { handleNavClick(e, link.href); setMobileServicesOpen(false); }}
                  className="text-lg font-bold uppercase tracking-wider text-gray-400 hover:text-brand"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <a href="#membership-packages" onClick={(e) => handleNavClick(e, '#membership-packages')} className="text-xl font-bold uppercase text-white hover:text-brand">Membership</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-xl font-bold uppercase text-white hover:text-brand">Contact</a>

          <div className="flex flex-col gap-4 mt-8 w-64">
            <Button variant="primary" fullWidth onClick={() => { setIsOpen(false); window.location.hash = '#membership-packages'; }}>
              Join Club
            </Button>
            <Button variant="outline" fullWidth onClick={() => { setIsOpen(false); window.location.hash = '#contact'; }}>
              Book a Table
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;