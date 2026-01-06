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
 * Fetch a random popular anime character using GraphQL
 * @returns Promise containing a random character with their anime appearances
 */
export async function fetchRandomCharacter(): Promise<Character> {
  // Generate random page number (1-2000 for popular characters)
  const randomPage = Math.floor(Math.random() * 2000) + 1;

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
