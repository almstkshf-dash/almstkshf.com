/*
 * Test script to verify the newly integrated Bright Data Residential Proxy with Playwright.
 */
const { chromium } = require('playwright');
require('dotenv').config({ path: 'c:/projects/almstkshf.com/scraper-service/.env' });

async function testBrightData() {
  const brdUsername = process.env.BRD_PROXY_USERNAME;
  const brdPassword = process.env.BRD_PROXY_PASSWORD;
  const brdHost = process.env.BRD_PROXY_HOST || 'brd.superproxy.io:33335';

  if (!brdUsername || !brdPassword) {
    console.error('❌ Error: Bright Data credentials missing in .env!');
    process.exit(1);
  }

  // Force IP rotation per request by using a unique session ID
  const sessionRandom = Math.floor(Math.random() * 1000000);
  const finalUsername = `${brdUsername}-session-${sessionRandom}`;

  console.log(`[Test] Launching Playwright with Bright Data Proxy [User: ${finalUsername}]`);

  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: `http://${brdHost}`,
      username: finalUsername,
      password: brdPassword
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    console.log('[Test] Navigating to https://geo.brdtest.com/mygeo.json to verify egress IP...');

    await page.goto('https://geo.brdtest.com/mygeo.json', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const bodyText = await page.locator('body').innerText();
    const geoData = JSON.parse(bodyText);

    console.log('✅ TEST PASSED!');
    console.log('--- Bright Data Proxy Egress Details ---');
    console.log(`Country: ${geoData.country}`);
    console.log(`City: ${geoData.city}`);
    console.log(`IP Address: ${geoData.ip}`);
    console.log(`Timezone: ${geoData.timezone}`);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  } finally {
    await browser.close();
    console.log('[Test] Browser closed.');
  }
}

testBrightData();
