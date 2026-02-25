import React, { useState } from 'react';
import Section from './ui/Section';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { Calendar, Trophy, Users, MapPin, ChevronDown, ChevronUp, User } from 'lucide-react';

interface Player {
  name: string;
  rank: string;
  avatar: string;
}

interface Tournament {
  id: number;
  title: string;
  date: string;
  prize: string;
  format: string;
  status: 'Open' | 'Closed' | 'Live';
  players: Player[];
}

const TournamentPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tournaments: Tournament[] = [
    {
      id: 1,
      title: "Qatar 9-Ball Open 2026",
      date: "March 15 - 20, 2026",
      prize: "QAR 50,000",
      format: "Single Elimination, Race to 9",
      status: 'Open',
      players: [
        { name: "Ahmed Al-Saffar", rank: "Pro", avatar: "https://iili.io/q2f3DMb.jpg" },
        { name: "John Doe", rank: "A", avatar: "https://iili.io/q2fFdAP.jpg" },
        { name: "Sarah Smith", rank: "A+", avatar: "https://iili.io/q2fFKog.jpg" },
        { name: "Mike Ross", rank: "Pro", avatar: "https://iili.io/q2f3Qte.jpg" },
      ]
    },
    {
      id: 2,
      title: "Ramadan Late-Night Cup",
      date: "April 05 - 10, 2026",
      prize: "QAR 15,000",
      format: "Double Elimination, Race to 7",
      status: 'Open',
      players: [
        { name: "Khalid M.", rank: "B", avatar: "" },
        { name: "Yousef A.", rank: "A", avatar: "" },
      ]
    },
    {
        id: 3,
        title: "Friday Blitz Tournament",
        date: "Every Friday, 20:00",
        prize: "Entry Fee Pool",
        format: "Lightning Round",
        status: 'Live',
        players: []
    }
  ];

  const togglePlayers = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="pt-20 min-h-screen bg-dark-900">
        <Section id="tournaments-hero" className="bg-dark-900 pb-0">
            <Reveal>
                <div className="text-center mb-16">
                    <span className="text-brand font-bold tracking-widest uppercase mb-2 block">Competitive Scene</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase mb-6">
                        Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-white">Tournaments</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Test your skills against Qatar's best. Register for upcoming events, view brackets, and track your ranking.
                    </p>
                </div>
            </Reveal>
        </Section>

        <Section id="tournament-list" className="bg-dark-900 pt-0">
            <div className="grid gap-8">
                {tournaments.map((t, idx) => (
                    <Reveal key={t.id} delay={idx * 100} width="100%">
                        <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden hover:border-brand transition-colors duration-300">
                            <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6 items-center">
                                {/* Date Box */}
                                <div className="md:col-span-2 flex flex-col items-center justify-center bg-dark-900 rounded-xl p-4 border border-dark-700 text-center h-full">
                                    <Calendar className="text-brand mb-2" />
                                    <span className="text-white font-bold text-sm uppercase">{t.date}</span>
                                </div>

                                {/* Info */}
                                <div className="md:col-span-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white uppercase">{t.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${t.status === 'Open' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                            {t.status} Registration
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                                        <span className="flex items-center gap-1"><Trophy size={16} className="text-maroon"/> Prize: {t.prize}</span>
                                        <span className="flex items-center gap-1"><MapPin size={16} /> Efren Billiards Main Hall</span>
                                        <span className="flex items-center gap-1"><Users size={16} /> {t.players.length} Registered</span>
                                    </div>
                                    <p className="text-gray-500 text-sm italic">{t.format}</p>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-4 flex flex-col gap-3">
                                    <Button variant="primary" fullWidth disabled={t.status !== 'Open'} onClick={() => alert("Registration form would open here!")}>
                                        {t.status === 'Open' ? 'Register Now' : 'Registration Closed'}
                                    </Button>
                                    <button 
                                        onClick={() => togglePlayers(t.id)}
                                        className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white uppercase transition-colors py-2"
                                    >
                                        {expandedId === t.id ? 'Hide Players' : 'View Registered Players'}
                                        {expandedId === t.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                </div>
                            </div>

                            {/* Accordion Player List */}
                            <div className={`bg-dark-900/50 transition-all duration-500 overflow-hidden ${expandedId === t.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 border-t border-dark-700">
                                    <h4 className="text-white font-bold uppercase mb-4 text-sm tracking-wider">Confirmed Participants</h4>
                                    {t.players.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {t.players.map((p, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-dark-800 p-3 rounded-lg border border-dark-700">
                                                    <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center overflow-hidden">
                                                        {p.avatar ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover"/> : <User size={16} className="text-gray-500"/>}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-bold">{p.name}</p>
                                                        <p className="text-xs text-brand">{p.rank}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No players registered yet. Be the first!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </Section>
    </div>
  );
};

export default TournamentPage;