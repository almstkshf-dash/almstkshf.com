import fs from 'fs';

const filePath = 'messages/ar.json';
// Try reading as UTF-8
try {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('Read successful. First 100 chars:', content.slice(0, 100));
  
  // Write back as UTF-8
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Write back successful.');
} catch (err) {
  console.error('Error:', err);
}
