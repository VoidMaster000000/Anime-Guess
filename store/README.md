# Game Store Usage Guide

This document explains how to use the Zustand game store in your components.

## Basic Usage

```tsx
import { useGameStore } from '@/store/gameStore';

function MyComponent() {
  // Access state
  const streak = useGameStore((state) => state.streak);
  const points = useGameStore((state) => state.points);
  const gameStatus = useGameStore((state) => state.gameStatus);

  // Access actions
  const startGame = useGameStore((state) => state.startGame);
  const submitGuess = useGameStore((state) => state.submitGuess);

  return (
    <div>
      <p>Streak: {streak}</p>
      <p>Points: {points}</p>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}
```

## Using Helper Hooks

```tsx
import { useGameStats, useCanPurchase } from '@/store/gameStore';
import { SHOP_ITEMS } from '@/store/gameStore';

function StatsDisplay() {
  const stats = useGameStats();

  return (
    <div>
      <p>Current Streak: {stats.currentStreak}</p>
      <p>High Streak: {stats.highStreak}</p>
      <p>Current Points: {stats.currentPoints}</p>
      <p>Total Points: {stats.totalPoints}</p>
      <p>Hints Used: {stats.hintsUsed}</p>
      <p>Lives: {stats.livesRemaining}</p>
    </div>
  );
}

function ShopItem({ item }) {
  const canPurchase = useCanPurchase(item);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);

  return (
    <button
      disabled={!canPurchase}
      onClick={() => purchaseUpgrade(item)}
    >
      Buy {item.name} - {item.cost} points
    </button>
  );
}
```

## Game Flow Example

```tsx
import { useGameStore } from '@/store/gameStore';
import { GameDifficulty } from '@/types';

function GameFlow() {
  const {
    gameStatus,
    currentCharacter,
    difficulty,
    setDifficulty,
    startGame,
    submitGuess,
    revealHint,
    resetGame,
  } = useGameStore();

  // Menu screen
  if (gameStatus === 'menu') {
    return (
      <div>
        <h1>Select Difficulty</h1>
        <button onClick={() => setDifficulty(GameDifficulty.EASY)}>Easy</button>
        <button onClick={() => setDifficulty(GameDifficulty.MEDIUM)}>Medium</button>
        <button onClick={() => setDifficulty(GameDifficulty.HARD)}>Hard</button>
        <button onClick={() => setDifficulty(GameDifficulty.TIMED)}>Timed</button>
        <button onClick={startGame}>Start Game</button>
      </div>
    );
  }

  // Playing
  if (gameStatus === 'playing') {
    return (
      <div>
        <img src={currentCharacter?.image.large} alt="Character" />
        <button onClick={revealHint}>Reveal Hint</button>
        <input
          onSubmit={(e) => {
            e.preventDefault();
            const guess = e.target.guess.value;
            submitGuess(guess);
          }}
        />
      </div>
    );
  }

  // Correct answer
  if (gameStatus === 'correct') {
    return (
      <div>
        <h2>Correct!</h2>
        <button onClick={() => useGameStore.getState().fetchNewCharacter()}>
          Next Character
        </button>
      </div>
    );
  }

  // Game over
  if (gameStatus === 'gameover') {
    return (
      <div>
        <h2>Game Over!</h2>
        <button onClick={resetGame}>Play Again</button>
      </div>
    );
  }

  return null;
}
```

## Timer Implementation (for Timed Mode)

```tsx
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

function TimerComponent() {
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const decrementTimer = useGameStore((state) => state.decrementTimer);
  const gameStatus = useGameStore((state) => state.gameStatus);

  useEffect(() => {
    if (gameStatus === 'playing' && timeRemaining !== null) {
      const interval = setInterval(() => {
        decrementTimer();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStatus, timeRemaining, decrementTimer]);

  if (timeRemaining === null) return null;

  return (
    <div>
      <p>Time Remaining: {timeRemaining}s</p>
    </div>
  );
}
```

## Leaderboard

```tsx
import { useGameStore } from '@/store/gameStore';

function Leaderboard() {
  const leaderboard = useGameStore((state) => state.leaderboard);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={entry.id}>
            {index + 1}. {entry.username} - Streak: {entry.streak}, Points: {entry.points}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GameOver() {
  const [username, setUsername] = useState('');
  const saveToLeaderboard = useGameStore((state) => state.saveToLeaderboard);
  const streak = useGameStore((state) => state.streak);
  const points = useGameStore((state) => state.points);

  const handleSave = () => {
    saveToLeaderboard(username);
  };

  return (
    <div>
      <h2>Game Over!</h2>
      <p>Final Streak: {streak}</p>
      <p>Final Points: {points}</p>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={handleSave}>Save to Leaderboard</button>
    </div>
  );
}
```

## Shop Items

```tsx
import { SHOP_ITEMS, useCanPurchase } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';

function Shop() {
  const totalPoints = useGameStore((state) => state.totalPoints);
  const extraHintsOwned = useGameStore((state) => state.extraHintsOwned);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);

  return (
    <div>
      <h2>Shop</h2>
      <p>Total Points: {totalPoints}</p>
      <p>Extra Hints Owned: {extraHintsOwned}/5</p>

      {SHOP_ITEMS.map((item) => {
        const canPurchase = useCanPurchase(item);

        return (
          <div key={item.id}>
            <h3>{item.icon} {item.name}</h3>
            <p>{item.description}</p>
            <p>Cost: {item.cost} points</p>
            <button
              disabled={!canPurchase}
              onClick={() => purchaseUpgrade(item)}
            >
              {canPurchase ? 'Purchase' : 'Cannot Purchase'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

## Points Calculation

The store automatically calculates points based on:

- **Base Points**: 100
- **Hint Bonus**: +25 for each unused hint (max 4 hints)
- **Difficulty Multiplier**:
  - Easy: 0.5x
  - Medium: 1x
  - Hard: 2x
  - Timed: 1.5x

**Formula**: `(100 + (4 - hintsUsed) * 25) * difficultyMultiplier`

**Examples**:
- Easy mode, 0 hints used: (100 + 100) * 0.5 = 100 points
- Medium mode, 2 hints used: (100 + 50) * 1 = 150 points
- Hard mode, 0 hints used: (100 + 100) * 2 = 400 points
- Timed mode, 1 hint used: (100 + 75) * 1.5 = 262 points

## Persistence

The following data is automatically saved to localStorage:
- `highStreak`: All-time high streak
- `totalPoints`: All-time total points earned
- `extraHintsOwned`: Number of permanent hint slots purchased
- `leaderboard`: Top 100 leaderboard entries

This data persists across sessions and page refreshes.
