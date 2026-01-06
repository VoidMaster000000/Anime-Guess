# Anime Guessing Game - Type System and Store Implementation

## Overview

This document summarizes the TypeScript types and Zustand store implementation for the Anime Guessing Game.

## File Structure

```
anime-guess-game/
├── types/
│   └── index.ts           # All TypeScript type definitions
├── store/
│   ├── gameStore.ts       # Main Zustand store with all game logic
│   ├── constants.ts       # Game constants and helper functions
│   ├── index.ts           # Central export for easy imports
│   └── README.md          # Detailed usage guide and examples
└── IMPLEMENTATION_SUMMARY.md  # This file
```

## Type Definitions (types/index.ts)

### Core Types

1. **Character** - Represents an anime character with:
   - ID, name (full and native)
   - Image URLs (large and medium)
   - Media array (all anime/manga appearances)

2. **AnimeMedia** - Represents an anime/manga series with:
   - ID, title (romaji, english, native)
   - Type and format
   - Cover images

3. **AnimeTitle** - Multi-language title support

### Game Configuration

4. **GameDifficulty** - Enum with 4 levels:
   - EASY, MEDIUM, HARD, TIMED

5. **DifficultyConfig** - Configuration per difficulty:
   - Lives count
   - Initial hints revealed
   - Points multiplier
   - Time limit (timed mode only)

### Shop System

6. **ShopItem** - Shop item with:
   - ID, name, description
   - Cost in points
   - Type (extra_hint, extra_life, hint_reveal, skip)
   - Max owned limit
   - Icon

7. **ShopItemType** - Enum for item types

### Game State

8. **GameState** - Complete state interface with:
   - Current character and valid answers
   - Hints system (revealed, max, owned)
   - Lives and scoring
   - Difficulty and status
   - Timer for timed mode
   - Leaderboard
   - All actions and helper methods

9. **GameStatus** - Type: 'menu' | 'playing' | 'gameover' | 'correct'

10. **LeaderboardEntry** - Player entry with:
    - Username, streak, points
    - Difficulty level
    - Date and timestamp

## Zustand Store (store/gameStore.ts)

### Difficulty Configurations

| Difficulty | Lives | Initial Hints | Points Multiplier | Time Limit |
|-----------|-------|---------------|-------------------|------------|
| Easy      | 5     | 2             | 0.5x              | None       |
| Medium    | 3     | 1             | 1x                | None       |
| Hard      | 2     | 0             | 2x                | None       |
| Timed     | 3     | 1             | 1.5x              | 30 seconds |

### Points Calculation

**Formula**: `(100 + (4 - hintsUsed) * 25) * difficultyMultiplier`

- Base: 100 points
- Bonus: +25 points per unused hint (max 4 hints)
- Multiplied by difficulty multiplier

**Examples**:
- Easy, 0 hints: (100 + 100) × 0.5 = **100 points**
- Medium, 2 hints: (100 + 50) × 1 = **150 points**
- Hard, 0 hints: (100 + 100) × 2 = **400 points**
- Timed, 1 hint: (100 + 75) × 1.5 = **262 points**

### State Properties

#### Current Round
- `currentCharacter`: Active character to guess
- `correctAnime`: Array of all valid anime titles

#### Hints System
- `hintsRevealed`: Number of quadrants shown (0-4)
- `maxHints`: Total hints available (4 base + extras)
- `extraHintsOwned`: Permanent hint slots purchased (max 5)

#### Lives & Scoring
- `lives`: Current lives remaining
- `maxLives`: Maximum lives for current difficulty
- `streak`: Current correct answer streak
- `highStreak`: All-time best streak
- `points`: Points in current game
- `totalPoints`: All-time total points (persistent)

#### Game Settings
- `difficulty`: Current difficulty level
- `gameStatus`: Current game state
- `isLoading`: Loading indicator

#### Timer
- `timeRemaining`: Seconds left (null if not timed mode)

#### Leaderboard
- `leaderboard`: Array of top 100 entries

### Actions

1. **setDifficulty(difficulty)** - Set game difficulty
2. **startGame()** - Initialize new game with selected difficulty
3. **fetchNewCharacter()** - Get new character from API
4. **revealHint()** - Show one more quadrant
5. **submitGuess(guess)** - Check answer, update lives/streak/points
6. **skipCharacter()** - Skip current character (costs 50 points)
7. **purchaseUpgrade(item)** - Buy shop item if affordable
8. **resetGame()** - Return to menu, preserve persistent data
9. **saveToLeaderboard(username)** - Add entry to leaderboard
10. **decrementTimer()** - Decrease timer by 1 second

### Internal Helpers

- **_calculatePoints()** - Calculate points based on hints and difficulty
- **_checkAnswer(guess, validAnswers)** - Validate guess against all valid titles

### Persistence (localStorage)

Auto-saved data:
- `highStreak` - All-time best streak
- `totalPoints` - Total points earned across all games
- `extraHintsOwned` - Purchased permanent hint slots
- `leaderboard` - Top 100 player entries

Storage key: `anime-guess-game-storage`

### Shop Items

1. **Extra Hint Slot** (500 points)
   - Permanently increase max hints by 1
   - Max 5 total extra hints

2. **Extra Life** (200 points)
   - Restore one life in current game
   - Can't exceed max lives

3. **Reveal Hint** (100 points)
   - Immediately reveal one more quadrant
   - Max 4 quadrants total

### Helper Hooks

1. **useDifficultyConfig()** - Get current difficulty configuration
2. **useGameStats()** - Get formatted game statistics
3. **useCanAfford(item)** - Check if player has enough points
4. **useCanPurchase(item)** - Check if item can be purchased (points + limits)

## Usage Examples

### Basic Store Usage

```tsx
import { useGameStore } from '@/store/gameStore';

function GameComponent() {
  const {
    streak,
    points,
    lives,
    startGame,
    submitGuess
  } = useGameStore();

  return (
    <div>
      <p>Streak: {streak} | Points: {points} | Lives: {lives}</p>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}
```

### Using Helper Hooks

```tsx
import { useGameStats } from '@/store/gameStore';

function StatsDisplay() {
  const stats = useGameStats();

  return (
    <div>
      <p>Current: {stats.currentStreak}</p>
      <p>Best: {stats.highStreak}</p>
      <p>Points: {stats.currentPoints}</p>
      <p>Total: {stats.totalPoints}</p>
    </div>
  );
}
```

### Shop Integration

```tsx
import { SHOP_ITEMS, useCanPurchase } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';

function Shop() {
  const purchaseUpgrade = useGameStore(state => state.purchaseUpgrade);

  return (
    <div>
      {SHOP_ITEMS.map(item => {
        const canBuy = useCanPurchase(item);
        return (
          <button
            key={item.id}
            disabled={!canBuy}
            onClick={() => purchaseUpgrade(item)}
          >
            Buy {item.name} - {item.cost} pts
          </button>
        );
      })}
    </div>
  );
}
```

### Timer Implementation (Timed Mode)

```tsx
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

function Timer() {
  const timeRemaining = useGameStore(state => state.timeRemaining);
  const decrementTimer = useGameStore(state => state.decrementTimer);
  const gameStatus = useGameStore(state => state.gameStatus);

  useEffect(() => {
    if (gameStatus === 'playing' && timeRemaining !== null) {
      const interval = setInterval(decrementTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus, timeRemaining, decrementTimer]);

  if (!timeRemaining) return null;

  return <p>Time: {timeRemaining}s</p>;
}
```

## Constants (store/constants.ts)

### Exported Constants

- `DIFFICULTY_CONFIGS` - Configuration map
- `DIFFICULTY_NAMES` - Human-readable names
- `DIFFICULTY_DESCRIPTIONS` - Detailed descriptions
- `BASE_POINTS` - Base points (100)
- `HINT_BONUS` - Bonus per hint (25)
- `MAX_EXTRA_HINTS` - Max purchasable hints (5)
- `SKIP_COST` - Cost to skip (50)
- `MAX_LEADERBOARD_ENTRIES` - Leaderboard size (100)
- `SHOP_PRICES` - All shop item prices
- `API_ENDPOINTS` - API route paths
- `ANIMATION_DURATIONS` - UI animation timings

### Helper Functions

- `calculatePoints(hintsUsed, difficulty)` - Calculate earned points
- `getDifficultyConfig(difficulty)` - Get config object
- `getDifficultyName(difficulty)` - Get display name
- `getDifficultyDescription(difficulty)` - Get description
- `formatPoints(points)` - Add comma separators
- `formatLeaderboardDate(dateString)` - Format date for display

## API Integration

### Expected API Route: /api/character

**Response Type**: `FetchCharacterResponse`

```typescript
{
  success: boolean;
  character?: Character;
  correctAnime?: string[];
  error?: string;
}
```

The store expects:
- `character`: Full character object from AniList API
- `correctAnime`: Array of all valid anime title variations

## Next Steps

1. **Create API Route** (`app/api/character/route.ts`)
   - Integrate with AniList GraphQL API
   - Fetch random popular character
   - Extract all anime title variations
   - Return formatted response

2. **Build UI Components**
   - Menu/difficulty selection
   - Game board with pixelated image
   - Hint system (4 quadrants)
   - Guess input/submission
   - Lives and streak display
   - Shop modal
   - Leaderboard display
   - Game over screen

3. **Image Processing**
   - Implement pixelation effect
   - Create quadrant reveal system
   - Optimize image loading

4. **Testing**
   - Test all difficulty modes
   - Verify points calculation
   - Test persistence
   - Test shop purchases
   - Test timer functionality

## Dependencies

Already installed:
- `zustand` (^5.0.9) - State management
- `next` (16.1.1) - Framework
- `react` (19.2.3) - UI library
- `typescript` (^5) - Type safety

## Summary

The type system and Zustand store are now complete and ready for integration with:
- Next.js App Router components
- AniList API integration
- UI components for gameplay
- Image processing system

All game logic, scoring, persistence, and state management is fully implemented and type-safe.
