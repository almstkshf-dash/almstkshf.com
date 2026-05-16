import fs from 'fs';

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));

function findKeyPath(obj, targetKey, path = '') {
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    if (key === targetKey) {
      console.log(`Found ${targetKey} at: ${currentPath}`);
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      findKeyPath(obj[key], targetKey, currentPath);
    }
  }
}

console.log('--- EN.JSON ---');
findKeyPath(en, 'AI');
console.log('--- AR.JSON ---');
findKeyPath(ar, 'AI');
