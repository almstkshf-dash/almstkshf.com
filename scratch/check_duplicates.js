const fs = require('fs');

function findDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const seen = new Set();
    const duplicates = [];

    // Simple regex for top-level keys
    const keyRegex = /^\s*"([^"]+)"\s*:/;

    lines.forEach((line, index) => {
        const match = line.match(keyRegex);
        if (match) {
            const key = match[1];
            // Only tracking top-level keys for now as the warning usually refers to these in large i18n files
            // and top-level objects are what was duplicated here.
            // Check if indentation is 2 spaces (typical for top-level in this project)
            if (line.startsWith('  "')) {
                if (seen.has(key)) {
                    duplicates.push({ key, line: index + 1 });
                }
                seen.add(key);
            }
        }
    });

    return duplicates;
}

const arDuplicates = findDuplicates('messages/ar.json');
const enDuplicates = findDuplicates('messages/en.json');

console.log('AR Duplicates:', JSON.stringify(arDuplicates, null, 2));
console.log('EN Duplicates:', JSON.stringify(enDuplicates, null, 2));
