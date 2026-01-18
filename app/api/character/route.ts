import { NextRequest, NextResponse } from 'next/server';
import { fetchRandomCharacter, Character } from '@/lib/anilist';

/**
 * Normalized character data for the game
 */
export interface NormalizedCharacter {
  id: number;
  name: {
    full: string;
    native: string;
  };
  imageUrl: string;
  validTitles: string[];
  animeAppearances: Array<{
    romaji: string;
    english: string | null;
  }>;
}

/**
 * Normalize character data from AniList API
 */
function normalizeCharacterData(character: Character): NormalizedCharacter {
  // Extract all valid anime titles (both romaji and english)
  const validTitles: string[] = [];
  const animeAppearances: Array<{ romaji: string; english: string | null }> = [];

  character.media.nodes.forEach((anime) => {
    // Add romaji title
    if (anime.title.romaji) {
      validTitles.push(anime.title.romaji);
    }

    // Add english title if it exists and is different from romaji
    if (anime.title.english && anime.title.english !== anime.title.romaji) {
      validTitles.push(anime.title.english);
    }

    animeAppearances.push({
      romaji: anime.title.romaji,
      english: anime.title.english,
    });
  });

  return {
    id: character.id,
    name: {
      full: character.name.full,
      native: character.name.native,
    },
    imageUrl: character.image.large,
    validTitles,
    animeAppearances,
  };
}

/**
 * GET /api/character
 * Fetches a random anime character for the guessing game
 * @query difficulty - Game difficulty (EASY, MEDIUM, HARD, TIMED)
 * @query exclude - Comma-separated list of character IDs to exclude (already seen)
 */
export async function GET(request: NextRequest) {
  try {
    // Get difficulty from query params (defaults to MEDIUM)
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') || 'MEDIUM';

    // Get excluded character IDs (already seen in this session)
    const excludeParam = searchParams.get('exclude') || '';
    const excludedIds = excludeParam
      ? excludeParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : [];

    // Maximum retry attempts to find a non-duplicate character
    const MAX_RETRIES = 10;
    let character: Character | null = null;
    let attempts = 0;

    // Keep trying until we find a character not in the excluded list
    while (attempts < MAX_RETRIES) {
      attempts++;
      const fetchedCharacter = await fetchRandomCharacter(difficulty);

      // Check if this character was already seen
      if (!excludedIds.includes(fetchedCharacter.id)) {
        // Also verify the character has anime appearances
        if (fetchedCharacter.media?.nodes && fetchedCharacter.media.nodes.length > 0) {
          character = fetchedCharacter;
          break;
        }
      }
    }

    // If we couldn't find a new character after max retries, return error
    if (!character) {
      return NextResponse.json(
        { error: 'Could not find a new character. Try starting a new game.' },
        { status: 404 }
      );
    }

    // Normalize and return character data
    const normalizedData = normalizeCharacterData(character);

    // Return in format expected by the game store
    return NextResponse.json({
      success: true,
      character: {
        id: normalizedData.id,
        name: normalizedData.name,
        image: { large: normalizedData.imageUrl },
        media: normalizedData.animeAppearances.map((a, i) => ({
          id: i,
          title: { romaji: a.romaji, english: a.english },
          type: 'ANIME' as const,
        })),
      },
      correctAnime: normalizedData.validTitles,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching character:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch character', details: errorMessage },
      { status: 500 }
    );
  }
}
