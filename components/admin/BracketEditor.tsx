import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, RefreshCw, Trash2, Plus, X } from 'lucide-react';
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

    useEffect(() => {
        fetchData();
    }, [tournament.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch matches
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournament.id)
                .order('match_order', { ascending: true });

            if (matchesError) throw matchesError;

            // Fetch registrations (profiles)
            const { data: regData, error: regError } = await supabase
                .from('registrations')
                .select('user_id, profiles(*)')
                .eq('tournament_id', tournament.id);

            if (regError) throw regError;

            const profiles = regData.map((r: any) => r.profiles).filter(Boolean);
            setRegistrations(profiles);

            // Map profiles to matches
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
            // Delete existing matches
            await supabase.from('matches').delete().eq('tournament_id', tournament.id);

            const newMatches = [];
            const rounds = Math.log2(size);
            let matchCount = 0;

            // Create matches round by round
            // We need to create them in reverse order or handle IDs carefully to link next_match_id
            // Easier: Create all matches first with temp IDs, then link them?
            // Or just create them and update links.
            // Let's do: Create Final, then Semi-Finals pointing to Final, etc.
            
            // Recursive function to build tree?
            // Or iterative:
            // Round 1 (Final): 1 match
            // Round 2 (Semis): 2 matches
            // ...
            // But usually Round 1 is the FIRST round played.
            // Let's stick to standard: Round 1 = First Round (e.g. Quarter Finals).
            // Total rounds = log2(size).
            
            // Example 8 players:
            // Round 1: 4 matches.
            // Round 2: 2 matches.
            // Round 3: 1 match (Final).
            
            // We need to generate UUIDs locally to link them before inserting?
            // Or insert round by round from Final backwards?
            // Insert Final (Round 3). Get ID.
            // Insert Semis (Round 2), next_match_id = Final ID.
            // Insert QFs (Round 1), next_match_id = Semi IDs.

            let nextRoundMatches: { id: string, match_order: number }[] = [];

            for (let r = rounds; r >= 1; r--) {
                const matchCountInRound = Math.pow(2, rounds - r); // Round 3 (Final) -> 2^(3-3) = 1. Round 1 -> 2^(3-1) = 4.
                const currentRoundMatches = [];

                for (let i = 0; i < matchCountInRound; i++) {
                    const nextMatchIndex = Math.floor(i / 2);
                    const nextMatchId = nextRoundMatches.length > 0 ? nextRoundMatches[nextMatchIndex].id : null;

                    const { data, error } = await supabase.from('matches').insert({
                        tournament_id: tournament.id,
                        round: r, // 1, 2, 3...
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const playerId = active.id as string;
        const targetId = over.id as string; // "matchId-player1" or "matchId-player2"

        if (!targetId.includes('-')) return;

        const lastHyphenIndex = targetId.lastIndexOf('-');
        const matchId = targetId.substring(0, lastHyphenIndex);
        const slot = targetId.substring(lastHyphenIndex + 1) as 'player1' | 'player2';

        await assignPlayerToSlot(matchId, slot, playerId);
    };

    const assignPlayerToSlot = async (matchId: string, slot: 'player1' | 'player2', playerId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        // Ensure player exists in the players table (foreign key constraint)
        try {
            const { data: existingPlayer } = await (supabase.from('players') as any).select('id').eq('id', playerId).maybeSingle();
            if (!existingPlayer) {
                const profile = registrations.find(p => p.id === playerId);
                await (supabase.from('players') as any).insert([{
                    id: playerId,
                    name: profile?.full_name || 'Unknown Player',
                    rating: 1500,
                    wins: 0,
                    losses: 0
                }]);
            }
        } catch (err) {
            console.error('Error ensuring player exists:', err);
        }

        // If player is already in this slot, do nothing
        if ((slot === 'player1' && match.player1_id === playerId) || 
            (slot === 'player2' && match.player2_id === playerId)) {
            return;
        }

        // Check if player is already assigned elsewhere in the bracket
        const previousMatch = matches.find(m => m.player1_id === playerId || m.player2_id === playerId);
        if (previousMatch) {
            const prevSlot = previousMatch.player1_id === playerId ? 'player1_id' : 'player2_id';
            await updateMatch(previousMatch.id, { [prevSlot]: null });
        }

        // Assign to new slot
        const updates: any = {};
        updates[slot === 'player1' ? 'player1_id' : 'player2_id'] = playerId;
        await updateMatch(matchId, updates);
    };

    const removePlayerFromSlot = async (matchId: string, slot: 'player1' | 'player2') => {
        const updates: any = {};
        updates[slot === 'player1' ? 'player1_id' : 'player2_id'] = null;
        await updateMatch(matchId, updates);
    };

    const updateMatch = async (matchId: string, updates: any) => {
        // Optimistic update
        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                const updatedMatch = { ...m, ...updates };
                // Update profile objects
                if ('player1_id' in updates) {
                    updatedMatch.player1 = registrations.find(p => p.id === updates.player1_id);
                }
                if ('player2_id' in updates) {
                    updatedMatch.player2 = registrations.find(p => p.id === updates.player2_id);
                }
                return updatedMatch;
            }
            return m;
        }));

        try {
            const { error } = await (supabase.from('matches') as any).update(updates).eq('id', matchId);
            if (error) throw error;
        } catch (err: any) {
            console.error('Failed to update match:', err);
            showToast('Failed to update match', 'error');
            // Re-fetch to ensure state is correct
            const { data: matchesData } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournament.id)
                .order('match_order', { ascending: true });
            
            if (matchesData) {
                setMatches((matchesData as Match[]).map(m => ({
                    ...m,
                    player1: registrations.find(p => p.id === m.player1_id),
                    player2: registrations.find(p => p.id === m.player2_id)
                })));
            }
        }
    };

    const autoAssignPlayers = async () => {
        const round1Matches = matches.filter(m => m.round === 1);
        if (round1Matches.length === 0) {
            showToast('No Round 1 matches found. Please generate a bracket first.', 'error');
            return;
        }

        // Filter unassigned players
        const assignedPlayerIds = new Set<string>();
        matches.forEach(m => {
            if (m.player1_id) assignedPlayerIds.add(m.player1_id);
            if (m.player2_id) assignedPlayerIds.add(m.player2_id);
        });
        const availablePlayers = [...registrations.filter(p => !assignedPlayerIds.has(p.id))];
        
        if (availablePlayers.length === 0) {
            showToast('All players are already assigned.', 'info');
            return;
        }

        // Shuffle players
        for (let i = availablePlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePlayers[i], availablePlayers[j]] = [availablePlayers[j], availablePlayers[i]];
        }

        setSaving(true);
        try {
            let playerIdx = 0;
            for (const match of round1Matches) {
                const updates: any = {};
                if (!match.player1_id && playerIdx < availablePlayers.length) {
                    updates.player1_id = availablePlayers[playerIdx++].id;
                }
                if (!match.player2_id && playerIdx < availablePlayers.length) {
                    updates.player2_id = availablePlayers[playerIdx++].id;
                }

                if (Object.keys(updates).length > 0) {
                    // Ensure players exist in players table
                    for (const pid of Object.values(updates) as string[]) {
                        const { data: existingPlayer } = await (supabase.from('players') as any).select('id').eq('id', pid).maybeSingle();
                        if (!existingPlayer) {
                            const profile = registrations.find(p => p.id === pid);
                            await (supabase.from('players') as any).insert([{
                                id: pid,
                                name: profile?.full_name || 'Unknown Player',
                                rating: 1500,
                                wins: 0,
                                losses: 0
                            }]);
                        }
                    }
                    await updateMatch(match.id, updates);
                }
                
                if (playerIdx >= availablePlayers.length) break;
            }
            showToast(`Auto-assigned ${playerIdx} players to Round 1.`, 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Filter unassigned players
    const assignedPlayerIds = new Set<string>();
    matches.forEach(m => {
        if (m.player1_id) assignedPlayerIds.add(m.player1_id);
        if (m.player2_id) assignedPlayerIds.add(m.player2_id);
    });
    const unassignedPlayers = registrations.filter(p => !assignedPlayerIds.has(p.id));

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bracket Editor</h2>
                            <span className="px-2 py-0.5 bg-brand/20 text-brand text-[10px] font-black rounded-full border border-brand/30">BETA</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            This feature is currently in development and will be fully functional in a future update.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={autoAssignPlayers} 
                            disabled={saving || generating || unassignedPlayers.length === 0}
                            className="px-3 py-1.5 bg-brand/20 hover:bg-brand/30 border border-brand/30 rounded-lg text-xs font-bold text-brand flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
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
                    {/* Unassigned Players Pool */}
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

                    {/* Bracket Display */}
                    <div className="lg:col-span-3 bg-dark-900 border border-white/5 rounded-2xl p-6 overflow-x-auto custom-scrollbar">
                        <div className="flex gap-12 min-w-max">
                            {/* Group matches by round */}
                            {Array.from(new Set(matches.map(m => m.round))).sort((a: number, b: number) => a - b).map(round => (
                                <div key={round} className="flex flex-col justify-around gap-8">
                                    <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Round {round}</div>
                                    {matches.filter(m => m.round === round).map(match => (
                                    <MatchSlot 
                                        key={match.id} 
                                        match={match} 
                                        unassignedPlayers={unassignedPlayers}
                                        onAssign={(slot, playerId) => assignPlayerToSlot(match.id, slot, playerId)}
                                        onRemove={(slot) => removePlayerFromSlot(match.id, slot)}
                                    />
                                    ))}
                                </div>
                            ))}
                        </div>
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
        </DndContext>
    );
};

const DraggablePlayer: React.FC<{ player: Profile }> = ({ player }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: player.id,
    });
    
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">
                {player.full_name?.charAt(0)}
            </div>
            <span className="text-sm font-bold text-white truncate">{player.full_name}</span>
        </div>
    );
};

const MatchSlot: React.FC<{ 
    match: MatchWithPlayers;
    unassignedPlayers: Profile[];
    onAssign: (slot: 'player1' | 'player2', playerId: string) => void;
    onRemove: (slot: 'player1' | 'player2') => void;
}> = ({ match, unassignedPlayers, onAssign, onRemove }) => {
    return (
        <div className="w-48 bg-dark-800 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-lg">
            <div className="bg-white/5 px-3 py-1 text-[10px] text-gray-500 font-mono flex justify-between items-center">
                <span className="font-bold">M{match.match_order + 1}</span>
                <span className="uppercase tracking-tighter opacity-70">{match.status}</span>
            </div>
            <DroppableSlot 
                matchId={match.id} 
                slot="player1" 
                player={match.player1} 
                unassignedPlayers={unassignedPlayers}
                onAssign={(pid) => onAssign('player1', pid)}
                onRemove={() => onRemove('player1')}
            />
            <div className="h-px bg-white/5" />
            <DroppableSlot 
                matchId={match.id} 
                slot="player2" 
                player={match.player2} 
                unassignedPlayers={unassignedPlayers}
                onAssign={(pid) => onAssign('player2', pid)}
                onRemove={() => onRemove('player2')}
            />
        </div>
    );
};

const DroppableSlot: React.FC<{ 
    matchId: string, 
    slot: 'player1' | 'player2', 
    player?: Profile,
    unassignedPlayers: Profile[],
    onAssign: (playerId: string) => void,
    onRemove: () => void
}> = ({ matchId, slot, player, unassignedPlayers, onAssign, onRemove }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `${matchId}-${slot}`,
    });
    const [showSelector, setShowSelector] = useState(false);

    return (
        <div 
            ref={setNodeRef} 
            className={`p-3 min-h-[48px] flex items-center transition-all relative group ${isOver ? 'bg-brand/20 ring-2 ring-brand ring-inset' : 'hover:bg-white/[0.02]'}`}
        >
            {player ? (
                <div className="flex items-center gap-2 w-full">
                    <div className="w-5 h-5 rounded bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand shrink-0">
                        {player.full_name?.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-white truncate flex-1">{player.full_name}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Player"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-gray-600 italic">Empty Slot</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowSelector(!showSelector); }}
                        className="p-1 bg-white/5 hover:bg-brand/20 text-gray-400 hover:text-brand rounded transition-colors"
                        title="Assign Player"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}

            {showSelector && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 bg-dark-800 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="p-2 border-b border-white/5 flex justify-between items-center sticky top-0 bg-dark-800">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Player</span>
                        <button onClick={() => setShowSelector(false)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                    </div>
                    {unassignedPlayers.length === 0 ? (
                        <div className="p-3 text-[10px] text-gray-600 italic text-center">No unassigned players</div>
                    ) : (
                        unassignedPlayers.map(p => (
                            <button
                                key={p.id}
                                onClick={() => { onAssign(p.id); setShowSelector(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-brand hover:text-white transition-colors flex items-center gap-2"
                            >
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
