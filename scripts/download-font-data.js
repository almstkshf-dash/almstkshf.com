const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data';
const TARGET_DIR = path.join(__dirname, '../public/fonts');

const FILES_TO_DOWNLOAD = [
    // Common Latin/Greek/Cyrillic
    'codepoint-index/plane0/0-ff.json',
    'codepoint-index/plane0/100-1ff.json',
    'codepoint-index/plane0/200-2ff.json',
    'codepoint-index/plane0/300-3ff.json',
    'codepoint-index/plane0/400-4ff.json',
    // Arrows/Symbols/Misc
    'codepoint-index/plane0/2000-20ff.json',
    'codepoint-index/plane0/2100-21ff.json',
    'codepoint-index/plane0/2200-22ff.json',
    'codepoint-index/plane0/2300-23ff.json',
    'codepoint-index/plane0/2400-24ff.json',
    'codepoint-index/plane0/2500-25ff.json',
    'codepoint-index/plane0/2600-26ff.json',
    'codepoint-index/plane0/2700-27ff.json',
    // Emoji/Supplementary (Plane 1)
    'codepoint-index/plane1/1f300-1f3ff.json',
    'codepoint-index/plane1/1f400-1f4ff.json',
    'codepoint-index/plane1/1f500-1f5ff.json',
    'codepoint-index/plane1/1f600-1f6ff.json',
    'codepoint-index/plane1/1f900-1f9ff.json',
    // Meta
    'font-meta/latin.json',
    'font-meta/emoji.json',
    'font-meta/noto-emoji.json',
    'font-meta/noto-sans.json'
];

async function download(url, dest) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function main() {
    console.log(`Starting download from ${BASE_URL}...`);
    for (const file of FILES_TO_DOWNLOAD) {
        const url = `${BASE_URL}/${file}`;
        const dest = path.join(TARGET_DIR, file);
        process.stdout.write(`Downloading ${file}... `);
        try {
            await download(url, dest);
            console.log('Done');
        } catch (err) {
            console.log('Error:', err.message);
        }
    }
    console.log('All downloads finished.');
}

main();
