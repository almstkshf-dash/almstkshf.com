/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Global proxy health state for quarantine
const proxyState = {
  brd: {
    consecutiveFailures: 0,
    quarantinedUntil: null,
  },
  oxy: {
    consecutiveFailures: 0,
    quarantinedUntil: null,
  }
};

const FAILURE_THRESHOLD = 3;
const QUARANTINE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function isProxyOrNetworkError(error, responseStatus) {
  if (responseStatus === 407 || responseStatus === 502 || responseStatus === 504) {
    return true;
  }
  if (!error) return false;
  const msg = (error.message || String(error)).toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('tunneling socket') ||
    msg.includes('proxy') ||
    msg.includes('err_connection_') ||
    msg.includes('err_proxy_') ||
    msg.includes('err_name_not_resolved')
  );
}

function recordProxySuccess(type) {
  if (type === 'brd' || type === 'oxy') {
    if (proxyState[type].consecutiveFailures > 0) {
      console.log(`[Proxy Isolation] Resetting failure counter for ${type.toUpperCase()}.`);
    }
    proxyState[type].consecutiveFailures = 0;
    proxyState[type].quarantinedUntil = null;
  }
}

function recordProxyFailure(type) {
  if (type === 'brd' || type === 'oxy') {
    proxyState[type].consecutiveFailures++;
    console.warn(`[Proxy Isolation] Recorded failure for ${type.toUpperCase()}. Consecutive: ${proxyState[type].consecutiveFailures}`);
    if (proxyState[type].consecutiveFailures >= FAILURE_THRESHOLD) {
      proxyState[type].quarantinedUntil = Date.now() + QUARANTINE_DURATION_MS;
      console.warn(`[Proxy Isolation] ${type.toUpperCase()} proxy quarantined for 5 minutes due to ${proxyState[type].consecutiveFailures} consecutive failures.`);
    }
  }
}

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// The main scrape endpoint
app.post('/scrape', async (req, res) => {
  const { url, country, timeout = 30000, waitAfterLoad = 2000 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log(`[Scraper] Ingesting request for URL: ${url} (Geo-target: ${country || 'none'})`);

  let browser = null;
  let activeProxyType = 'direct';
  try {
    const brdUsername = process.env.BRD_PROXY_USERNAME;
    const brdPassword = process.env.BRD_PROXY_PASSWORD;
    const brdHost = process.env.BRD_PROXY_HOST || 'brd.superproxy.io:33335';

    const oxyUsername = process.env.OXY_PROXY_USERNAME;
    const oxyPassword = process.env.OXY_PROXY_PASSWORD;

    const now = Date.now();
    const hasBrd = brdUsername && brdPassword;
    const hasOxy = oxyUsername && oxyPassword;

    const brdQuarantined = proxyState.brd.quarantinedUntil && proxyState.brd.quarantinedUntil > now;
    const oxyQuarantined = proxyState.oxy.quarantinedUntil && proxyState.oxy.quarantinedUntil > now;

    // Select proxy based on availability and health
    if (hasBrd && !brdQuarantined) {
      activeProxyType = 'brd';
    } else if (hasOxy && !oxyQuarantined) {
      activeProxyType = 'oxy';
    } else {
      if (hasBrd && hasOxy) {
        console.warn(`[Proxy Isolation] Both BRD and Oxylabs proxies are currently QUARANTINED. Falling back to DIRECT routing.`);
      } else if (hasBrd && brdQuarantined) {
        console.warn(`[Proxy Isolation] Bright Data proxy is QUARANTINED. Falling back to DIRECT routing.`);
      } else if (hasOxy && oxyQuarantined) {
        console.warn(`[Proxy Isolation] Oxylabs proxy is QUARANTINED. Falling back to DIRECT routing.`);
      }
      activeProxyType = 'direct';
    }

    let proxyConfig = undefined;

    if (activeProxyType === 'brd') {
      let finalUsername = brdUsername;
      if (country) {
        finalUsername = `${brdUsername}-country-${country.toLowerCase()}`;
      }
      const sessionRandom = Math.floor(Math.random() * 1000000);
      finalUsername = `${finalUsername}-session-${sessionRandom}`;

      proxyConfig = {
        server: `http://${brdHost}`,
        username: finalUsername,
        password: brdPassword
      };
      console.log(`[Scraper] Routing request via Bright Data Residential Proxy [User: ${finalUsername}]`);
    } else if (activeProxyType === 'oxy') {
      let finalUsername = oxyUsername;
      if (country) {
        finalUsername = `${oxyUsername}-cc-${country.toLowerCase()}`;
      }
      const sessionRandom = Math.floor(Math.random() * 1000000);
      finalUsername = `${finalUsername}-session-${sessionRandom}`;

      proxyConfig = {
        server: 'http://pr.oxylabs.io:7777',
        username: finalUsername,
        password: oxyPassword
      };
      console.log(`[Scraper] Routing request via Oxylabs Residential Proxy [User: ${finalUsername}]`);
    } else {
      console.log(`[Scraper] Routing request DIRECTLY (No proxy active or proxies quarantined)`);
    }

    // Launch Chromium browser instance
    browser = await chromium.launch({
      headless: true,
      proxy: proxyConfig,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1920,1080',
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US,en;q=0.9,ar;q=0.8',
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    const page = await context.newPage();

    // Stealth measure: override webdriver property
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Navigate to URL
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: parseInt(timeout),
    });

    if (!response) {
      throw new Error('Failed to load page: no response received');
    }

    const responseStatus = response.status();
    console.log(`[Scraper] Page loaded with HTTP status: ${responseStatus}`);

    // Return error for any bad HTTP status codes (e.g. 403, 404, 407, 500, etc.)
    if (responseStatus >= 400) {
      if (isProxyOrNetworkError(null, responseStatus)) {
        recordProxyFailure(activeProxyType);
      } else {
        recordProxySuccess(activeProxyType);
      }
      return res.status(responseStatus >= 500 ? 500 : responseStatus).json({
        error: `Target server/proxy returned HTTP ${responseStatus}`,
        status: responseStatus
      });
    }

    // Reset failure counter on success
    recordProxySuccess(activeProxyType);

    // Wait a brief moment to allow dynamic javascript loads to finalize
    if (waitAfterLoad > 0) {
      await page.waitForTimeout(waitAfterLoad);
    }

    // Extract page metadata and contents
    const result = await page.evaluate(() => {
      // 1. Title extraction
      const title = document.title ||
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        document.querySelector('h1')?.innerText || 'No Title';

      // 2. Image extraction
      const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
        document.querySelector('link[rel="image_src"]')?.getAttribute('href') || undefined;

      // 3. Site Name extraction
      const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
        window.location.hostname;

      // 4. Content description (snippet)
      const description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

      // 5. Clean full text content extraction (stripping boilerplate elements)
      const selectorsToStrip = [
        'script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav',
        '.header', '.footer', '.navigation', '.sidebar', '.menu', '.ads',
        '#header', '#footer', '#sidebar', '#menu', '.ad-box', '.advertisement'
      ];

      selectorsToStrip.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });

      // Find main article node heuristically
      const articleNode = document.querySelector('article, main, .article-content, .post-content, #article-body, .entry-content');

      let textContent = '';
      if (articleNode) {
        textContent = articleNode.innerText || articleNode.textContent || '';
      } else {
        textContent = document.body.innerText || document.body.textContent || '';
      }

      // Clean up whitespace
      textContent = textContent.replace(/\s+/g, ' ').trim();

      // Basic Arabic language check
      const isArabic = /[\u0600-\u06FF]/.test(title + textContent);

      return {
        title: title.trim(),
        imageUrl,
        sourceName: siteName.trim(),
        description: description.trim(),
        content: textContent.substring(0, 15000), // Cap at 15k characters for token efficiency
        language: isArabic ? 'AR' : 'EN'
      };
    });

    const rawContent = await response.text();

    res.json({
      success: true,
      url: page.url(),
      status: responseStatus,
      rawContent,
      ...result
    });

  } catch (error) {
    console.error(`[Scraper] Scrape failed for ${url}:`, error.message);
    if (isProxyOrNetworkError(error, null)) {
      recordProxyFailure(activeProxyType);
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape website'
    });
  } finally {
    if (browser) {
      await browser.close();
      console.log(`[Scraper] Browser closed`);
    }
  }
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 ALMSTKSHF Premium Playwright Scraper Service running on port ${PORT}`);
  console.log(`================================================================`);
});
