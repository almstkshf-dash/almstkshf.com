import fs from 'fs';

const filePath = 'messages/ar.json';
const content = fs.readFileSync(filePath, 'utf8');

function checkTopLevelDuplicates(jsonStr) {
  const lines = jsonStr.split('\n');
  const namespaces = [];
  lines.forEach(line => {
    const match = line.match(/^\s{2}"([^"]+)": \{/);
    if (match) {
      namespaces.push(match[1]);
    }
  });
  
  const counts = {};
  const duplicates = [];
  namespaces.forEach(n => {
    counts[n] = (counts[n] || 0) + 1;
    if (counts[n] > 1) {
      duplicates.push(n);
    }
  });
  return [...new Set(duplicates)];
}

console.log('Duplicate Namespaces:', checkTopLevelDuplicates(content));
