import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import { Coffee, Citrus, Croissant, QrCode, ArrowRight } from 'lucide-react';

const CoffeeMenuPage: React.FC = () => {
  const categories = [
    {
      title: "Espresso Bar",
      icon: <Coffee size={24} className="text-brand" />,
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
      items: [
        { name: "Signature Spanish Latte", price: "24 QAR" },
        { name: "V60 Pour Over", price: "28 QAR" },
        { name: "Double Espresso", price: "18 QAR" },
        { name: "Iced Americano", price: "20 QAR" }
      ]
    },
    {
      title: "Mocktails & Coolers",
      icon: <Citrus size={24} className="text-brand" />,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
      items: [
        { name: "Passion Fruit Mojito", price: "26 QAR" },
        { name: "Blue Lagoon", price: "26 QAR" },
        { name: "Lemon Mint Crush", price: "22 QAR" },
        { name: "Classic Iced Tea", price: "18 QAR" }
      ]
    },
    {
      title: "Snacks & Pastries",
      icon: <Croissant size={24} className="text-brand" />,
      image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800&auto=format&fit=crop",
      items: [
        { name: "Honey Cake", price: "32 QAR" },
        { name: "Cheese Croissant", price: "18 QAR" },
        { name: "Chicken Club Sandwich", price: "38 QAR" },
        { name: "Truffle Fries", price: "28 QAR" }
      ]
    }
  ];

  // Properly encode the URL for the QR code generator, especially the '#' character
  const targetUrl = "https://efren-billiards-and-events-place-359701191378.us-west1.run.app/#coffee-menu";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

  return (
    <div className="pt-20 min-h-screen bg-dark-900">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden border-b border-maroon">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop" 
            alt="Coffee Bar Background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <Reveal>
            <h1 className="text-5xl md:text-7xl font-extrabold uppercase text-white mb-4">
              The <span className="text-brand">Coffee Bar</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Premium beans, handcrafted mocktails, and the perfect atmosphere to recharge.
            </p>
          </Reveal>
        </div>
      </div>

      <Section id="qr-menu" className="bg-dark-900">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* QR Code Section */}
          <div className="bg-white text-dark-900 p-8 rounded-2xl shadow-glow transform rotate-1 md:rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto md:mx-0">
            <div className="border-4 border-dark-900 p-4 rounded-xl mb-6">
              <img 
                src={qrCodeUrl} 
                alt="Menu QR Code" 
                className="w-full h-auto"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold uppercase mb-2">Scan for Full Menu</h3>
              <p className="text-gray-600 font-medium">View detailed ingredients and seasonal specials on your phone.</p>
              <div className="mt-6 flex justify-center">
                <QrCode size={32} className="text-maroon animate-pulse" />
              </div>
            </div>
          </div>

          {/* Intro Text */}
          <div>
            <Reveal delay={200}>
              <span className="text-brand font-bold tracking-widest uppercase mb-2 block">Taste the Quality</span>
              <h2 className="text-4xl font-extrabold text-white uppercase mb-6">More Than Just A Break</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Our coffee bar isn't an afterthought. It's a destination. We partner with top local roasters to bring you specialty grade coffee. 
                Whether you need a caffeine kick before a tournament or a refreshing mocktail to cool down, we've got you covered.
              </p>
              <Button variant="outline" onClick={() => document.getElementById('preview-list')?.scrollIntoView({behavior: 'smooth'})}>
                Preview Favorites <ArrowRight size={16} className="ml-2" />
              </Button>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Menu Preview Grid */}
      <Section id="preview-list" className="bg-dark-800">
        <div className="text-center mb-16">
          <Reveal>
             <h2 className="text-3xl font-bold text-white uppercase">Menu Highlights</h2>
          </Reveal>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Reveal key={idx} delay={idx * 150} variant="fade-up">
              <div className="bg-dark-900 rounded-xl border border-dark-700 hover:border-brand transition-colors h-full overflow-hidden group flex flex-col">
                
                {/* Graphical Header */}
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 p-3 bg-dark-800/90 backdrop-blur rounded-lg shadow-lg border border-dark-700">
                     {cat.icon}
                  </div>
                </div>

                <div className="p-8 pt-4 flex-grow">
                  <h3 className="text-xl font-bold text-white uppercase mb-6 pl-1">{cat.title}</h3>
                  <ul className="space-y-6">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex justify-between items-end border-b border-dark-700 pb-2 border-dashed">
                        <span className="text-gray-300 font-medium">{item.name}</span>
                        <span className="text-brand font-bold">{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        
        <div className="text-center mt-12">
           <p className="text-gray-500 text-sm">Prices and availability subject to change. Please scan QR for live menu.</p>
        </div>
      </Section>
    </div>
  );
};

export default CoffeeMenuPage;