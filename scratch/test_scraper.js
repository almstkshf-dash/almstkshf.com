/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

const http = require('http');

const testUrl = 'https://httpbin.org/json'; // standard public JSON test URL

const payload = JSON.stringify({
  url: testUrl,
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/scrape',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length,
  },
};

console.log(`Sending POST request to http://localhost:3002/scrape with URL: ${testUrl}`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log('Response JSON keys:', Object.keys(json));
      if (json.success) {
        console.log('✅ TEST PASSED!');
        console.log('Title extracted:', json.title);
        console.log('Content preview:', json.content ? json.content.substring(0, 100) + '...' : 'none');
      } else {
        console.log('❌ TEST FAILED:', json.error);
      }
    } catch (e) {
      console.log('❌ FAILED to parse response:', e.message);
      console.log('Raw output:', data);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
  console.error('Make sure the scraper-service is running on port 3002 (npm run scraper:dev or node server.js inside scraper-service)');
  process.exit(1);
});

req.write(payload);
req.end();
