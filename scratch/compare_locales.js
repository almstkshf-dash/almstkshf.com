import fs from 'fs';

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));

function compare(obj1, obj2, namespace, name1, name2) {
  const keys1 = Object.keys(obj1[namespace] || {});
  const keys2 = Object.keys(obj2[namespace] || {});

  const missingIn2 = keys1.filter(k => !keys2.includes(k));
  const missingIn1 = keys2.filter(k => !keys1.includes(k));

  if (missingIn2.length > 0) {
    console.log(`Missing in ${name2} (${namespace}):`, missingIn2);
  }
  if (missingIn1.length > 0) {
    console.log(`Missing in ${name1} (${namespace}):`, missingIn1);
  }
}

compare(en, ar, 'RssFeeder', 'EN', 'AR');
compare(en, ar, 'RssSources', 'EN', 'AR');
