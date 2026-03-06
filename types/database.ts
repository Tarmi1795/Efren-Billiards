// ============================================================================
// Database TypeScript Definitions
// Maps to the existing Supabase PostgreSQL schema
// ============================================================================

/** Membership tier enum — matches the `membership_tier` enum in Postgres */
export type MembershipTier = 'Guest' | 'Player' | 'Bronze' | 'Silver' | 'Gold' | 'Admin';

/** Account status for profile management */
export type AccountStatus = 'active' | 'suspended' | 'pending';

/** Profile row — maps to `public.profiles` table */
export interface Profile {
    id: string;                       // UUID — references auth.users.id
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
    tier: MembershipTier;
    status: AccountStatus;
    created_at: string;
    updated_at: string;
}

/** Tournament status enum */
export type TournamentStatus = 'pending' | 'in_progress' | 'completed';

/** Match status enum */
export type MatchStatus = 'pending' | 'active' | 'completed';

/** Game type enum */
export type GameType = 'billiards' | 'darts' | 'chess';

/** Player row — maps to `public.players` */
export interface Player {
    id: string;
    name: string;
    avatar_url: string | null;
    rating: number | null;
    created_at: string;
}

/** Tournament row — maps to `public.tournaments` */
export interface Tournament {
    id: string;
    name: string;
    game_type: GameType;
    status: TournamentStatus;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

/** Tournament participant row — maps to `public.tournament_participants` */
export interface TournamentParticipant {
    id: string;
    tournament_id: string;
    player_id: string;
    seed: number;
    created_at: string;
    player?: Player;
}

/** Match row — maps to `public.matches` */
export interface Match {
    id: string;
    tournament_id: string;
    round: number;
    match_order: number;
    player1_id: string | null;
    player2_id: string | null;
    winner_id: string | null;
    status: MatchStatus;
    next_match_id: string | null;
    created_at: string;
    player1?: Player | null;
    player2?: Player | null;
    winner?: Player | null;
}

/** CMS Content row — maps to `public.cms_content` (future Step 4) */
export interface CMSContent {
    id: string;
    slug: string;
    title: string;
    body: string;
    published: boolean;
    author_id: string;
    created_at: string;
    updated_at: string;
}

/** Registration row — maps to `public.registrations` */
export interface Registration {
    id: string;
    user_id: string;
    tournament_id: string;
    status: 'registered' | 'checked_in' | 'withdrawn';
    registered_at: string;
}

// ============================================================================
// Supabase Database type — used by createClient<Database>(...)
// This provides end-to-end type safety for all Supabase queries.
// ============================================================================
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
                Relationships: [];
            };
            players: {
                Row: Player;
                Insert: Omit<Player, 'created_at'> & { created_at?: string };
                Update: Partial<Omit<Player, 'id' | 'created_at'>>;
                Relationships: [];
            };
            tournaments: {
                Row: Tournament;
                Insert: Omit<Tournament, 'created_at'> & { created_at?: string };
                Update: Partial<Omit<Tournament, 'id' | 'created_at'>>;
                Relationships: [];
            };
            tournament_participants: {
                Row: TournamentParticipant;
                Insert: Omit<TournamentParticipant, 'id' | 'created_at' | 'player'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<TournamentParticipant, 'id' | 'created_at' | 'player'>>;
                Relationships: [];
            };
            matches: {
                Row: Match;
                Insert: Omit<Match, 'id' | 'created_at' | 'player1' | 'player2' | 'winner'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<Match, 'id' | 'created_at' | 'player1' | 'player2' | 'winner'>>;
                Relationships: [];
            };
            cms_content: {
                Row: CMSContent;
                Insert: Omit<CMSContent, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Omit<CMSContent, 'id' | 'created_at'>>;
                Relationships: [];
            };
            registrations: {
                Row: Registration;
                Insert: Omit<Registration, 'id' | 'registered_at'> & {
                    id?: string;
                    registered_at?: string;
                };
                Update: Partial<Omit<Registration, 'id' | 'registered_at'>>;
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            membership_tier: MembershipTier;
            account_status: AccountStatus;
            tournament_status: TournamentStatus;
            match_status: MatchStatus;
            game_type: GameType;
        };
        CompositeTypes: Record<string, never>;
    };
}
