import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, RefreshCw, Trash2, Plus, X, Trophy, Crown, ChevronRight } from 'lucide-react';
import type { Tournament, Profile, Match } from '../../types/database';

interface Props {
    tournament: Tournament;
}

interface MatchWithPlayers extends Match {
    player1?: Profile;
    player2?: Profile;
}

export const BracketEditor: React.FC<Props> = ({ tournament }) => {
    const { showToast, ToastContainer } = useToast();
    const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
    const [registrations, setRegistrations] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [confirmWinner, setConfirmWinner] = useState<{ matchId: string; winnerId: string; winnerName: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [tournament.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournament.id)
                .order('match_order', { ascending: true });

            if (matchesError) throw matchesError;

            const { data: regData, error: regError } = await supabase
                .from('registrations')
                .select('user_id, profiles(*)')
                .eq('tournament_id', tournament.id);

            if (regError) throw regError;

            const profiles = regData.map((r: any) => r.profiles).filter(Boolean);
            setRegistrations(profiles);

            const mappedMatches = (matchesData || []).map(m => ({
                ...m,
                player1: profiles.find(p => p.id === m.player1_id),
                player2: profiles.find(p => p.id === m.player2_id)
            }));

            setMatches(mappedMatches);
        } catch (err: any) {
            console.error('Error fetching bracket data:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateBracket = async (size: number) => {
        if (!confirm(`This will delete existing matches and create a new bracket for ${size} players. Continue?`)) return;
        setGenerating(true);
        try {
            await supabase.from('matches').delete().eq('tournament_id', tournament.id);

            const rounds = Math.log2(size);
            let nextRoundMatches: { id: string; match_order: number }[] = [];

            for (let r = rounds; r >= 1; r--) {
                const matchCountInRound = Math.pow(2, rounds - r);
                const currentRoundMatches = [];

                for (let i = 0; i < matchCountInRound; i++) {
                    const nextMatchIndex = Math.floor(i / 2);
                    const nextMatchId = nextRoundMatches.length > 0 ? nextRoundMatches[nextMatchIndex].id : null;

                    const { data, error } = await supabase.from('matches').insert({
                        tournament_id: tournament.id,
                        round: r,
                        match_order: i,
                        status: 'pending',
                        next_match_id: nextMatchId
                    } as any).select().single();

                    if (error) throw error;
                    currentRoundMatches.push(data);
                }
                nextRoundMatches = currentRoundMatches;
            }

            showToast('Bracket generated successfully', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setGenerating(false);
        }
    };

    // ── Elimination Logic ──────────────────────────────────────────────
    const declareWinner = async (matchId: string, winnerId: string) => {
        setSaving(true);
        setConfirmWinner(null);
        try {
            const match = matches.find(m => m.id === matchId);
            if (!match) return;

            // 1. Mark this match as completed with the winner
            const { error: matchError } = await (supabase.from('matches') as any)
                .update({ winner_id: winnerId, status: 'completed' })
                .eq('id', matchId);
            if (matchError) throw matchError;

            // 2. Advance winner to next match if one exists
            if (match.next_match_id) {
                const nextMatch = matches.find(m => m.id === match.next_match_id);
                if (nextMatch) {
                    // Determine which slot the winner goes into based on match_order (even → player1, odd → player2)
                    const slot = match.match_order % 2 === 0 ? 'player1_id' : 'player2_id';

                    // Ensure player row exists
                    await ensurePlayerExists(winnerId);

                    const { error: nextError } = await (supabase.from('matches') as any)
                        .update({ [slot]: winnerId })
                        .eq('id', match.next_match_id);
                    if (nextError) throw nextError;

                    showToast(`Winner advanced to Round ${nextMatch.round}!`, 'success');
                }
            } else {
                showToast('🏆 Tournament Champion declared!', 'success');
            }

            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const ensurePlayerExists = async (playerId: string) => {
        try {
            const { data: existing } = await (supabase.from('players') as any).select('id').eq('id', playerId).maybeSingle();
            if (!existing) {
                const profile = registrations.find(p => p.id === playerId);
                await (supabase.from('players') as any).insert([{
                    id: playerId,
                    name: profile?.full_name || 'Unknown Player',
                    rating: 1500, wins: 0, losses: 0
                }]);
            }
        } catch (err) {
            console.error('Error ensuring player exists:', err);
        }
    };

    // ── Drag & Drop ────────────────────────────────────────────────────
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const playerId = active.id as string;
        const targetId = over.id as string;
        if (!targetId.includes('-')) return;
        const lastHyphenIndex = targetId.lastIndexOf('-');
        const matchId = targetId.substring(0, lastHyphenIndex);
        const slot = targetId.substring(lastHyphenIndex + 1) as 'player1' | 'player2';
        await assignPlayerToSlot(matchId, slot, playerId);
    };

    const assignPlayerToSlot = async (matchId: string, slot: 'player1' | 'player2', playerId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        if (match.status === 'completed') { showToast('Cannot modify a completed match.', 'error'); return; }

        try {
            await ensurePlayerExists(playerId);
        } catch (err) { console.error(err); }

        if ((slot === 'player1' && match.player1_id === playerId) ||
            (slot === 'player2' && match.player2_id === playerId)) return;

        const previousMatch = matches.find(m => m.player1_id === playerId || m.player2_id === playerId);
        if (previousMatch) {
            const prevSlot = previousMatch.player1_id === playerId ? 'player1_id' : 'player2_id';
            await updateMatch(previousMatch.id, { [prevSlot]: null });
        }

        const updates: any = {};
        updates[slot === 'player1' ? 'player1_id' : 'player2_id'] = playerId;
        await updateMatch(matchId, updates);
    };

    const removePlayerFromSlot = async (matchId: string, slot: 'player1' | 'player2') => {
        const match = matches.find(m => m.id === matchId);
        if (match?.status === 'completed') { showToast('Cannot modify a completed match.', 'error'); return; }
        const updates: any = {};
        updates[slot === 'player1' ? 'player1_id' : 'player2_id'] = null;
        await updateMatch(matchId, updates);
    };

    const updateMatch = async (matchId: string, updates: any) => {
        setMatches(prev => prev.map(m => {
            if (m.id !== matchId) return m;
            const updated = { ...m, ...updates };
            if ('player1_id' in updates) updated.player1 = registrations.find(p => p.id === updates.player1_id);
            if ('player2_id' in updates) updated.player2 = registrations.find(p => p.id === updates.player2_id);
            return updated;
        }));
        try {
            const { error } = await (supabase.from('matches') as any).update(updates).eq('id', matchId);
            if (error) throw error;
        } catch (err: any) {
            showToast('Failed to update match', 'error');
            fetchData();
        }
    };

    const autoAssignPlayers = async () => {
        const round1Matches = matches.filter(m => m.round === 1);
        if (round1Matches.length === 0) { showToast('Generate a bracket first.', 'error'); return; }

        const assignedIds = new Set<string>();
        matches.forEach(m => { if (m.player1_id) assignedIds.add(m.player1_id); if (m.player2_id) assignedIds.add(m.player2_id); });
        const available = [...registrations.filter(p => !assignedIds.has(p.id))];
        if (available.length === 0) { showToast('All players are already assigned.', 'info'); return; }

        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        setSaving(true);
        try {
            let idx = 0;
            for (const match of round1Matches) {
                const updates: any = {};
                if (!match.player1_id && idx < available.length) updates.player1_id = available[idx++].id;
                if (!match.player2_id && idx < available.length) updates.player2_id = available[idx++].id;
                if (Object.keys(updates).length > 0) {
                    for (const pid of Object.values(updates) as string[]) await ensurePlayerExists(pid);
                    await updateMatch(match.id, updates);
                }
                if (idx >= available.length) break;
            }
            showToast(`Auto-assigned ${idx} players to Round 1.`, 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const assignedIds = new Set<string>();
    matches.forEach(m => { if (m.player1_id) assignedIds.add(m.player1_id); if (m.player2_id) assignedIds.add(m.player2_id); });
    const unassignedPlayers = registrations.filter(p => !assignedIds.has(p.id));
    const maxRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;

    const getRoundLabel = (round: number) => {
        if (round === maxRound) return 'Final';
        if (round === maxRound - 1) return 'Semi‑Final';
        if (round === maxRound - 2) return 'Quarter‑Final';
        return `Round ${round}`;
    };

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
            <ToastContainer />
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bracket Editor</h2>
                            <span className="px-2 py-0.5 bg-brand/20 text-brand text-[10px] font-black rounded-full border border-brand/30">LIVE</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Drag players to slots, then declare match winners to advance them.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={autoAssignPlayers} disabled={saving || generating || unassignedPlayers.length === 0}
                            className="px-3 py-1.5 bg-brand/20 hover:bg-brand/30 border border-brand/30 rounded-lg text-xs font-bold text-brand flex items-center gap-2 transition-colors disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            Auto Assign
                        </button>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <button onClick={() => generateBracket(4)} disabled={generating} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white">Gen 4</button>
                        <button onClick={() => generateBracket(8)} disabled={generating} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white">Gen 8</button>
                        <button onClick={() => generateBracket(16)} disabled={generating} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white">Gen 16</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Unassigned Pool */}
                    <div className="lg:col-span-1 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Unassigned Players</h3>
                        <div className="space-y-2 min-h-[200px]">
                            {unassignedPlayers.map(player => (
                                <DraggablePlayer key={player.id} player={player} />
                            ))}
                            {unassignedPlayers.length === 0 && (
                                <p className="text-xs text-gray-600 text-center py-4">All players assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Bracket */}
                    <div className="lg:col-span-3 bg-dark-900 border border-white/5 rounded-2xl p-6 overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 size={28} className="animate-spin text-brand" />
                            </div>
                        ) : (
                            <div className="flex gap-12 min-w-max items-start">
                                {Array.from(new Set(matches.map(m => m.round))).sort((a, b) => (a as number) - (b as number)).map(round => (
                                    <div key={round} className="flex flex-col gap-6">
                                        <div className="text-center text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                            {getRoundLabel(round as number)}
                                        </div>
                                        <div className="flex flex-col justify-around gap-10">
                                            {matches.filter(m => m.round === round).map(match => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    unassignedPlayers={unassignedPlayers}
                                                    onAssign={(slot, pid) => assignPlayerToSlot(match.id, slot, pid)}
                                                    onRemove={(slot) => removePlayerFromSlot(match.id, slot)}
                                                    onDeclareWinner={(winnerId, winnerName) =>
                                                        setConfirmWinner({ matchId: match.id, winnerId, winnerName })
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="px-3 py-2 bg-brand text-white rounded-lg font-bold text-sm shadow-xl cursor-grabbing">
                        {registrations.find(p => p.id === activeId)?.full_name || 'Player'}
                    </div>
                ) : null}
            </DragOverlay>

            {/* Winner Confirmation Modal */}
            {confirmWinner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto">
                            <Trophy size={32} className="text-brand" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Declare Winner?</h3>
                            <p className="text-gray-400 text-sm mt-2">
                                This will eliminate the other player and advance <span className="text-white font-bold">{confirmWinner.winnerName}</span> to the next round.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmWinner(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => declareWinner(confirmWinner.matchId, confirmWinner.winnerId)}
                                className="flex-1 py-3 rounded-xl bg-brand text-white font-black text-sm hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand/30"
                            >
                                <Crown size={16} /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DndContext>
    );
};

// ── Sub‑components ─────────────────────────────────────────────────────

const DraggablePlayer: React.FC<{ player: Profile }> = ({ player }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: player.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand shrink-0">
                {player.full_name?.charAt(0)}
            </div>
            <span className="text-sm font-bold text-white truncate">{player.full_name}</span>
        </div>
    );
};

const MatchCard: React.FC<{
    match: MatchWithPlayers;
    unassignedPlayers: Profile[];
    onAssign: (slot: 'player1' | 'player2', playerId: string) => void;
    onRemove: (slot: 'player1' | 'player2') => void;
    onDeclareWinner: (winnerId: string, winnerName: string) => void;
}> = ({ match, unassignedPlayers, onAssign, onRemove, onDeclareWinner }) => {
    const isCompleted = match.status === 'completed';
    const canDeclareWinner = match.player1_id && match.player2_id && !isCompleted;

    return (
        <div className={`w-52 rounded-xl overflow-hidden flex flex-col shadow-lg border transition-all ${isCompleted ? 'border-brand/40 bg-dark-800/60' : 'border-white/10 bg-dark-800'}`}>
            {/* Match header */}
            <div className={`px-3 py-1.5 flex justify-between items-center text-[10px] font-mono ${isCompleted ? 'bg-brand/10' : 'bg-white/5'}`}>
                <span className="font-black text-gray-400">M{match.match_order + 1}</span>
                <span className={`uppercase tracking-tighter font-bold ${isCompleted ? 'text-brand' : 'text-gray-600'}`}>
                    {isCompleted ? 'Done' : match.status}
                </span>
            </div>

            {/* Player 1 Slot */}
            <PlayerSlot
                matchId={match.id}
                slot="player1"
                player={match.player1}
                isWinner={isCompleted && match.winner_id === match.player1_id}
                isLoser={isCompleted && !!match.winner_id && match.winner_id !== match.player1_id}
                unassignedPlayers={unassignedPlayers}
                onAssign={(pid) => onAssign('player1', pid)}
                onRemove={() => onRemove('player1')}
                onWin={canDeclareWinner && match.player1 ? () => onDeclareWinner(match.player1_id!, match.player1?.full_name || 'Player 1') : undefined}
            />

            {/* Divider */}
            <div className="h-px bg-white/5 relative flex items-center justify-center">
                <span className="absolute text-[8px] font-black text-gray-600 uppercase tracking-widest bg-dark-800 px-1">VS</span>
            </div>

            {/* Player 2 Slot */}
            <PlayerSlot
                matchId={match.id}
                slot="player2"
                player={match.player2}
                isWinner={isCompleted && match.winner_id === match.player2_id}
                isLoser={isCompleted && !!match.winner_id && match.winner_id !== match.player2_id}
                unassignedPlayers={unassignedPlayers}
                onAssign={(pid) => onAssign('player2', pid)}
                onRemove={() => onRemove('player2')}
                onWin={canDeclareWinner && match.player2 ? () => onDeclareWinner(match.player2_id!, match.player2?.full_name || 'Player 2') : undefined}
            />

            {/* Advance indicator for completed matches */}
            {isCompleted && match.winner_id && (
                <div className="px-3 py-1.5 bg-brand/10 border-t border-brand/20 flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-brand" />
                    <span className="text-[9px] font-black text-brand uppercase tracking-wide">Winner Advanced</span>
                </div>
            )}
        </div>
    );
};

const PlayerSlot: React.FC<{
    matchId: string;
    slot: 'player1' | 'player2';
    player?: Profile;
    isWinner?: boolean;
    isLoser?: boolean;
    unassignedPlayers: Profile[];
    onAssign: (playerId: string) => void;
    onRemove: () => void;
    onWin?: () => void;
}> = ({ matchId, slot, player, isWinner, isLoser, unassignedPlayers, onAssign, onRemove, onWin }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `${matchId}-${slot}` });
    const [showSelector, setShowSelector] = useState(false);

    return (
        <div ref={setNodeRef}
            className={`p-3 min-h-[52px] flex items-center transition-all relative group
                ${isOver ? 'bg-brand/20 ring-2 ring-brand ring-inset' : ''}
                ${isWinner ? 'bg-brand/10' : ''}
                ${isLoser ? 'opacity-40' : ''}
                ${!isOver && !isWinner && !isLoser ? 'hover:bg-white/[0.02]' : ''}
            `}
        >
            {player ? (
                <div className="flex items-center gap-2 w-full">
                    {isWinner && <Crown size={14} className="text-brand shrink-0" />}
                    {!isWinner && (
                        <div className="w-5 h-5 rounded bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand shrink-0">
                            {player.full_name?.charAt(0)}
                        </div>
                    )}
                    <span className={`text-sm font-bold truncate flex-1 ${isWinner ? 'text-brand' : 'text-white'}`}>
                        {player.full_name}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Declare winner button */}
                        {onWin && (
                            <button onClick={(e) => { e.stopPropagation(); onWin(); }}
                                title="Declare Winner"
                                className="p-1 bg-brand/20 hover:bg-brand text-brand hover:text-white rounded transition-all">
                                <Trophy size={12} />
                            </button>
                        )}
                        {/* Remove button */}
                        {!isWinner && !isLoser && (
                            <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                title="Remove Player"
                                className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-gray-600 italic">Empty Slot</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowSelector(!showSelector); }}
                        className="p-1 bg-white/5 hover:bg-brand/20 text-gray-400 hover:text-brand rounded transition-colors"
                        title="Assign Player">
                        <Plus size={14} />
                    </button>
                </div>
            )}

            {showSelector && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 bg-dark-800 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-white/5 flex justify-between items-center sticky top-0 bg-dark-800">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Player</span>
                        <button onClick={() => setShowSelector(false)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                    </div>
                    {unassignedPlayers.length === 0 ? (
                        <div className="p-3 text-[10px] text-gray-600 italic text-center">No unassigned players</div>
                    ) : (
                        unassignedPlayers.map(p => (
                            <button key={p.id} onClick={() => { onAssign(p.id); setShowSelector(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-brand hover:text-white transition-colors flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[8px] font-bold">
                                    {p.full_name?.charAt(0)}
                                </div>
                                <span className="truncate">{p.full_name}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BracketEditor;
