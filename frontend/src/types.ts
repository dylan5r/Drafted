export type Game = "VALORANT" | "FORTNITE" | "ROCKET_LEAGUE";

export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl: string;
  favoriteGame: Game;
  bio: string;
  walletBalance: number;
  xpPoints: number;
  globalRank?: number | null;
}

export interface MatchCard {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  highlight: string;
}

export interface TeamCard {
  id: number;
  game: Game;
  name: string;
  points: number;
  rankLabel: string;
}

export interface BuilderPlayer {
  id: number;
  handle: string;
  team: string;
  role: string;
  salary: number;
  trend: string;
  rarity: "LEGENDARY" | "EPIC" | "RARE";
  average: number;
  avatarUrl: string;
}
