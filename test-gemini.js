/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Load API Key from .env.local manually
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            for (const line of content.split('\n')) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    if (key === 'GEMINI_API_KEY') {
                        return value;
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error reading .env.local:", e);
    }
    return process.env.GEMINI_API_KEY;
}

const apiKey = loadEnv();

if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY not found in .env.local or environment.");
    process.exit(1);
}

console.log(`✅ Loaded API Key: ${apiKey.substring(0, 5)}...`);

// 2. Test Function
function testModel(model) {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const data = JSON.stringify({
            contents: [{ parts: [{ text: "Hello, are you working?" }] }]
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`\n🟢 SUCCESS: [${model}] is working!`);
                    resolve(true);
                } else {
                    console.log(`\n🔴 FAILED:  [${model}] - Status: ${res.statusCode}`);
                    // console.log(`Response: ${body.substring(0, 200)}...`); // Uncomment for details
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`\n🔴 ERROR:   [${model}] - Network error: ${e.message}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

// 3. Run Tests
async function run() {
    console.log("\nTesting Gemini Models...");

    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    let workingModel = null;

    for (const model of models) {
        const success = await testModel(model);
        if (success && !workingModel) {
            workingModel = model;
        }
    }

    if (workingModel) {
        console.log(`\n✨ Recommendation: Use '${workingModel}' in your code.`);
    } else {
        console.log("\n⚠️ No models worked. Check your API Key or Quota.");
    }
}

run();
