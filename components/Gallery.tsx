import React, { useState, useEffect } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Gallery: React.FC = () => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await (supabase.from('cms_content') as any)
          .select('*')
          .eq('slug', 'homepage-gallery')
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const content = JSON.parse(data.body);
          setImages(content.images || []);
        } else {
          // Reliable, high-quality Billiards & Lounge images from Unsplash
          setImages([
            "https://iili.io/qfWIEss.jpg", // Billiards Balls
            "https://iili.io/qFN1vwb.jpg", // Darts 1
            "https://iili.io/qFNV7xs.jpg", // Chess 1
            "https://iili.io/q2fFdAP.jpg", // Action Shot
            "https://iili.io/qFNMwcN.jpg", // Darts 2
            "https://iili.io/qfWIMqG.jpg", // Coffee/Vibe
            "https://iili.io/qFNMXPR.jpg", // Chess 2
            "https://iili.io/qfWI1Xn.jpg", // Party/Event
            "https://iili.io/q2f3Qte.jpg", // Dark Vibe
            "https://iili.io/qfWIhdl.jpg", // Table Detail
          ]);
        }
      } catch (err) {
        console.error('Error fetching gallery images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <Section id="gallery" className="bg-dark-900 pt-0">
      <Reveal>
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-brand font-bold uppercase tracking-wider mb-2">The Vibe</h2>
          <p className="text-gray-400">Billiards, Darts, Chess, and good times. A peek inside.</p>
        </div>
      </Reveal>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : images.length > 0 ? (
          images.map((src, idx) => (
            <Reveal key={idx} delay={idx * 50}>
              <div
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-lg mb-4"
                onClick={() => setSelectedImg(src)}
              >
                <img
                  src={src}
                  alt="Club gallery"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-maroon/20 transition-colors"></div>
              </div>
            </Reveal>
          ))) : (
          <div className="col-span-full py-20 text-center text-gray-500">
            <p>No images in the gallery yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            className="absolute top-4 right-4 text-white hover:text-brand"
            onClick={() => setSelectedImg(null)}
          >
            <X size={40} />
          </button>
          <img src={selectedImg} alt="Enlarged view" className="max-w-full max-h-[90vh] rounded-md shadow-2xl border-2 border-brand" />
        </div>
      )}
    </Section>
  );
};

export default Gallery;