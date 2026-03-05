export interface NavItem {
  label: string;
  href: string;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  isPopular?: boolean;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  category: string;
}

// Supabase-Ready Tournament Models
export type TournamentStatus = 'pending' | 'in_progress' | 'completed';
export type MatchStatus = 'pending' | 'active' | 'completed';

export interface Player {
  id: string; // UUID (matches auth.users or public.profiles)
  name: string;
  avatar_url?: string;
  rating?: number;
  created_at: string;
}

export interface Tournament {
  id: string; // UUID
  name: string;
  game_type: 'billiards' | 'darts' | 'chess';
  status: TournamentStatus;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface TournamentParticipant {
  id: string; // UUID
  tournament_id: string; // FK -> Tournament
  player_id: string; // FK -> Player
  seed: number;
  created_at: string;

  // Joined relation after query
  player?: Player;
}

export interface Match {
  id: string; // UUID
  tournament_id: string; // FK -> Tournament
  round: number;
  match_order: number;
  player1_id: string | null; // FK -> Player
  player2_id: string | null; // FK -> Player
  winner_id: string | null; // FK -> Player
  status: MatchStatus;
  next_match_id: string | null; // FK -> Match
  created_at: string;

  // Joined relations for UI
  player1?: Player | null;
  player2?: Player | null;
  winner?: Player | null;
}
