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
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch random character from AniList
    const character = await fetchRandomCharacter();

    // Ensure character has at least one anime appearance
    if (!character.media?.nodes || character.media.nodes.length === 0) {
      // Retry once if no anime found
      const retryCharacter = await fetchRandomCharacter();
      if (!retryCharacter.media?.nodes || retryCharacter.media.nodes.length === 0) {
        return NextResponse.json(
          { error: 'Character has no anime appearances' },
          { status: 404 }
        );
      }
      const normalizedData = normalizeCharacterData(retryCharacter);
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
      });
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
