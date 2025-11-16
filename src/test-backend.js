#!/usr/bin/env node

/**
 * 🧪 THEE ARCHIVE - Backend Test Script
 * 
 * Run this to verify your Supabase backend is working
 * Usage: node test-backend.js
 */

const BASE_URL = 'https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dndzYmlxZ3RqY3dwaGFkeXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTI2ODksImV4cCI6MjA3ODM4ODY4OX0.KDup_c59yIl2NHkREqClHyvxcRaGOYf5_xggfmYVy4c';

console.log('🎬 THEE ARCHIVE - Backend Test\n');
console.log('Testing backend at:', BASE_URL);
console.log('─'.repeat(60));

// Colors for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function success(msg) {
  console.log(`${colors.green}✓ ${msg}${colors.reset}`);
}

function error(msg) {
  console.log(`${colors.red}✗ ${msg}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ ${msg}${colors.reset}`);
}

function warn(msg) {
  console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`);
}

async function testHealthCheck() {
  try {
    info('Testing health check endpoint...');
    const response = await fetch(`${BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        success('Health check passed!');
        return true;
      } else {
        error('Health check returned unexpected status');
        return false;
      }
    } else {
      error(`Health check failed with status: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Health check error: ${err.message}`);
    return false;
  }
}

async function testGetMovies() {
  try {
    info('Testing get movies endpoint...');
    const response = await fetch(`${BASE_URL}/movies`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        success(`Get movies passed! Found ${data.movies.length} movies`);
        if (data.movies.length > 0) {
          info('Sample movie:');
          console.log(JSON.stringify(data.movies[0], null, 2));
        } else {
          warn('No movies in database yet - add some via admin portal!');
        }
        return true;
      } else {
        error('Get movies returned success: false');
        return false;
      }
    } else {
      error(`Get movies failed with status: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Get movies error: ${err.message}`);
    return false;
  }
}

async function testAddMovie() {
  try {
    info('Testing add movie endpoint...');
    const testMovie = {
      title: 'Test Movie (Auto-Generated)',
      description: 'This is a test movie created by the backend test script',
      videoUrl: 'https://example.com/test-movie.mp4',
      thumbnailUrl: 'https://example.com/test-poster.jpg',
      genre: 'Test',
      year: '2025',
      type: 'movie',
      fileSize: '1.5 GB'
    };
    
    const response = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMovie)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        success('Add movie passed!');
        info(`Created movie with ID: ${data.movie.id}`);
        return data.movie.id; // Return ID for deletion test
      } else {
        error('Add movie returned success: false');
        return null;
      }
    } else {
      error(`Add movie failed with status: ${response.status}`);
      return null;
    }
  } catch (err) {
    error(`Add movie error: ${err.message}`);
    return null;
  }
}

async function testUpdateMovie(movieId) {
  try {
    info('Testing update movie endpoint...');
    const updates = {
      title: 'Test Movie (Updated)',
      description: 'This movie was updated by the test script'
    };
    
    const response = await fetch(`${BASE_URL}/movies/${movieId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        success('Update movie passed!');
        return true;
      } else {
        error('Update movie returned success: false');
        return false;
      }
    } else {
      error(`Update movie failed with status: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Update movie error: ${err.message}`);
    return false;
  }
}

async function testDeleteMovie(movieId) {
  try {
    info('Testing delete movie endpoint...');
    const response = await fetch(`${BASE_URL}/movies/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        success('Delete movie passed!');
        return true;
      } else {
        error('Delete movie returned success: false');
        return false;
      }
    } else {
      error(`Delete movie failed with status: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Delete movie error: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n📋 Running backend tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health Check
  console.log('Test 1: Health Check');
  if (await testHealthCheck()) {
    passed++;
  } else {
    failed++;
  }
  console.log('');
  
  // Test 2: Get Movies
  console.log('Test 2: Get Movies');
  if (await testGetMovies()) {
    passed++;
  } else {
    failed++;
  }
  console.log('');
  
  // Test 3: Add Movie
  console.log('Test 3: Add Movie');
  const movieId = await testAddMovie();
  if (movieId) {
    passed++;
  } else {
    failed++;
  }
  console.log('');
  
  // Test 4: Update Movie (only if add succeeded)
  if (movieId) {
    console.log('Test 4: Update Movie');
    if (await testUpdateMovie(movieId)) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
    
    // Test 5: Delete Movie (clean up test data)
    console.log('Test 5: Delete Movie (cleanup)');
    if (await testDeleteMovie(movieId)) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }
  
  // Results
  console.log('─'.repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`   ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! Your backend is working perfectly!${colors.reset}`);
    console.log(`\n${colors.blue}Next steps:${colors.reset}`);
    console.log('   1. Build your frontend: npm run build');
    console.log('   2. Upload /dist to Stellar hosting');
    console.log('   3. Start adding real movies!');
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Please check:${colors.reset}`);
    console.log('   1. Is the backend deployed? Run: supabase functions deploy make-server-4d451974');
    console.log('   2. Check function logs: supabase functions logs make-server-4d451974');
    console.log('   3. Verify your Supabase project is active');
  }

  // Test 6: Settings CRUD - only run if we can reach the settings endpoints
  console.log('Test 6: Settings - Create/Get/Delete');
  try {
    // Create test settings
    const testSettings = {
      client: 'ca-pub-TEST-1234',
      downloadSlot: '1111111111',
      searchSlot: '2222222222'
    };

    const createResp = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ settings: testSettings })
    });

    if (!createResp.ok) {
      error('Create settings failed');
    } else {
      const data = await createResp.json();
      if (!data.success) {
        error('Create settings failed: ' + (data.error || 'unknown'));
      } else {
        success('Created settings');

        // Get settings
        const getResp = await fetch(`${BASE_URL}/settings`, {
          headers: { 'Authorization': `Bearer ${ANON_KEY}` }
        });

        if (!getResp.ok) {
          error('Get settings failed');
        } else {
          const getData = await getResp.json();
          if (getData.success && getData.settings) {
            success('Get settings passed');
          } else {
            error('Get settings returned empty or failed');
          }
        }

        // Delete settings
        const delResp = await fetch(`${BASE_URL}/settings/all`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${ANON_KEY}` }
        });
        if (!delResp.ok) {
          error('Delete settings failed');
        } else {
          const delData = await delResp.json();
          if (delData.success) {
            success('Deleted settings (cleanup)');
          } else {
            error('Delete settings returned false');
          }
        }
      }
    }
  } catch (e) {
    error('Settings test error: ' + e.message);
  }
  
  console.log('\n');
}

// Run all tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
