import React, { useState, useEffect } from 'react';
import {
    Users, Trophy, Coffee, Layout, Settings,
    Search, Filter, Shield, UserPlus,
    ChevronRight, MoreVertical, CheckCircle, XCircle, Loader2,
    Image as ImageIcon, Plus, Save, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';
import AdminTournaments from './AdminTournaments';
import AdminPlayers from './AdminPlayers';
import type { Profile, MembershipTier } from '../types/database';

type CMSModule = 'hero' | 'gallery' | 'tournaments' | 'players' | 'members' | 'settings';

const AdminCMS: React.FC = () => {
    const { profile, loading: authLoading } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [activeModule, setActiveModule] = useState<CMSModule>('hero');
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);

    // Real Content State
    const [heroData, setHeroData] = useState({
        title: '',
        subtitle: '',
        cta: ''
    });

    // Gallery State
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!profile || profile.tier !== 'Admin')) {
            window.location.hash = '#home';
        }
    }, [profile, authLoading]);

    // Fetch Hero & Content
    useEffect(() => {
        if (activeModule === 'hero') {
            fetchHeroData();
        } else if (activeModule === 'gallery') {
            fetchGalleryData();
        }
    }, [activeModule]);

    const fetchHeroData = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'homepage-hero')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                const content = JSON.parse(data.body);
                setHeroData({
                    title: data.title,
                    subtitle: content.subtitle || '',
                    cta: content.cta || ''
                });
            } else {
                setHeroData({
                    title: 'The Ultimate Billiards Experience',
                    subtitle: 'A premium members-only club where legends are built and the game never ends.',
                    cta: 'Join the Lounge'
                });
            }
        } catch (err: any) {
            console.error('Error fetching hero content:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGalleryData = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'homepage-gallery')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                const content = JSON.parse(data.body);
                setGalleryImages(content.images || []);
            } else {
                // Initial defaults
                setGalleryImages([
                    "https://iili.io/qfWIEss.jpg",
                    "https://iili.io/qFN1vwb.jpg",
                    "https://iili.io/qFNV7xs.jpg",
                    "https://iili.io/q2fFdAP.jpg"
                ]);
            }
        } catch (err: any) {
            console.error('Error fetching gallery content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch members when on members module
    useEffect(() => {
        if (activeModule === 'members') {
            fetchMembers();
        }
    }, [activeModule]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data: profilesData, error: profilesError } = await (supabase.from('profiles') as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            const { data: playersData, error: playersError } = await (supabase.from('players') as any)
                .select('id, wins, losses, rating');

            if (playersError) {
                console.warn('Could not fetch players for stats:', playersError);
            }

            const playersMap = new Map((playersData || []).map((p: any) => [p.id, p]));

            const merged = (profilesData || []).map((profile: any) => ({
                ...profile,
                player: playersMap.get(profile.id) || null
            }));

            setMembers(merged);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateMemberTier = async (id: string, tier: MembershipTier) => {
        try {
            const { error } = await (supabase.from('profiles') as any)
                .update({ tier })
                .eq('id', id);

            if (error) throw error;
            showToast('Member tier updated successfully', 'success');
            fetchMembers();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleSaveHero = async () => {
        setSaving(true);
        try {
            const body = JSON.stringify({
                subtitle: heroData.subtitle,
                cta: heroData.cta
            });

            // Upsert the content
            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug: 'homepage-hero',
                    title: heroData.title,
                    body: body,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Homepage Hero updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveGallery = async () => {
        setSaving(true);
        try {
            const body = JSON.stringify({ images: galleryImages });

            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug: 'homepage-gallery',
                    title: 'Image Gallery',
                    body: body,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Gallery updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addGalleryImage = () => {
        if (!newImageUrl) return;
        setGalleryImages([newImageUrl, ...galleryImages]);
        setNewImageUrl('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('cms_uploads')
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cms_uploads')
                .getPublicUrl(fileName);

            setGalleryImages([publicUrlData.publicUrl, ...galleryImages]);
            showToast('Image uploaded successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Error uploading file', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !profile || profile.tier !== 'Admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <Loader2 size={32} className="text-brand animate-spin" />
            </div>
        );
    }

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone?.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex">
            <ToastContainer />

            {/* ── Sidebar ── */}
            <aside className="w-72 border-r border-white/5 bg-[#0d0d0f] flex flex-col pt-24 shadow-2xl">
                <div className="flex-1 px-4 space-y-8">
                    {/* Site Builder Section */}
                    <div className="space-y-2">
                        <div className="px-4 mb-4">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Site Builder</p>
                        </div>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveModule('hero')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === 'hero' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layout size={18} />
                                Hero Section
                            </button>
                            <button
                                onClick={() => setActiveModule('gallery')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === 'gallery' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <ImageIcon size={18} />
                                Image Gallery
                            </button>
                        </nav>
                    </div>

                    {/* Club Management Section */}
                    <div className="space-y-2">
                        <div className="px-4 mb-4">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Club Management</p>
                        </div>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveModule('tournaments')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === 'tournaments' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Trophy size={18} />
                                Tournaments
                            </button>
                            <button
                                onClick={() => setActiveModule('players')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === 'players' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Users size={18} />
                                Players
                            </button>
                            <button
                                onClick={() => setActiveModule('members')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === 'members' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Shield size={18} />
                                Members
                            </button>
                            <button
                                onClick={() => setActiveModule('settings')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === 'settings' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Settings size={18} />
                                Settings
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col gap-3">
                    <a
                        href="/#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10 hover:border-white/20"
                    >
                        <ExternalLink size={16} />
                        View Live Site
                    </a>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-black">
                            {profile.full_name?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{profile.full_name || 'Administrator'}</p>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <main className="flex-1 flex flex-col pt-24 min-w-0 bg-[#0a0a0c]">
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Hero Module */}
                    {activeModule === 'hero' && (
                        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Hero Section</h1>
                                    <p className="text-gray-500 text-sm mt-1">Directly edit the content of your homepage hero area.</p>
                                </div>
                                <button
                                    onClick={handleSaveHero}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Content
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Layout size={120} />
                                    </div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-brand rounded-full" />
                                        Main Introduction
                                    </h3>
                                    <div className="space-y-6 max-w-2xl relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Heading</label>
                                            <input
                                                type="text"
                                                value={heroData.title}
                                                onChange={e => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-brand/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Sub-heading</label>
                                            <textarea
                                                value={heroData.subtitle}
                                                onChange={e => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))}
                                                rows={4}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand/50 transition-all resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">CTA Button Text</label>
                                            <input
                                                type="text"
                                                value={heroData.cta}
                                                onChange={e => setHeroData(prev => ({ ...prev, cta: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Preview</h3>
                                    <div className="aspect-video w-full rounded-2xl bg-[#050505] border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                                        <h4 className="text-xl font-black text-white uppercase max-w-md">{heroData.title}</h4>
                                        <p className="text-gray-500 text-xs mt-2 max-w-sm">{heroData.subtitle}</p>
                                        <div className="mt-6 px-4 py-1.5 bg-brand rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                                            {heroData.cta}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* Gallery Module */}
                    {activeModule === 'gallery' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Image Gallery</h1>
                                    <p className="text-gray-500 text-sm mt-1">Manage images shown in the homepage carousel/gallery.</p>
                                </div>
                                <button
                                    onClick={handleSaveGallery}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Gallery
                                </button>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="text"
                                        placeholder="Paste image URL (e.g. from Unsplash or Imgur)"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                    />
                                    <button
                                        onClick={addGalleryImage}
                                        disabled={!newImageUrl}
                                        className="px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add URL
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                                    <span className="w-10 h-px bg-white/10"></span> OR <span className="w-10 h-px bg-white/10"></span>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <label className="flex-1 cursor-pointer bg-white/[0.03] border border-dashed border-white/20 hover:border-brand/50 rounded-xl px-4 py-6 text-center text-white text-sm transition-all relative">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ImageIcon size={24} className="text-brand opacity-80" />
                                            <span>Click to upload image file securely</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {galleryImages.map((img, idx) => (
                                    <div key={idx} className="aspect-[4/5] rounded-xl bg-black border border-white/10 flex items-center justify-center text-gray-600 relative group overflow-hidden">
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
                                            <button
                                                onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                                                className="px-4 py-2 bg-red-500/80 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-colors uppercase tracking-widest shadow-xl"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Members Module */}
                    {activeModule === 'members' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Member Directory</h1>
                                    <p className="text-gray-500 text-sm mt-1">Manage access control and user status.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand/40 w-64 transition-all"
                                        />
                                    </div>
                                    <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Member</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tier</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Stats</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={4} className="px-6 py-8 bg-white/[0.01]" />
                                                </tr>
                                            ))
                                        ) : (
                                            filteredMembers.map(member => (
                                                <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-gray-400">
                                                                {member.full_name?.[0] || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{member.full_name || 'Unnamed Player'}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium">{member.phone || member.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <select
                                                            value={member.tier}
                                                            onChange={(e) => updateMemberTier(member.id, e.target.value as MembershipTier)}
                                                            className="bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none"
                                                        >
                                                            <option className="bg-[#0a0a0c] text-brand" value="Guest">Guest</option>
                                                            <option className="bg-[#0a0a0c] text-brand" value="Admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1 text-[10px] uppercase font-bold text-gray-400">
                                                            <span>W: {member.player?.wins || 0}</span>
                                                            <span>L: {member.player?.losses || 0}</span>
                                                            <span className="text-gold">R: {member.player?.rating || 1500}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            <div className={`w-1 h-1 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                            {member.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button className="p-2 text-gray-500 hover:text-white transition-all">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tournaments Module */}
                    {activeModule === 'tournaments' && (
                        <AdminTournaments />
                    )}

                    {/* Players Module */}
                    {activeModule === 'players' && (
                        <AdminPlayers />
                    )}

                    {/* Placeholder for other modules */}
                    {['settings'].includes(activeModule) && (
                        <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 text-brand">
                                <Settings size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Module Under Construction</h2>
                            <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">We're building this part of the CMS to be perfectly integrated with the live site.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminCMS;
