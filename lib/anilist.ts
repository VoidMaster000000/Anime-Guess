/**
 * AniList API Client
 * GraphQL API integration for fetching anime characters and searching titles
 */

const ANILIST_API_URL = 'https://graphql.anilist.co';

// Types for AniList responses
export interface Character {
  id: number;
  name: {
    full: string;
    native: string;
  };
  image: {
    large: string;
  };
  media: {
    nodes: Array<{
      title: {
        romaji: string;
        english: string | null;
      };
    }>;
  };
}

export interface AnimeTitle {
  title: {
    romaji: string;
    english: string | null;
  };
}

interface CharacterResponse {
  data: {
    Page: {
      characters: Character[];
    };
  };
}

interface SearchResponse {
  data: {
    Page: {
      media: AnimeTitle[];
    };
  };
}

/**
 * Difficulty-based page ranges for character popularity
 * Easy: Very popular characters (high favorites)
 * Medium: Moderately popular characters
 * Hard: Obscure characters (low favorites)
 * Timed: Same as Medium
 */
const DIFFICULTY_PAGE_RANGES: Record<string, { min: number; max: number }> = {
  EASY: { min: 1, max: 100 },      // Top 100 most favorited characters
  MEDIUM: { min: 100, max: 500 },  // Moderately popular
  HARD: { min: 500, max: 2000 },   // Obscure characters
  TIMED: { min: 100, max: 500 },   // Same as medium
};

/**
 * Fetch a random anime character based on difficulty
 * @param difficulty - Game difficulty (EASY, MEDIUM, HARD, TIMED)
 * @returns Promise containing a random character with their anime appearances
 */
export async function fetchRandomCharacter(difficulty: string = 'MEDIUM'): Promise<Character> {
  // Get page range based on difficulty
  const range = DIFFICULTY_PAGE_RANGES[difficulty] || DIFFICULTY_PAGE_RANGES.MEDIUM;

  // Generate random page number within the difficulty range
  const randomPage = Math.floor(Math.random() * (range.max - range.min)) + range.min;

  const query = `
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
  `;

  const variables = {
    page: randomPage,
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
    }

    const data: CharacterResponse = await response.json();

    if (!data.data?.Page?.characters?.[0]) {
      throw new Error('No character found in response');
    }

    return data.data.Page.characters[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch character: ${error.message}`);
    }
    throw new Error('Failed to fetch character: Unknown error');
  }
}

/**
 * Search anime titles for autocomplete
 * @param searchTerm - The search query string
 * @returns Promise containing array of matching anime titles
 */
export async function searchAnime(searchTerm: string): Promise<AnimeTitle[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const query = `
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
  `;

  const variables = {
    search: searchTerm.trim(),
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
    }

    const data: SearchResponse = await response.json();

    if (!data.data?.Page?.media) {
      return [];
    }

    return data.data.Page.media;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search anime: ${error.message}`);
    }
    throw new Error('Failed to search anime: Unknown error');
  }
}
