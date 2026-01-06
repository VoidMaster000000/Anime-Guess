import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NormalizedCharacter } from '@/app/api/character/route';

/**
 * Utility for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Difficulty levels for the game
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Calculate points based on game performance
 * @param hintsUsed - Number of basic hints used (0-3)
 * @param difficulty - Game difficulty level
 * @param extraHintsUsed - Number of extra hints used (additional deductions)
 * @returns Total points earned
 */
export function calculatePoints(
  hintsUsed: number,
  difficulty: Difficulty,
  extraHintsUsed: number = 0
): number {
  // Base points by difficulty
  const basePoints: Record<Difficulty, number> = {
    easy: 100,
    medium: 200,
    hard: 300,
  };

  // Deduction per hint
  const hintPenalty = 25;
  const extraHintPenalty = 15;

  const base = basePoints[difficulty];
  const totalHintDeduction = hintsUsed * hintPenalty + extraHintsUsed * extraHintPenalty;

  // Ensure minimum 10 points
  const finalScore = Math.max(10, base - totalHintDeduction);

  return finalScore;
}

/**
 * Normalize title for comparison
 * Removes special characters, converts to lowercase, and trims whitespace
 * @param title - The title string to normalize
 * @returns Normalized title string
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Check if user's guess matches any valid anime titles
 * @param guess - User's answer
 * @param validTitles - Array of valid anime titles for the character
 * @returns True if guess matches any valid title
 */
export function checkAnswer(guess: string, validTitles: string[]): boolean {
  if (!guess || validTitles.length === 0) {
    return false;
  }

  const normalizedGuess = normalizeTitle(guess);

  // Check exact match first
  for (const title of validTitles) {
    const normalizedTitle = normalizeTitle(title);

    if (normalizedGuess === normalizedTitle) {
      return true;
    }
  }

  // Check if guess contains or is contained in any title (partial match)
  // This helps with minor typos or missing subtitles
  for (const title of validTitles) {
    const normalizedTitle = normalizeTitle(title);

    // Skip very short guesses to avoid false positives
    if (normalizedGuess.length < 3) {
      continue;
    }

    // Check if it's a substantial partial match (at least 80% of the shorter string)
    const minLength = Math.min(normalizedGuess.length, normalizedTitle.length);
    const maxLength = Math.max(normalizedGuess.length, normalizedTitle.length);

    if (minLength / maxLength >= 0.8) {
      if (
        normalizedTitle.includes(normalizedGuess) ||
        normalizedGuess.includes(normalizedTitle)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Generate text hints about the character
 * @param character - The character object
 * @returns Hint string describing the character or their anime
 */
export function generateHint(character: NormalizedCharacter): string {
  const hints: string[] = [];

  // Hint about number of anime appearances
  const animeCount = character.animeAppearances.length;
  if (animeCount === 1) {
    hints.push('This character appears in one anime series.');
  } else if (animeCount <= 3) {
    hints.push(`This character appears in ${animeCount} anime series.`);
  } else {
    hints.push(`This character appears in ${animeCount} different anime series.`);
  }

  // Hint about most popular anime (first in the list due to POPULARITY_DESC sort)
  if (character.animeAppearances.length > 0) {
    const popularAnime = character.animeAppearances[0];
    const title = popularAnime.english || popularAnime.romaji;

    // Give partial title hint
    if (title.length > 10) {
      const words = title.split(' ');
      if (words.length >= 3) {
        hints.push(`The most popular anime starts with "${words[0]} ${words[1]}..."`);
      } else if (words.length === 2) {
        hints.push(`The most popular anime is a two-word title.`);
      } else {
        hints.push(`The most popular anime is titled "${title.substring(0, 3)}..."`);
      }
    } else {
      hints.push(`The most popular anime has a short title (${title.length} characters).`);
    }
  }

  // Hint about character name length
  const nameLength = character.name.full.length;
  if (nameLength <= 10) {
    hints.push('This character has a short name.');
  } else if (nameLength <= 20) {
    hints.push('This character has a medium-length name.');
  } else {
    hints.push('This character has a long name.');
  }

  // Hint about name structure
  const nameWords = character.name.full.split(' ').length;
  if (nameWords === 1) {
    hints.push('The character goes by a single name.');
  } else if (nameWords === 2) {
    hints.push('The character has a first and last name.');
  } else {
    hints.push(`The character's name has ${nameWords} parts.`);
  }

  // Hint about first letter
  const firstLetter = character.name.full.charAt(0).toUpperCase();
  hints.push(`The character's name starts with "${firstLetter}".`);

  return hints[Math.floor(Math.random() * hints.length)];
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500',
  };
  return colors[difficulty];
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
