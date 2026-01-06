/**
 * Quick test script for AniList API integration
 * Run with: node test-api.mjs
 */

const ANILIST_API_URL = 'https://graphql.anilist.co';

async function testFetchCharacter() {
  console.log('Testing fetchRandomCharacter...\n');

  const randomPage = Math.floor(Math.random() * 2000) + 1;
  console.log(`Random page: ${randomPage}`);

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

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { page: randomPage },
      }),
    });

    const data = await response.json();
    const character = data.data.Page.characters[0];

    console.log('✓ Character fetched successfully!');
    console.log(`  Name: ${character.name.full}`);
    console.log(`  Native: ${character.name.native}`);
    console.log(`  ID: ${character.id}`);
    console.log(`  Anime appearances: ${character.media.nodes.length}`);
    console.log('\nAnime list:');
    character.media.nodes.forEach((anime, i) => {
      console.log(`  ${i + 1}. ${anime.title.romaji}${anime.title.english ? ` (${anime.title.english})` : ''}`);
    });
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function testSearchAnime() {
  console.log('\n\nTesting searchAnime...\n');

  const searchTerm = 'one piece';
  console.log(`Search term: "${searchTerm}"`);

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

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: searchTerm },
      }),
    });

    const data = await response.json();
    const results = data.data.Page.media;

    console.log(`✓ Found ${results.length} results:\n`);
    results.forEach((anime, i) => {
      console.log(`  ${i + 1}. ${anime.title.romaji}${anime.title.english ? ` (${anime.title.english})` : ''}`);
    });
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function testUtilities() {
  console.log('\n\nTesting utility functions...\n');

  // Test normalizeTitle
  const normalizeTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  console.log('normalizeTitle tests:');
  console.log(`  "One Piece!" → "${normalizeTitle('One Piece!')}"`);
  console.log(`  "NARUTO: Shippuden" → "${normalizeTitle('NARUTO: Shippuden')}"`);

  // Test calculatePoints
  const calculatePoints = (hintsUsed, difficulty, extraHints = 0) => {
    const base = { easy: 100, medium: 200, hard: 300 }[difficulty];
    const deduction = hintsUsed * 25 + extraHints * 15;
    return Math.max(10, base - deduction);
  };

  console.log('\ncalculatePoints tests:');
  console.log(`  0 hints, hard: ${calculatePoints(0, 'hard', 0)} points`);
  console.log(`  2 hints, medium: ${calculatePoints(2, 'medium', 0)} points`);
  console.log(`  3 hints + 2 extra, easy: ${calculatePoints(3, 'easy', 2)} points`);

  // Test checkAnswer
  const checkAnswer = (guess, validTitles) => {
    const normalizedGuess = normalizeTitle(guess);

    for (const title of validTitles) {
      const normalizedTitle = normalizeTitle(title);
      if (normalizedGuess === normalizedTitle) return true;
    }

    return false;
  };

  console.log('\ncheckAnswer tests:');
  const validTitles = ['Naruto', 'Naruto: Shippuden'];
  console.log(`  Valid titles: ${validTitles.join(', ')}`);
  console.log(`  "naruto" → ${checkAnswer('naruto', validTitles)}`);
  console.log(`  "Naruto Shippuden" → ${checkAnswer('Naruto Shippuden', validTitles)}`);
  console.log(`  "One Piece" → ${checkAnswer('One Piece', validTitles)}`);
}

async function runTests() {
  console.log('=================================');
  console.log('AniList API Integration Tests');
  console.log('=================================\n');

  await testFetchCharacter();
  await testSearchAnime();
  testUtilities();

  console.log('\n=================================');
  console.log('All tests completed!');
  console.log('=================================\n');
}

runTests().catch(console.error);
