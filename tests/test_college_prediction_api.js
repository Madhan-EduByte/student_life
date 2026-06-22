/**
 * DestinAI - College Prediction API Test Suite
 * Tests college matching predictions with 15 different input combinations
 * Verifies that different criteria produce different prediction results
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
const TEST_CASES = [
  // Science Stream Tests
  {
    id: 1,
    name: 'Science + High Budget + Major Hub',
    params: { preferred_stream: 'science', budget_range: '5-10l', location: 'major_hub' }
  },
  {
    id: 2,
    name: 'Science + Low Budget + Rural',
    params: { preferred_stream: 'science', budget_range: 'below 1l', location: 'rural' }
  },
  {
    id: 3,
    name: 'Science + Medium Budget + Mid-City',
    params: { preferred_stream: 'science', budget_range: '1-5l', location: 'mid_city' }
  },
  {
    id: 4,
    name: 'Science + High Budget + Rural',
    params: { preferred_stream: 'science', budget_range: '5-10l', location: 'rural' }
  },
  {
    id: 5,
    name: 'Science + Low Budget + Major Hub',
    params: { preferred_stream: 'science', budget_range: 'below 1l', location: 'major_hub' }
  },

  // Commerce Stream Tests
  {
    id: 6,
    name: 'Commerce + High Budget + Major Hub',
    params: { preferred_stream: 'commerce', budget_range: '5-10l', location: 'major_hub' }
  },
  {
    id: 7,
    name: 'Commerce + Low Budget + Any India',
    params: { preferred_stream: 'commerce', budget_range: 'below 1l', location: 'any' }
  },
  {
    id: 8,
    name: 'Commerce + Medium Budget + Mid-City',
    params: { preferred_stream: 'commerce', budget_range: '1-5l', location: 'mid_city' }
  },

  // Arts Stream Tests
  {
    id: 9,
    name: 'Arts + Medium Budget + Major Hub',
    params: { preferred_stream: 'arts', budget_range: '1-5l', location: 'major_hub' }
  },
  {
    id: 10,
    name: 'Arts + Low Budget + Rural',
    params: { preferred_stream: 'arts', budget_range: 'below 1l', location: 'rural' }
  },

  // Vocational Stream Tests
  {
    id: 11,
    name: 'Vocational + Medium Budget + Mid-City',
    params: { preferred_stream: 'vocational', budget_range: '1-5l', location: 'mid_city' }
  },
  {
    id: 12,
    name: 'Vocational + High Budget + Major Hub',
    params: { preferred_stream: 'vocational', budget_range: '5-10l', location: 'major_hub' }
  },

  // Edge Cases
  {
    id: 13,
    name: 'No Preferences (Default)',
    params: { preferred_stream: '', budget_range: '', location: '' }
  },
  {
    id: 14,
    name: 'Only Stream: Science',
    params: { preferred_stream: 'science', budget_range: '', location: '' }
  },
  {
    id: 15,
    name: 'Only Budget: High',
    params: { preferred_stream: '', budget_range: '5-10l', location: '' }
  },
];

// Utility function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            error: 'Failed to parse JSON'
          });
        }
      });
    }).on('error', reject);
  });
}

// Extract college names and match scores from response
function extractCollegeData(matches) {
  if (!Array.isArray(matches)) return [];
  return matches.slice(0, 5).map((m, i) => ({
    rank: i + 1,
    name: m.college?.name || 'N/A',
    matchScore: m.match_score || 0,
    reasons: (m.match_reasons || []).slice(0, 2)
  }));
}

// Check if two result sets are different
function areResultsDifferent(colleges1, colleges2) {
  if (colleges1.length !== colleges2.length) return true;
  
  for (let i = 0; i < colleges1.length; i++) {
    if (colleges1[i].name !== colleges2[i].name || 
        colleges1[i].matchScore !== colleges2[i].matchScore) {
      return true;
    }
  }
  return false;
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('  DestinAI - College Prediction API Test Suite');
  console.log('='.repeat(80) + '\n');

  const results = [];
  let previousColleges = null;
  let differentResultsCount = 0;

  for (const testCase of TEST_CASES) {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (testCase.params.preferred_stream) queryParams.append('preferred_stream', testCase.params.preferred_stream);
      if (testCase.params.budget_range) queryParams.append('budget_range', testCase.params.budget_range);
      if (testCase.params.location) queryParams.append('location', testCase.params.location);

      const url = `${BASE_URL}/colleges/match?${queryParams.toString()}`;
      
      console.log(`\n[Test ${testCase.id}] ${testCase.name}`);
      console.log(`  Stream: ${testCase.params.preferred_stream || '(not set)'}`);
      console.log(`  Budget: ${testCase.params.budget_range || '(not set)'}`);
      console.log(`  Location: ${testCase.params.location || '(not set)'}`);
      console.log(`  URL: ${url.replace(BASE_URL, '...')}`);

      const response = await makeRequest(url);
      
      if (response.status !== 200) {
        console.log(`  ❌ ERROR: HTTP ${response.status}`);
        results.push({
          ...testCase,
          success: false,
          error: `HTTP ${response.status}`,
          colleges: []
        });
        continue;
      }

      const matches = response.data.matches || [];
      const colleges = extractCollegeData(matches);
      
      console.log(`  ✓ Retrieved ${matches.length} college matches`);
      console.log(`  AI Active: ${response.data.ai_active ? 'Yes' : 'No (Mock)'}`);
      console.log(`  AI Model: ${response.data.ai_model || 'Rule-based'}`);
      console.log(`\n  Top 5 Results:`);

      colleges.forEach(c => {
        console.log(`    ${c.rank}. ${c.name} (Score: ${c.matchScore}%)`);
        c.reasons.forEach(r => console.log(`       - ${r}`));
      });

      // Check if results differ from previous test
      if (previousColleges !== null && areResultsDifferent(previousColleges, colleges)) {
        console.log(`  ✓ Results DIFFER from previous test (as expected)`);
        differentResultsCount++;
      } else if (previousColleges !== null) {
        console.log(`  ⚠ Results SAME as previous test (possible issue)`);
      }

      previousColleges = colleges;

      results.push({
        ...testCase,
        success: true,
        colleges: colleges,
        totalMatches: matches.length,
        aiActive: response.data.ai_active,
        aiModel: response.data.ai_model
      });

    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      results.push({
        ...testCase,
        success: false,
        error: error.message,
        colleges: []
      });
    }
  }

  // Print Summary Report
  printSummaryReport(results, differentResultsCount);

  return results;
}

function printSummaryReport(results, differentResultsCount) {
  console.log('\n' + '='.repeat(80));
  console.log('  SUMMARY REPORT');
  console.log('='.repeat(80));

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  console.log(`\n✓ Total Tests: ${results.length}`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log(`✓ Results Showed Differences: ${differentResultsCount}/${results.length - 1}`);

  // Check consistency
  const aiActiveTests = results.filter(r => r.success && r.aiActive);
  const mockTests = results.filter(r => r.success && !r.aiActive);

  if (aiActiveTests.length > 0) {
    console.log(`\n📊 AI Model Usage:`);
    console.log(`  Real AI: ${aiActiveTests.length} tests`);
    console.log(`  Mock: ${mockTests.length} tests`);
  } else {
    console.log(`\n📊 All tests used Mock predictions (no LLM configured)`);
  }

  // Identify test cases with same results
  console.log(`\n📋 Detailed Results by Test Case:`);
  results.forEach((r, idx) => {
    const status = r.success ? '✓' : '✗';
    const topCollege = r.colleges[0]?.name || 'N/A';
    const resultNote = r.success ? `Top: ${topCollege}` : `Error: ${r.error}`;
    console.log(`  ${status} Test ${r.id}: ${r.name} - ${resultNote}`);
  });

  // Recommendations
  console.log(`\n💡 Recommendations:`);
  if (differentResultsCount < results.length - 2) {
    console.log(`  ⚠️  Many tests returned identical results.`);
    console.log(`  → Consider verifying that database has sufficient course data per stream`);
    console.log(`  → Check if filter logic is correctly applied in match_colleges()`);
  } else {
    console.log(`  ✓ Predictions showed good variation across test cases`);
  }

  if (mockTests.length > 0 && aiActiveTests.length === 0) {
    console.log(`  → To improve accuracy, configure an LLM provider (Gemini, OpenAI, etc.)`);
    console.log(`  → Set LLL_PROVIDER environment variable with format: provider:api_key`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Run tests
runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
