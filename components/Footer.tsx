import React from 'react';
import { Instagram, Facebook, Linkedin, MapPin } from 'lucide-react';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

const Footer: React.FC = () => {
  const { data: socialLinks } = useCMSContent('social-links', {
    facebook: 'https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm',
    tiktok: 'https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp',
    whatsapp: 'https://wa.me/97451622111',
    linkedin: '',
    googleBusinessProfile: ''
  });

  const { data: contactInfo } = useCMSContent('contact-info', {
    address: '5th Floor Capstone Bldg., Al Mansoura, Doha, Qatar',
    mapsUrl: 'https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic'
  });

  return (
    <footer className="bg-dark-900 border-t border-dark-800 pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">

          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-bold uppercase text-white text-lg">Efren <span className="text-brand">Billiards</span></span>
            </div>
            <p className="text-gray-500 mb-6">
              Qatar's premier destination for billiards, specialty coffee, and social events.
            </p>
            <div className="flex gap-4">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Facebook size={20} /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Instagram size={20} /></a>}
              {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.08 1.08-1.15 1.84-.04.52.16 1.09.43 1.48.56.78 1.55 1.25 2.52 1.25.99.01 1.88-.47 2.45-1.25.43-.59.62-1.36.63-2.09.02-4.99 0-9.98 0-14.96.95-.03 1.92 0 2.88 0z" />
                </svg>
              </a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-gray-400 hover:text-brand transition-colors"><Linkedin size={20} /></a>}
              {socialLinks.googleBusinessProfile && <a href={socialLinks.googleBusinessProfile} target="_blank" rel="noopener noreferrer" title="Google Business Profile" className="text-gray-400 hover:text-brand transition-colors"><MapPin size={20} /></a>}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#home" onClick={(e) => handleHashClick(e, '#home')} className="hover:text-brand transition-colors">Home</a></li>
              <li><a href="#gallery" onClick={(e) => handleHashClick(e, '#gallery')} className="hover:text-brand transition-colors">Gallery</a></li>
              <li><a href="#contact" onClick={(e) => handleHashClick(e, '#contact')} className="hover:text-brand transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Our Services</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#billiards-service" onClick={(e) => handleHashClick(e, '#billiards-service')} className="hover:text-brand transition-colors">Billiards</a></li>
              <li><a href="#coffee-menu" onClick={(e) => handleHashClick(e, '#coffee-menu')} className="hover:text-brand transition-colors">Sports Cafe</a></li>
              <li><a href="#event-place" onClick={(e) => handleHashClick(e, '#event-place')} className="hover:text-brand transition-colors">Events Place</a></li>
              <li><a href="#tournaments" onClick={(e) => handleHashClick(e, '#tournaments')} className="hover:text-brand transition-colors">Tournaments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Membership</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#membership-packages" onClick={(e) => handleHashClick(e, '#membership-packages')} className="hover:text-brand transition-colors">View Plans</a></li>
              <li><a href="#terms" onClick={(e) => handleHashClick(e, '#terms')} className="hover:text-brand transition-colors">House Rules</a></li>
              <li><a href="#tournaments" onClick={(e) => handleHashClick(e, '#tournaments')} className="hover:text-brand transition-colors">League Signups</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Find Us</h4>
            {contactInfo.address && (
              <>
                {contactInfo.address.split(',').map((line: string, i: number) => (
                  <p key={i} className="text-gray-500 mb-1">{line.trim()}</p>
                ))}
              </>
            )}
            <div className="mt-4">
              <a href={contactInfo.mapsUrl || "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"} target="_blank" className="text-brand font-bold uppercase underline hover:text-white transition-colors">Get Directions</a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 gap-4">
          <p>© 2026 Efren Billiards and Events Place. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#terms" onClick={(e) => handleHashClick(e, '#terms')} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" onClick={(e) => handleHashClick(e, '#terms')} className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;