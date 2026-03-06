import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { Loader2, Plus, Trophy, Edit2, Trash2, Users } from 'lucide-react';
import type { Tournament, GameType, TournamentStatus } from '../types/database';

const AdminTournaments: React.FC = () => {
    const { showToast, ToastContainer } = useToast();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        game_type: GameType;
        status: TournamentStatus;
        started_at: string;
    }>({
        name: '',
        game_type: 'billiards',
        status: 'pending',
        started_at: ''
    });

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('tournaments') as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTournaments(data || []);
        } catch (err: any) {
            console.error('Error fetching tournaments:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (tournament?: Tournament) => {
        if (tournament) {
            setEditingId(tournament.id);
            setFormData({
                name: tournament.name,
                game_type: tournament.game_type,
                status: tournament.status,
                started_at: tournament.started_at ? new Date(tournament.started_at).toISOString().slice(0, 16) : ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                game_type: 'billiards',
                status: 'pending',
                started_at: ''
            });
        }
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                game_type: formData.game_type,
                status: formData.status,
                started_at: formData.started_at ? new Date(formData.started_at).toISOString() : null,
            };

            if (editingId) {
                const { error } = await (supabase.from('tournaments') as any).update(payload).eq('id', editingId);
                if (error) throw error;
                showToast('Tournament updated successfully', 'success');
            } else {
                const { error } = await (supabase.from('tournaments') as any).insert([payload]);
                if (error) throw error;
                showToast('Tournament created successfully', 'success');
            }

            setShowForm(false);
            fetchTournaments();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tournament?')) return;
        try {
            const { error } = await (supabase.from('tournaments') as any).delete().eq('id', id);
            if (error) throw error;
            showToast('Tournament deleted', 'success');
            fetchTournaments();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <ToastContainer />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Tournaments</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage events, players, and registrations.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                    >
                        <Plus size={18} />
                        Create Tournament
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{editingId ? 'Edit Tournament' : 'New Tournament'}</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Tournament Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                    placeholder="e.g. Summer 8-Ball Classic"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Game Type</label>
                                <select
                                    value={formData.game_type}
                                    onChange={e => setFormData({ ...formData, game_type: e.target.value as GameType })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 appearance-none"
                                >
                                    <option value="billiards">Billiards</option>
                                    <option value="darts">Darts</option>
                                    <option value="chess">Chess</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as TournamentStatus })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 appearance-none"
                                >
                                    <option value="pending">Upcoming / Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.started_at}
                                    onChange={e => setFormData({ ...formData, started_at: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Save Tournament
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tournament</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Game Type</th>
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
                            ) : tournaments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No tournaments found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                tournaments.map(t => (
                                    <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand">
                                                    <Trophy size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{t.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                        {t.started_at ? new Date(t.started_at).toLocaleDateString() : 'TBA'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'completed' ? 'bg-gray-500/10 text-gray-400' :
                                                    t.status === 'in_progress' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                <div className={`w-1 h-1 rounded-full ${t.status === 'completed' ? 'bg-gray-400' :
                                                        t.status === 'in_progress' ? 'bg-emerald-400' :
                                                            'bg-yellow-400'
                                                    }`} />
                                                {t.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-400 capitalize">
                                            {t.game_type}
                                        </td>
                                        <td className="px-6 py-5 text-right flex items-center justify-end gap-2 text-gray-400">
                                            <button
                                                onClick={() => handleOpenForm(t)}
                                                className="p-2 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminTournaments;
