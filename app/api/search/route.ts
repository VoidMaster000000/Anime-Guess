import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';

/**
 * Simplified anime title for search results
 */
export interface SearchResult {
  romaji: string;
  english: string | null;
}

/**
 * GET /api/search?q=searchterm
 * Search anime titles for autocomplete functionality
 */
export async function GET(request: NextRequest) {
  try {
    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Limit query length to prevent abuse
    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long (max 100 characters)' },
        { status: 400 }
      );
    }

    // Search anime titles
    const results = await searchAnime(query);

    // Transform results to simplified format
    const searchResults: SearchResult[] = results.map((anime) => ({
      romaji: anime.title.romaji,
      english: anime.title.english,
    }));

    return NextResponse.json(searchResults, {
      headers: {
        // Cache for 5 minutes to reduce API calls
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error searching anime:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to search anime', details: errorMessage },
      { status: 500 }
    );
  }
}
