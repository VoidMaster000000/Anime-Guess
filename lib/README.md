# AniList API Integration

This directory contains the AniList API integration for the Anime Guessing Game.

## Files

### `anilist.ts` - AniList API Client

GraphQL client for interacting with the AniList API.

#### Functions

**`fetchRandomCharacter(): Promise<Character>`**
- Fetches a random popular anime character
- Uses random page selection (1-2000) for variety
- Includes character's top 5 anime appearances by popularity
- Returns character with name, image, and anime list

**`searchAnime(searchTerm: string): Promise<AnimeTitle[]>`**
- Searches for anime titles matching the query
- Returns up to 10 results
- Includes both romaji and english titles
- Debounce-friendly for autocomplete

#### Example Usage

```typescript
import { fetchRandomCharacter, searchAnime } from '@/lib/anilist';

// Get random character
const character = await fetchRandomCharacter();
console.log(character.name.full); // "Naruto Uzumaki"

// Search anime
const results = await searchAnime('one piece');
console.log(results[0].title.romaji); // "One Piece"
```

---

### `utils.ts` - Game Utility Functions

Helper functions for game logic and UI utilities.

#### Functions

**`calculatePoints(hintsUsed, difficulty, extraHintsUsed): number`**
- Calculates score based on performance
- Base points: Easy (100), Medium (200), Hard (300)
- Deductions: 25 per hint, 15 per extra hint
- Minimum score: 10 points

**`normalizeTitle(title: string): string`**
- Normalizes titles for comparison
- Converts to lowercase
- Removes special characters
- Collapses whitespace

**`checkAnswer(guess: string, validTitles: string[]): boolean`**
- Checks if user's guess matches any valid title
- Supports exact matches
- Allows partial matches (80% similarity threshold)
- Case-insensitive

**`generateHint(character: Character): string`**
- Generates contextual hints about the character
- Hints about anime count, title length, name structure
- Random selection from available hint pool

**Additional Utilities:**
- `formatTime(seconds)` - Format seconds to MM:SS
- `getDifficultyColor(difficulty)` - Get Tailwind color class
- `shuffleArray(array)` - Fisher-Yates shuffle
- `cn(...inputs)` - Merge Tailwind classes

#### Example Usage

```typescript
import { calculatePoints, checkAnswer, normalizeTitle } from '@/lib/utils';

// Calculate score
const score = calculatePoints(2, 'medium', 1); // 200 - (2*25) - (1*15) = 135

// Check answer
const isCorrect = checkAnswer('naruto', ['Naruto', 'Naruto Shippuden']); // true

// Normalize title
const normalized = normalizeTitle('One Piece!'); // "one piece"
```

---

### `types.ts` - TypeScript Type Definitions

Shared types used across the application.

#### Types

- `Difficulty` - 'easy' | 'medium' | 'hard'
- `Character` - Character data structure
- `GameState` - Game state interface
- `SearchResult` - Search result format
- `Hint` - Hint object structure

---

## API Routes

### `app/api/character/route.ts`

**GET /api/character**

Fetches a random anime character for the game.

**Response:**
```json
{
  "id": 40,
  "name": {
    "full": "Naruto Uzumaki",
    "native": "うずまきナルト"
  },
  "imageUrl": "https://s4.anilist.co/file/anilistcdn/character/large/...",
  "validTitles": ["Naruto", "Naruto Shippuden"],
  "animeAppearances": [
    {
      "romaji": "Naruto",
      "english": "Naruto"
    }
  ]
}
```

**Error Handling:**
- Retries once if character has no anime
- Returns 404 if still no anime after retry
- Returns 500 for API errors

---

### `app/api/search/route.ts`

**GET /api/search?q=searchterm**

Searches anime titles for autocomplete.

**Query Parameters:**
- `q` - Search query (required, max 100 chars)

**Response:**
```json
[
  {
    "romaji": "One Piece",
    "english": "One Piece"
  },
  {
    "romaji": "One Punch Man",
    "english": "One-Punch Man"
  }
]
```

**Caching:**
- 5-minute cache (max-age=300)
- 10-minute stale-while-revalidate

**Error Handling:**
- 400 for missing/invalid query
- 500 for API errors

---

## Environment Variables

No environment variables required. The AniList API is public and doesn't require authentication.

---

## Rate Limiting

AniList API has rate limits:
- 90 requests per minute
- Consider implementing client-side caching
- Search endpoint includes 5-minute cache headers

---

## Error Handling

All API functions include comprehensive error handling:
- Network errors
- Invalid responses
- Missing data
- Type validation

Errors are logged to console and returned with descriptive messages.

---

## Testing the API

### Test Character Endpoint
```bash
curl http://localhost:3000/api/character
```

### Test Search Endpoint
```bash
curl "http://localhost:3000/api/search?q=naruto"
```

---

## GraphQL Queries

### Character Query
```graphql
query GetRandomCharacter($page: Int!) {
  Page(page: $page, perPage: 1) {
    characters(sort: FAVOURITES_DESC) {
      id
      name {
        full
        native
      }
      image {
        large
      }
      media(sort: POPULARITY_DESC, type: ANIME, perPage: 5) {
        nodes {
          title {
            romaji
            english
          }
        }
      }
    }
  }
}
```

### Search Query
```graphql
query SearchAnime($search: String!) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME) {
      title {
        romaji
        english
      }
    }
  }
}
```

---

## Performance Considerations

1. **Character Fetching**: No caching (each game needs unique character)
2. **Search**: 5-minute cache to reduce API calls
3. **Random Selection**: Uses page-based randomization (1-2000)
4. **Retry Logic**: Single retry for characters without anime

---

## Future Improvements

- [ ] Add character filtering by genre/popularity
- [ ] Implement difficulty-based character selection
- [ ] Add more sophisticated hint generation
- [ ] Cache popular characters client-side
- [ ] Add image preloading
- [ ] Implement answer fuzzy matching
