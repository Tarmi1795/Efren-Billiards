import { useState, useEffect } from 'react';
import { Tournament, TournamentParticipant, Match, Player } from '../types';

// Utility for generating UUIDs manually for mock data
const generateUUID = () => crypto.randomUUID();

/**
 * UTILITY: Relational Bracket Logic
 */
export function generateRelationalBracket(
    tournamentId: string,
    participants: TournamentParticipant[]
): Match[] {
    const matches: Match[] = [];
    const N = participants.length;
    if (N < 2) return [];

    let powerOfTwo = 1;
    while (powerOfTwo < N) powerOfTwo *= 2;

    const seeded = [...participants].sort((a, b) => a.seed - b.seed);
    const totalRounds = Math.log2(powerOfTwo);
    let matchOrderGlobal = 0;

    function buildNode(round: number, siblingIndex: number, nextMatchId: string | null): number {
        const matchId = generateUUID();
        const currentOrder = matchOrderGlobal++;

        const match: Match = {
            id: matchId,
            tournament_id: tournamentId,
            round,
            match_order: currentOrder,
            player1_id: null,
            player2_id: null,
            winner_id: null,
            status: 'pending',
            next_match_id: nextMatchId,
            created_at: new Date().toISOString()
        };

        matches.push(match);

        if (round === 1) return matches.length - 1;
        buildNode(round - 1, siblingIndex * 2, matchId);
        buildNode(round - 1, siblingIndex * 2 + 1, matchId);
        return -1;
    }

    buildNode(totalRounds, 0, null);

    const round1Matches = matches.filter(m => m.round === 1).sort((a, b) => a.match_order - b.match_order);
    let currentParticipantIndex = 0;

    round1Matches.forEach((m) => {
        if (currentParticipantIndex < seeded.length) {
            m.player1_id = seeded[currentParticipantIndex].player_id;
            m.player1 = seeded[currentParticipantIndex].player;
            currentParticipantIndex++;
        }
    });

    round1Matches.forEach((m) => {
        if (currentParticipantIndex < seeded.length) {
            m.player2_id = seeded[currentParticipantIndex].player_id;
            m.player2 = seeded[currentParticipantIndex].player;
            currentParticipantIndex++;
        } else {
            m.status = 'completed';
            m.winner_id = m.player1_id;
            m.winner = m.player1;
        }
    });

    round1Matches.forEach(m => {
        if (m.winner_id && m.next_match_id) {
            const nextMatch = matches.find(nm => nm.id === m.next_match_id);
            if (nextMatch) {
                if (!nextMatch.player1_id) {
                    nextMatch.player1_id = m.winner_id;
                    nextMatch.player1 = m.winner;
                } else {
                    nextMatch.player2_id = m.winner_id;
                    nextMatch.player2 = m.winner;
                }
            }
        }
    });

    return matches;
}

/**
 * Hook to fetch ALL tournaments to display on the master hub.
 */
export function useAllTournaments() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // TODO (Supabase Integration):
                // const { data, error } = await supabase.from('tournaments')
                //     .select('id, name, game_type, status, started_at, completed_at, created_at')
                //     .order('created_at', { ascending: false });
                // if (error) throw error;
                // setTournaments(data || []);

                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockTournaments: Tournament[] = [
                    {
                        id: 'SIMUL-001',
                        name: "Grandmaster Simul: Open Challenge",
                        game_type: "chess",
                        status: "pending",
                        created_at: new Date(Date.now() - 86400000).toISOString()
                    },
                    {
                        id: 'DART-002',
                        name: "Weekend Darts Showdown",
                        game_type: "darts",
                        status: "in_progress",
                        started_at: new Date(Date.now() - 3600000).toISOString(),
                        created_at: new Date(Date.now() - 172800000).toISOString()
                    },
                    {
                        id: 'BILL-003',
                        name: "8-Ball amateur league",
                        game_type: "billiards",
                        status: "completed",
                        completed_at: new Date(Date.now() - 5000000).toISOString(),
                        started_at: new Date(Date.now() - 10000000).toISOString(),
                        created_at: new Date(Date.now() - 250000000).toISOString()
                    }
                ];

                setTournaments(mockTournaments);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch tournaments.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { tournaments, loading, error };
}

/**
 * Common Mock Engine
 */
const generateMockDataByType = (gameType: string, customId?: string) => {
    let mockTournament: Tournament;
    let mockPlayers: Player[];

    if (gameType === 'darts' || customId?.startsWith('DART')) {
        mockTournament = {
            id: customId || 'DART-002',
            name: "Weekend Darts Showdown",
            game_type: "darts",
            status: "pending",
            created_at: new Date().toISOString()
        };
        mockPlayers = [
            { id: generateUUID(), name: "Tarek M.", rating: 1420, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Sarah J.", rating: 1385, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Ahmed Q.", rating: 1350, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Chris W.", rating: 1290, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Nour E.", rating: 1100, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Mike R.", rating: 1050, created_at: new Date().toISOString() },
        ];
    } else if (gameType === 'billiards' || customId?.startsWith('BILL')) {
        mockTournament = {
            id: customId || 'BILL-003',
            name: "8-Ball Amateur League",
            game_type: "billiards",
            status: "pending",
            created_at: new Date().toISOString()
        };
        mockPlayers = [
            { id: generateUUID(), name: "John D.", rating: 650, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Local Hero", rating: 800, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "The Magician", rating: 850, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Shane V.", rating: 780, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Jayson S.", rating: 750, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Filler J.", rating: 790, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Ko P.", rating: 770, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Albin O.", rating: 760, created_at: new Date().toISOString() },
        ];
    } else {
        mockTournament = {
            id: customId || 'SIMUL-001',
            name: "Grandmaster Simul: Open Challenge",
            game_type: "chess",
            status: "pending",
            created_at: new Date().toISOString()
        };
        mockPlayers = [
            { id: generateUUID(), name: "Eugenio T.", rating: 2450, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Wesley S.", rating: 2380, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Rogelio A.", rating: 2200, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Julio C.", rating: 2150, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Mark P.", rating: 2100, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Guest User 1", rating: 1500, created_at: new Date().toISOString() },
            { id: generateUUID(), name: "Guest User 2", rating: 1600, created_at: new Date().toISOString() }
        ];
    }

    const mockParticipants: TournamentParticipant[] = mockPlayers.map((p, index) => ({
        id: generateUUID(),
        tournament_id: mockTournament.id,
        player_id: p.id,
        seed: index + 1,
        created_at: new Date().toISOString(),
        player: p
    }));

    const generatedMatches = generateRelationalBracket(mockTournament.id, mockParticipants);

    return { mockTournament, mockParticipants, generatedMatches };
};

/**
 * Hook to fetch the currently active tournament for a specific game type.
 */
export function useActiveTournamentByGameType(gameType: 'billiards' | 'darts' | 'chess') {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [participants, setParticipants] = useState<TournamentParticipant[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // TODO (Supabase Integration):
                // 1. Find active tournament by gameType ...
                await new Promise(resolve => setTimeout(resolve, 1500));
                const { mockTournament, mockParticipants, generatedMatches } = generateMockDataByType(gameType);

                setTournament(mockTournament);
                setParticipants(mockParticipants);
                setMatches(generatedMatches);

            } catch (err: any) {
                setError(err.message || `Failed to fetch active ${gameType} tournament.`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gameType]);

    return { tournament, matches, participants, loading, error };
}

/**
 * Legacy URL routing fallback
 */
export function useTournamentData(tournamentId: string | null) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [participants, setParticipants] = useState<TournamentParticipant[]>([]);

    useEffect(() => {
        if (!tournamentId) { setLoading(false); return; }

        const fetchData = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const { mockTournament, mockParticipants, generatedMatches } = generateMockDataByType('', tournamentId);

                setTournament(mockTournament);
                setParticipants(mockParticipants);
                setMatches(generatedMatches);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch tournament data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tournamentId]);

    return { tournament, matches, participants, loading, error };
}
