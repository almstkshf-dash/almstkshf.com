const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'messages', 'en.json');
const arPath = path.join(__dirname, 'messages', 'ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function compare(enObj, arObj, prefix = '') {
  let missing = [];
  for (const key in enObj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!(key in arObj)) {
      missing.push(fullKey);
    } else if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
      missing = missing.concat(compare(enObj[key], arObj[key], fullKey));
    }
  }
  return missing;
}

const missingKeys = compare(en, ar);
console.log(JSON.stringify(missingKeys, null, 2));
