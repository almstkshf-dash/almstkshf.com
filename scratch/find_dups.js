const fs = require('fs');

function findDuplicateKeys(jsonString) {
    const keys = [];
    const duplicates = [];
    
    // Simple regex to find top-level keys
    const regex = /^  "([^"]+)":/gm;
    let match;
    while ((match = regex.exec(jsonString)) !== null) {
        const key = match[1];
        if (keys.includes(key)) {
            duplicates.push(key);
        } else {
            keys.push(key);
        }
    }
    return duplicates;
}

const content = fs.readFileSync('c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/messages/ar.json', 'utf8');
const dups = findDuplicateKeys(content);
console.log('Duplicate top-level keys:', dups);
