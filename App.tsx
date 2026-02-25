import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CinematicVideo from './components/CinematicVideo';
import ImageCarousel from './components/ImageCarousel';
import Highlights from './components/Highlights';
import Facilities from './components/Facilities';
import Membership from './components/Membership';
import Timetable from './components/Timetable';
import Youth from './components/Youth';
import Events from './components/Events';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TournamentPage from './components/TournamentPage';
import CoffeeMenuPage from './components/CoffeeMenuPage';
import TermsAndConditions from './components/TermsAndConditions';
import MembershipLanding from './components/MembershipLanding';
import ServiceShowcase from './components/ServiceShowcase';

const App: React.FC = () => {
  const [route, setRoute] = useState<'home' | 'tournaments' | 'coffee-menu' | 'terms' | 'membership-packages'>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#tournaments') {
        setRoute('tournaments');
        window.scrollTo(0, 0);
      } else if (hash === '#coffee-menu') {
        setRoute('coffee-menu');
        window.scrollTo(0, 0);
      } else if (hash === '#terms') {
        setRoute('terms');
        window.scrollTo(0, 0);
      } else if (hash === '#membership-packages') {
        setRoute('membership-packages');
        window.scrollTo(0, 0);
      } else {
        setRoute('home');
        // If hash refers to a specific section on home, wait for render then scroll
        setTimeout(() => {
            if (hash && hash !== '#home') {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            } else if (hash === '#home' || !hash) {
                window.scrollTo(0, 0);
            }
        }, 100);
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white selection:bg-brand selection:text-white">
      <Navbar />
      <main>
        {route === 'home' && (
          <>
            <Hero />
            {/* Membership moved to top for higher conversion priority */}
            <div className="relative z-20">
               <Membership />
            </div>
            <ServiceShowcase />
            {/* Highlights moved after Membership (Packages) */}
            <Highlights />
            <CinematicVideo />
            {/* PromoBanner removed as it's now part of Hero */}
            <Facilities />
            <ImageCarousel />
            <Youth />
            <Events />
            <Timetable />
            <Gallery />
            <Contact />
          </>
        )}
        {route === 'tournaments' && <TournamentPage />}
        {route === 'coffee-menu' && <CoffeeMenuPage />}
        {route === 'terms' && <TermsAndConditions />}
        {route === 'membership-packages' && <MembershipLanding />}
      </main>
      <Footer />
    </div>
  );
};

export default App;