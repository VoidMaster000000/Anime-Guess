/**
 * Shared TypeScript types for the Anime Guessing Game
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Character {
  id: number;
  name: {
    full: string;
    native: string;
  };
  imageUrl: string;
  validTitles: string[];
  animeAppearances: Array<{
    romaji: string;
    english: string | null;
  }>;
}

export interface GameState {
  character: Character | null;
  hintsUsed: number;
  extraHintsUsed: number;
  difficulty: Difficulty;
  timeElapsed: number;
  isCorrect: boolean;
  isGameOver: boolean;
  score: number;
}

export interface SearchResult {
  romaji: string;
  english: string | null;
}

export interface Hint {
  id: number;
  text: string;
  revealed: boolean;
}
