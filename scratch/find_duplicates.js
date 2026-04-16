const fs = require('fs');

function findDuplicates(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const keys = {};
  const duplicates = [];
  
  let currentObject = null;
  const stack = [];

  lines.forEach((line, index) => {
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (match) {
      const key = match[1];
      const context = stack.join('.');
      const fullKey = context ? `${context}.${key}` : key;
      
      if (keys[fullKey]) {
        duplicates.push({ key: fullKey, line: index + 1 });
      } else {
        keys[fullKey] = true;
      }
    }
    
    // Very basic object tracking
    if (line.includes('{')) {
      const matchKey = line.match(/^\s*"([^"]+)"\s*:\s*\{/);
      if (matchKey) stack.push(matchKey[1]);
      else stack.push('unknown');
    }
    if (line.includes('}')) {
      stack.pop();
    }
  });
  
  return duplicates;
}

console.log('EN Duplicates:', findDuplicates('messages/en.json'));
console.log('AR Duplicates:', findDuplicates('messages/ar.json'));
