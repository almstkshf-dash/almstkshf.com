import fs from 'fs';

const enContent = fs.readFileSync('messages/en.json', 'utf8').split('\n');
const arContent = fs.readFileSync('messages/ar.json', 'utf8').split('\n');

console.log('--- EN.JSON AI Locations ---');
enContent.forEach((line, index) => {
  if (line.trim().startsWith('"AI": {')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

console.log('--- AR.JSON AI Locations ---');
arContent.forEach((line, index) => {
  if (line.trim().startsWith('"AI": {')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
