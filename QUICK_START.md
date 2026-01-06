# Quick Start Guide - AniList API Integration

## Testing the API

### 1. Run the test script
```bash
node test-api.mjs
```
This will verify the AniList API integration works correctly.

### 2. Start the development server
```bash
npm run dev
```

### 3. Test the endpoints in your browser
- Character: http://localhost:3000/api/character
- Search: http://localhost:3000/api/search?q=naruto

## Using in Your Components

### Fetch a Random Character (Server Component)
```typescript
import { fetchRandomCharacter } from '@/lib/anilist';

export default async function GamePage() {
  const character = await fetchRandomCharacter();

  return (
    <div>
      <img src={character.image.large} alt={character.name.full} />
      <h1>{character.name.full}</h1>
    </div>
  );
}
```

### Fetch Character (Client Component)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { NormalizedCharacter } from '@/app/api/character/route';

export default function Game() {
  const [character, setCharacter] = useState<NormalizedCharacter | null>(null);

  const fetchNewCharacter = async () => {
    const response = await fetch('/api/character');
    const data = await response.json();
    setCharacter(data);
  };

  useEffect(() => {
    fetchNewCharacter();
  }, []);

  return character ? (
    <div>
      <img src={character.imageUrl} alt="Guess the anime!" />
      {/* Game UI */}
    </div>
  ) : (
    <div>Loading...</div>
  );
}
```

### Search Anime (Autocomplete)
```typescript
'use client';

import { useState } from 'react';
import { SearchResult } from '@/app/api/search/route';

export default function AnimeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search anime..."
      />
      <ul>
        {results.map((anime, i) => (
          <li key={i}>
            {anime.romaji}
            {anime.english && anime.english !== anime.romaji && ` (${anime.english})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Check User Answer
```typescript
import { checkAnswer } from '@/lib/utils';

function handleGuess(guess: string, character: NormalizedCharacter) {
  const isCorrect = checkAnswer(guess, character.validTitles);

  if (isCorrect) {
    console.log('Correct!');
  } else {
    console.log('Try again!');
  }

  return isCorrect;
}
```

### Calculate Score
```typescript
import { calculatePoints } from '@/lib/utils';

const hintsUsed = 2;
const difficulty = 'medium';
const extraHintsUsed = 1;

const score = calculatePoints(hintsUsed, difficulty, extraHintsUsed);
// Result: 200 - (2 * 25) - (1 * 15) = 135 points
```

### Generate Hints
```typescript
import { generateHint } from '@/lib/utils';

const hint = generateHint(character);
// Returns random hint like:
// "This character appears in 3 different anime series."
// "The most popular anime starts with 'Naruto...'"
// "The character's name starts with 'N'."
```

## Common Patterns

### Full Game Flow
```typescript
'use client';

import { useState } from 'react';
import { NormalizedCharacter } from '@/app/api/character/route';
import { checkAnswer, calculatePoints, generateHint } from '@/lib/utils';

export default function AnimeGame() {
  const [character, setCharacter] = useState<NormalizedCharacter | null>(null);
  const [guess, setGuess] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const loadNewCharacter = async () => {
    const res = await fetch('/api/character');
    const data = await res.json();
    setCharacter(data);
    setGuess('');
    setHintsUsed(0);
    setGameOver(false);
  };

  const handleGuess = () => {
    if (!character) return;

    const isCorrect = checkAnswer(guess, character.validTitles);

    if (isCorrect) {
      const score = calculatePoints(hintsUsed, 'medium', 0);
      alert(`Correct! Score: ${score}`);
      setGameOver(true);
    } else {
      alert('Wrong! Try again.');
    }
  };

  const showHint = () => {
    if (character) {
      const hint = generateHint(character);
      alert(hint);
      setHintsUsed(hintsUsed + 1);
    }
  };

  return (
    <div>
      {character && (
        <>
          <img src={character.imageUrl} alt="Guess the anime!" />
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter anime name..."
          />
          <button onClick={handleGuess}>Submit</button>
          <button onClick={showHint}>Show Hint (-25 pts)</button>
          {gameOver && (
            <>
              <p>Correct! The anime was: {character.validTitles.join(', ')}</p>
              <button onClick={loadNewCharacter}>Next Character</button>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

## Utility Functions Reference

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `calculatePoints` | hintsUsed, difficulty, extraHints | number | Calculate game score |
| `normalizeTitle` | title | string | Normalize for comparison |
| `checkAnswer` | guess, validTitles | boolean | Validate user answer |
| `generateHint` | character | string | Create text hint |
| `formatTime` | seconds | string | Format as MM:SS |
| `getDifficultyColor` | difficulty | string | Get Tailwind class |
| `shuffleArray` | array | array | Randomize array |

## TypeScript Types

Import types for better type safety:

```typescript
import type { Difficulty } from '@/lib/types';
import type { NormalizedCharacter } from '@/app/api/character/route';
import type { SearchResult } from '@/app/api/search/route';
```

## Tips

1. **Debounce search** - Use a debounce library or setTimeout for the search input
2. **Cache characters** - Store in state management (Zustand) to avoid refetching
3. **Preload images** - Use Next.js Image component for optimization
4. **Error boundaries** - Wrap components in error boundaries for API failures
5. **Loading states** - Show skeletons while fetching data

## Troubleshooting

### Character has no anime?
The API retries once automatically. If it still fails, try fetching again.

### Search not working?
Check the query parameter is URL encoded and at least 1 character.

### Slow response?
Search endpoint is cached for 5 minutes. First request may be slower.

### Type errors?
Make sure to import types from the correct files:
- Character types: `@/app/api/character/route`
- Search types: `@/app/api/search/route`
- Game types: `@/lib/types`

---

**For more details, see:**
- `lib/README.md` - Full API documentation
- `lib/example-usage.ts` - Complete code examples
- `API_INTEGRATION_SUMMARY.md` - Implementation summary
