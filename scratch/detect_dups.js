import fs from 'fs';

const filePath = 'messages/ar.json';
const content = fs.readFileSync(filePath, 'utf8');

function findDuplicateKeys(jsonStr) {
  const stack = [{}];
  const duplicates = [];
  const lines = jsonStr.split('\n');

  lines.forEach((line, index) => {
    const keyMatch = line.match(/^\s*"([^"]+)":/);
    if (keyMatch) {
      const key = keyMatch[1];
      const currentLevel = stack[stack.length - 1];
      if (currentLevel[key]) {
        duplicates.push({ key, line: index + 1 });
      }
      currentLevel[key] = true;
    }
    if (line.includes('{')) {
      stack.push({});
    }
    if (line.includes('}')) {
      stack.pop();
    }
  });
  return duplicates;
}

const dups = findDuplicateKeys(content);
console.log('Duplicates:', dups);
