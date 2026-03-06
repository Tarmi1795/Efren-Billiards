import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
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
import BilliardsPage from './components/BilliardsPage';
import DartsPage from './components/DartsPage';
import ChessPage from './components/ChessPage';
import EventPlacePage from './components/EventPlacePage';
import KaraokePage from './components/KaraokePage';
// ─── Auth Pages ───
import Login from './components/Login';
import ProfileDashboard from './components/ProfileDashboard';

type AppRoute =
  | 'home'
  | 'tournaments'
  | 'coffee-menu'
  | 'terms'
  | 'membership-packages'
  | 'billiards-service'
  | 'darts'
  | 'chess'
  | 'event-place'
  | 'karaoke'
  // ─── New auth routes ───
  | 'login'
  | 'admin-login'
  | 'profile'
  | 'admin-cms';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      // ─── Auth routes ───
      if (hash === '#login') {
        setRoute('login');
        window.scrollTo(0, 0);
      } else if (hash === '#admin-login') {
        setRoute('admin-login');
        window.scrollTo(0, 0);
      } else if (hash === '#profile') {
        setRoute('profile');
        window.scrollTo(0, 0);
      } else if (hash === '#admin-cms') {
        setRoute('admin-cms');
        window.scrollTo(0, 0);
      }
      // ─── Existing routes ───
      else if (hash.startsWith('#tournaments')) {
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
      } else if (hash === '#billiards-service') {
        setRoute('billiards-service');
        window.scrollTo(0, 0);
      } else if (hash === '#darts') {
        setRoute('darts');
        window.scrollTo(0, 0);
      } else if (hash === '#chess') {
        setRoute('chess');
        window.scrollTo(0, 0);
      } else if (hash === '#event-place') {
        setRoute('event-place');
        window.scrollTo(0, 0);
      } else if (hash === '#karaoke') {
        setRoute('karaoke');
        window.scrollTo(0, 0);
      } else {
        setRoute('home');
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

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark-900 text-white selection:bg-brand selection:text-white">
        <Navbar />
        <main>
          {route === 'home' && (
            <>
              <Hero />
              <div className="relative z-20">
                <Membership />
              </div>
              <ServiceShowcase />
              <Highlights />
              <CinematicVideo />
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
          {route === 'billiards-service' && <BilliardsPage />}
          {route === 'darts' && <DartsPage />}
          {route === 'chess' && <ChessPage />}
          {route === 'event-place' && <EventPlacePage />}
          {route === 'karaoke' && <KaraokePage />}

          {/* ─── Auth Routes ─── */}
          {route === 'login' && <Login />}
          {route === 'admin-login' && <Login isAdmin />}
          {route === 'profile' && <ProfileDashboard />}
          {route === 'admin-cms' && (
            <div className="min-h-screen flex items-center justify-center pt-24">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Admin CMS</h1>
                <p className="text-gray-500">Content management coming in Step 4.</p>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;