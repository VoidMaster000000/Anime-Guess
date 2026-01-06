/**
 * Example usage of the AniList API integration
 * This file demonstrates how to use the API client and utilities
 */

import { fetchRandomCharacter, searchAnime } from './anilist';
import {
  calculatePoints,
  checkAnswer,
  normalizeTitle,
  generateHint,
  formatTime,
} from './utils';

/**
 * Example 1: Fetch a random character
 */
async function exampleFetchCharacter() {
  try {
    console.log('Fetching random character...');
    const character = await fetchRandomCharacter();

    console.log('Character:', character.name.full);
    console.log('Native name:', character.name.native);
    console.log('Image URL:', character.image.large);
    console.log('Anime appearances:', character.media.nodes.length);

    character.media.nodes.forEach((anime, index) => {
      console.log(
        `  ${index + 1}. ${anime.title.romaji}${anime.title.english ? ` (${anime.title.english})` : ''}`
      );
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: Search for anime
 */
async function exampleSearchAnime() {
  try {
    console.log('\nSearching for "naruto"...');
    const results = await searchAnime('naruto');

    console.log(`Found ${results.length} results:`);
    results.forEach((anime, index) => {
      console.log(
        `  ${index + 1}. ${anime.title.romaji}${anime.title.english ? ` (${anime.title.english})` : ''}`
      );
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Use API routes
 */
async function exampleAPIRoutes() {
  try {
    // Fetch character from API route
    console.log('\nFetching from /api/character...');
    const charResponse = await fetch('http://localhost:3000/api/character');
    const character = await charResponse.json();
    console.log('Character:', character.name.full);
    console.log('Valid titles:', character.validTitles);

    // Search using API route
    console.log('\nSearching from /api/search?q=one piece...');
    const searchResponse = await fetch('http://localhost:3000/api/search?q=one piece');
    const searchResults = await searchResponse.json();
    console.log('Search results:', searchResults);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 4: Game logic utilities
 */
function exampleGameLogic() {
  console.log('\n--- Game Logic Examples ---');

  // Calculate points
  const score1 = calculatePoints(0, 'hard', 0); // No hints
  const score2 = calculatePoints(2, 'medium', 1); // 2 hints + 1 extra
  const score3 = calculatePoints(3, 'easy', 2); // Many hints

  console.log('Score with no hints (hard):', score1); // 300
  console.log('Score with 2 hints + 1 extra (medium):', score2); // 200 - 50 - 15 = 135
  console.log('Score with 3 hints + 2 extra (easy):', score3); // 100 - 75 - 30 = 10 (minimum)

  // Normalize titles
  const normalized1 = normalizeTitle('One Piece!');
  const normalized2 = normalizeTitle('NARUTO: Shippuden');
  console.log('\nNormalized "One Piece!":', normalized1); // "one piece"
  console.log('Normalized "NARUTO: Shippuden":', normalized2); // "naruto shippuden"

  // Check answers
  const validTitles = ['Naruto', 'Naruto: Shippuden', 'NARUTO'];
  console.log('\nValid titles:', validTitles);
  console.log('Check "naruto":', checkAnswer('naruto', validTitles)); // true
  console.log('Check "Naruto Shippuden":', checkAnswer('Naruto Shippuden', validTitles)); // true
  console.log('Check "One Piece":', checkAnswer('One Piece', validTitles)); // false
  console.log('Check "nart":', checkAnswer('nart', validTitles)); // false (too short/different)

  // Format time
  console.log('\nFormat 65 seconds:', formatTime(65)); // "01:05"
  console.log('Format 125 seconds:', formatTime(125)); // "02:05"
}

/**
 * Example 5: Generate hints
 */
async function exampleHints() {
  try {
    console.log('\n--- Hint Generation Example ---');
    const character = await fetchRandomCharacter();

    const normalizedCharacter = {
      id: character.id,
      name: character.name,
      imageUrl: character.image.large,
      validTitles: character.media.nodes.map((anime) => anime.title.romaji),
      animeAppearances: character.media.nodes.map((anime) => ({
        romaji: anime.title.romaji,
        english: anime.title.english,
      })),
    };

    console.log(`Character: ${character.name.full}`);
    console.log('\nGenerating 5 random hints:');
    for (let i = 0; i < 5; i++) {
      const hint = generateHint(normalizedCharacter);
      console.log(`  Hint ${i + 1}: ${hint}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('=== AniList API Integration Examples ===\n');

  await exampleFetchCharacter();
  await exampleSearchAnime();
  exampleGameLogic();
  await exampleHints();

  console.log('\n=== API Route Examples (requires dev server running) ===');
  console.log('Run these in your browser or with curl:');
  console.log('  1. http://localhost:3000/api/character');
  console.log('  2. http://localhost:3000/api/search?q=naruto');
}

// Uncomment to run examples:
// runAllExamples();

export {
  exampleFetchCharacter,
  exampleSearchAnime,
  exampleAPIRoutes,
  exampleGameLogic,
  exampleHints,
  runAllExamples,
};
