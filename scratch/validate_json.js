import fs from 'fs';

const filePath = 'messages/ar.json';
const content = fs.readFileSync(filePath, 'utf8');

try {
  const data = JSON.parse(content);
  console.log('JSON is valid.');
  
  // Check for duplicate keys using a custom parser that tracks keys
  // because JSON.parse() just overwrites them.
} catch (err) {
  console.error('JSON is invalid:', err.message);
  // Find the line number if possible
  const lines = content.split('\n');
  // Rough estimate of where the error is
}
