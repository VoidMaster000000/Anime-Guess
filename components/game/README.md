# Game Components

Dark anime-themed game components built with Next.js, Tailwind CSS, Framer Motion, and Lucide React icons.

## Components

### 1. CharacterImage

A 4-quadrant image reveal system that progressively reveals a character image.

**Features:**
- 2x2 grid layout (400x400px total, 200x200px per quadrant)
- Independent quadrant reveal with smooth animations
- 20px blur filter on hidden quadrants
- Purple/pink gradient glowing border
- Reveal order: top-left → top-right → bottom-left → bottom-right

**Props:**
```typescript
interface CharacterImageProps {
  imageUrl: string;           // URL of character image
  revealedQuadrants: number;  // Number of quadrants to reveal (0-4+)
}
```

**Usage:**
```tsx
import { CharacterImage } from '@/components/game';

<CharacterImage
  imageUrl="/character.jpg"
  revealedQuadrants={2}
/>
```

---

### 2. GuessInput

Autocomplete input for anime title guessing with debounced search.

**Features:**
- 300ms debounced search
- Dropdown with matching anime titles
- Keyboard navigation (arrow keys, enter, escape)
- Loading state indicator
- Auto-close on click outside
- Displays both romaji and English titles

**Props:**
```typescript
interface GuessInputProps {
  onGuess: (guess: string) => void;  // Callback when user submits guess
  disabled: boolean;                 // Disable input during processing
}
```

**API Integration:**
Fetches suggestions from `/api/search?q=term` endpoint.

**Usage:**
```tsx
import { GuessInput } from '@/components/game';

<GuessInput
  onGuess={(guess) => console.log('User guessed:', guess)}
  disabled={false}
/>
```

---

### 3. GameStats

Displays current game statistics with animated updates.

**Features:**
- Lives display with heart icons (filled/empty)
- Current streak with fire icon
- Points with star icon
- High streak with trophy icon
- Animated number changes
- Heart pulse animation when life is lost

**Props:**
```typescript
interface GameStatsProps {
  lives: number;        // Current lives
  maxLives: number;     // Maximum lives for difficulty
  streak: number;       // Current streak
  points: number;       // Current points
  highStreak: number;   // All-time high streak
}
```

**Usage:**
```tsx
import { GameStats } from '@/components/game';

<GameStats
  lives={3}
  maxLives={5}
  streak={5}
  points={250}
  highStreak={10}
/>
```

---

### 4. HintButton

Button to reveal the next hint/quadrant.

**Features:**
- Shows hints remaining count
- Displays cost in points
- Disabled when all hints revealed
- Animated glow effect when enabled
- Progress bar indicator

**Props:**
```typescript
interface HintButtonProps {
  hintsRevealed: number;           // Number of hints already revealed
  maxHints: number;                // Maximum hints available
  onReveal: () => void;            // Callback when button clicked
  cost: number;                    // Point cost to reveal hint
}
```

**Usage:**
```tsx
import { HintButton } from '@/components/game';

<HintButton
  hintsRevealed={2}
  maxHints={4}
  onReveal={() => console.log('Reveal next hint')}
  cost={50}
/>
```

---

### 5. GameOver

Modal dialog displayed when game ends.

**Features:**
- Animated entrance/exit
- Final stats display (streak, points)
- Username input for leaderboard
- Save score and play again buttons
- Confetti effect for new records
- Dark overlay backdrop

**Props:**
```typescript
interface GameOverProps {
  isOpen: boolean;                        // Control modal visibility
  finalStreak: number;                    // Final streak achieved
  finalPoints: number;                    // Final points earned
  highStreak: number;                     // All-time high streak
  onSaveScore: (username: string) => void; // Save to leaderboard
  onPlayAgain: () => void;                // Start new game
  onClose?: () => void;                   // Close modal (optional)
}
```

**Usage:**
```tsx
import { GameOver } from '@/components/game';

<GameOver
  isOpen={gameOver}
  finalStreak={8}
  finalPoints={400}
  highStreak={12}
  onSaveScore={(username) => saveToLeaderboard(username)}
  onPlayAgain={() => startNewGame()}
/>
```

---

### 6. DifficultySelect

Difficulty selection screen with cards for each mode.

**Features:**
- Four difficulty modes: Easy, Medium, Hard, Timed
- Displays lives, hints, and points multiplier
- Animated hover effects with glow
- Unique icons and colors for each difficulty
- Responsive grid layout

**Difficulty Modes:**
- **Easy**: 5 lives, 4 hints, 1x points
- **Medium**: 3 lives, 3 hints, 1.5x points
- **Hard**: 2 lives, 2 hints, 2x points
- **Timed**: 3 lives, 2 hints, 2.5x points, 30s time limit

**Props:**
```typescript
interface DifficultySelectProps {
  onSelect: (difficulty: GameDifficulty) => void;
}
```

**Usage:**
```tsx
import { DifficultySelect } from '@/components/game';
import { GameDifficulty } from '@/types';

<DifficultySelect
  onSelect={(difficulty) => startGame(difficulty)}
/>
```

---

## Styling

All components use a consistent dark anime theme:

- **Background**: Gray-900 (`bg-gray-900`)
- **Primary Gradient**: Purple to Pink (`from-purple-500 to-pink-500`)
- **Border Glow**: Purple with opacity (`border-purple-500/30`)
- **Text**: White for primary, gray-400 for secondary
- **Animations**: Framer Motion with smooth transitions

## Dependencies

```json
{
  "framer-motion": "^12.24.0",
  "lucide-react": "^0.562.0",
  "tailwindcss": "^4",
  "next": "16.1.1",
  "react": "19.2.3"
}
```

## File Structure

```
components/game/
├── CharacterImage.tsx
├── GuessInput.tsx
├── GameStats.tsx
├── HintButton.tsx
├── GameOver.tsx
├── DifficultySelect.tsx
├── index.ts
└── README.md
```

## Import All Components

```tsx
import {
  CharacterImage,
  GuessInput,
  GameStats,
  HintButton,
  GameOver,
  DifficultySelect,
} from '@/components/game';
```
