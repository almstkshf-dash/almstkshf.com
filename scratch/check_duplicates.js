import fs from 'fs';

const filePath = 'messages/ar.json';
const content = fs.readFileSync(filePath, 'utf8');

function checkDuplicates(jsonStr) {
  const keys = new Set();
  const duplicates = [];
  
  // Very rough regex-based check for top-level or second-level keys
  // This is just a quick check
  const matches = jsonStr.match(/"([^"]+)":/g);
  if (matches) {
    const counts = {};
    matches.forEach(m => {
      counts[m] = (counts[m] || 0) + 1;
      if (counts[m] > 1) {
        duplicates.push(m);
      }
    });
  }
  return [...new Set(duplicates)];
}

console.log('Duplicates found:', checkDuplicates(content));
