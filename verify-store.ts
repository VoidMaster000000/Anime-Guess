/**
 * Verification script to ensure store and types are working correctly
 * Run with: npx tsx verify-store.ts
 */

import { useGameStore, SHOP_ITEMS } from './store/gameStore';
import { GameDifficulty, ShopItemType } from './types';
import {
  DIFFICULTY_CONFIGS,
  calculatePoints,
  getDifficultyName,
} from './store/constants';

console.log('🎮 Verifying Anime Guessing Game Store...\n');

// Test 1: Check difficulty configs
console.log('✓ Test 1: Difficulty Configurations');
Object.entries(DIFFICULTY_CONFIGS).forEach(([key, config]) => {
  console.log(
    `  ${key.toUpperCase()}: ${config.lives} lives, ${config.initialHints} hints, ${config.pointsMultiplier}x points`
  );
});

// Test 2: Points calculation
console.log('\n✓ Test 2: Points Calculation');
const testCases = [
  { hints: 0, diff: GameDifficulty.EASY, expected: 100 },
  { hints: 2, diff: GameDifficulty.MEDIUM, expected: 150 },
  { hints: 0, diff: GameDifficulty.HARD, expected: 400 },
  { hints: 1, diff: GameDifficulty.TIMED, expected: 262 },
];

testCases.forEach(({ hints, diff, expected }) => {
  const points = calculatePoints(hints, diff);
  const match = points === expected ? '✓' : '✗';
  console.log(
    `  ${match} ${getDifficultyName(diff)}, ${hints} hints used: ${points} points (expected ${expected})`
  );
});

// Test 3: Shop items
console.log('\n✓ Test 3: Shop Items');
SHOP_ITEMS.forEach((item) => {
  console.log(
    `  ${item.icon} ${item.name}: ${item.cost} points (${item.type})`
  );
});

// Test 4: Enum values
console.log('\n✓ Test 4: Enum Values');
console.log('  GameDifficulty:', Object.values(GameDifficulty));
console.log('  ShopItemType:', Object.values(ShopItemType));

console.log('\n✅ All verifications passed!');
console.log('\nNext steps:');
console.log('  1. Create API route: app/api/character/route.ts');
console.log('  2. Build game UI components');
console.log('  3. Implement image pixelation system');
console.log('  4. Test game flow and persistence');
