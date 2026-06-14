/**
 * DestinAI - College Prediction UI Test Suite (Playwright)
 * Tests the complete frontend flow with different input combinations
 * Verifies that UI predictions change based on different criteria
 * 
 * Run with: npx playwright test test_college_prediction_ui.spec.js
 * Or: node test_college_prediction_ui.js (standalone)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
const HEADLESS = process.env.HEADLESS !== 'false'; // Default headless mode
const SLOW_MO = parseInt(process.env.SLOW_MO || '300'); // Slow motion for visibility

// Test scenarios: Different combinations of input selections
const TEST_SCENARIOS = [
  {
    id: 1,
    name: 'Science Stream + High Budget + Major Hub',
    profile: {
      preferredStream: 'science',
      budgetRange: 'high',
      locationPreference: 'major_hub'
    }
  },
  {
    id: 2,
    name: 'Science Stream + Low Budget + Rural',
    profile: {
      preferredStream: 'science',
      budgetRange: 'low',
      locationPreference: 'rural'
    }
  },
  {
    id: 3,
    name: 'Commerce Stream + Medium Budget + Any India',
    profile: {
      preferredStream: 'commerce',
      budgetRange: 'medium',
      locationPreference: 'any'
    }
  },
  {
    id: 4,
    name: 'Commerce Stream + High Budget + Major Hub',
    profile: {
      preferredStream: 'commerce',
      budgetRange: 'high',
      locationPreference: 'major_hub'
    }
  },
  {
    id: 5,
    name: 'Arts Stream + Low Budget + Mid-City',
    profile: {
      preferredStream: 'arts',
      budgetRange: 'low',
      locationPreference: 'mid_city'
    }
  },
  {
    id: 6,
    name: 'Arts Stream + Medium Budget + Rural',
    profile: {
      preferredStream: 'arts',
      budgetRange: 'medium',
      locationPreference: 'rural'
    }
  },
  {
    id: 7,
    name: 'Vocational + High Budget + Any India',
    profile: {
      preferredStream: 'vocational',
      budgetRange: 'high',
      locationPreference: 'any'
    }
  },
];

// Helper: Extract college names from the page
async function getCollegeResults(page) {
  const collegeElements = await page.locator('[id^="college-card-"]').all();
  const colleges = [];

  for (let elem of collegeElements.slice(0, 5)) {
    const name = await elem.locator('h3').textContent().catch(() => 'Unknown');
    const score = await elem.locator('[class*="match-score"]').textContent().catch(() => '0%');
    colleges.push({
      name: name?.trim() || 'Unknown',
      score: score?.trim() || 'N/A'
    });
  }

  return colleges;
}

// Main test function
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('  DestinAI - College Prediction UI Test Suite (Playwright)');
  console.log('='.repeat(80) + '\n');

  let browser;
  const results = [];
  let previousColleges = null;
  let differentResultsCount = 0;

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: HEADLESS,
      slowMo: SLOW_MO
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to Roadmap to set profile
    console.log('Opening DestinAI Application...\n');
    await page.goto(`${BASE_URL}/roadmap`, { waitUntil: 'domcontentloaded' });

    // Run each test scenario
    for (const scenario of TEST_SCENARIOS) {
      try {
        console.log(`\n[Test ${scenario.id}] ${scenario.name}`);
        console.log('─'.repeat(70));
        console.log(`  Stream: ${scenario.profile.preferredStream}`);
        console.log(`  Budget: ${scenario.profile.budgetRange}`);
        console.log(`  Location: ${scenario.profile.locationPreference}`);

        // Update student profile
        console.log(`  → Setting profile inputs...`);
        
        // Click Edit button if not already editing
        try {
          await page.click('button:has-text("Edit Answers")', { timeout: 2000 });
        } catch {
          // Already editing or button not visible
        }

        // Set stream
        if (scenario.profile.preferredStream) {
          await page.selectOption('[name="preferred_stream"]', scenario.profile.preferredStream);
        }

        // Set budget
        if (scenario.profile.budgetRange) {
          await page.selectOption('[name="budget_range"]', scenario.profile.budgetRange);
        }

        // Set location
        if (scenario.profile.locationPreference) {
          await page.selectOption('[name="location_preference"]', scenario.profile.locationPreference);
        }

        // Save profile
        await page.click('button:has-text("Save Answers")');
        await page.waitForTimeout(1000); // Wait for save

        // Navigate to College Match
        console.log(`  → Navigating to College Match page...`);
        await page.goto(`${BASE_URL}/college-match`, { waitUntil: 'networkidle' });
        
        // Wait for colleges to load
        await page.waitForSelector('[id^="college-card-"]', { timeout: 10000 });

        // Get college results
        const colleges = await getCollegeResults(page);

        if (colleges.length === 0) {
          console.log(`  ⚠️  No colleges found on page`);
        } else {
          console.log(`  ✓ Retrieved ${colleges.length} college results`);
          console.log(`\n  Top Results:`);
          colleges.forEach((c, i) => {
            console.log(`    ${i + 1}. ${c.name} (${c.score})`);
          });

          // Check if results differ from previous scenario
          if (previousColleges !== null) {
            const sameAsLast = JSON.stringify(colleges) === JSON.stringify(previousColleges);
            if (!sameAsLast) {
              console.log(`  ✓ Results DIFFER from previous test`);
              differentResultsCount++;
            } else {
              console.log(`  ⚠️  Results SAME as previous test`);
            }
          }
          previousColleges = colleges;
        }

        results.push({
          ...scenario,
          success: true,
          colleges: colleges
        });

      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
        results.push({
          ...scenario,
          success: false,
          error: error.message,
          colleges: []
        });
      }
    }

    await context.close();

  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print summary
  printUITestSummary(results, differentResultsCount);

  return results;
}

function printUITestSummary(results, differentResultsCount) {
  console.log('\n' + '='.repeat(80));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(80));

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  console.log(`\n✓ Total Tests: ${results.length}`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log(`✓ Unique Results: ${differentResultsCount}/${results.length - 1}`);

  console.log(`\n📋 Detailed Results:`);
  results.forEach((r) => {
    const status = r.success ? '✓' : '✗';
    const topCollege = r.colleges[0]?.name || 'N/A';
    const resultNote = r.success ? `Top: ${topCollege}` : `Error: ${r.error}`;
    console.log(`  ${status} Test ${r.id}: ${r.name} - ${resultNote}`);
  });

  console.log(`\n💡 Recommendations:`);
  if (differentResultsCount < results.length - 2) {
    console.log(`  ⚠️  Many tests returned identical results.`);
    console.log(`  → Verify that college database contains courses for all streams`);
    console.log(`  → Check if budget/location filters are being applied`);
  } else {
    console.log(`  ✓ Predictions showed good variation across different inputs`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
