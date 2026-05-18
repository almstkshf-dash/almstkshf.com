const fs = require('fs');
const path = require('path');

// 1. Validate JSON files
let enJson, arJson;
try {
  enJson = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'));
  console.log('✅ en.json: VALID JSON');
} catch (e) {
  console.log('❌ en.json: INVALID -', e.message);
  process.exit(1);
}
try {
  arJson = JSON.parse(fs.readFileSync('./messages/ar.json', 'utf8'));
  console.log('✅ ar.json: VALID JSON');
} catch (e) {
  console.log('❌ ar.json: INVALID -', e.message);
  process.exit(1);
}

// 2. Top-level section parity
const enTop = Object.keys(enJson);
const arTop = Object.keys(arJson);
const missingInAr = enTop.filter(k => !arTop.includes(k));
const missingInEn = arTop.filter(k => !enTop.includes(k));
console.log('\n=== TOP-LEVEL SECTIONS ===');
console.log('EN:', enTop.length, '| AR:', arTop.length);
if (missingInAr.length) console.log('❌ Missing in AR:', missingInAr);
else console.log('✅ AR has all EN sections');
if (missingInEn.length) console.log('⚠️  Extra in AR (not in EN):', missingInEn);

// 3. RssSources parity
const enRss = Object.keys(enJson.RssSources || {});
const arRss = Object.keys(arJson.RssSources || {});
const missingRssInAr = enRss.filter(k => !arRss.includes(k));
const missingRssInEn = arRss.filter(k => !enRss.includes(k));
console.log('\n=== RssSources KEY PARITY ===');
console.log('EN:', enRss.length, '| AR:', arRss.length);
if (missingRssInAr.length) {
  console.log('❌ Missing in AR RssSources:');
  missingRssInAr.forEach(k => console.log('  -', k));
} else {
  console.log('✅ AR RssSources matches EN');
}
if (missingRssInEn.length) {
  console.log('⚠️  Extra in AR RssSources (not in EN):');
  missingRssInEn.forEach(k => console.log('  -', k));
}

// 4. Cross-check rss-sources.ts publisher keys and category names against en.json
const rssKeys = new Set(enRss);
const srcContent = fs.readFileSync('./src/config/rss-sources.ts', 'utf8');

// Extract category names
const nameMatches = [...srcContent.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
// Extract publisher keys (lines like:  'PublisherName': [)
const pubMatches = [...srcContent.matchAll(/^\s{2}'([^']+)':\s*\[/gm)].map(m => m[1]);

console.log('\n=== rss-sources.ts vs en.json AUDIT ===');
const missingPubs = pubMatches.filter(p => !rssKeys.has(p));
const missingCats = nameMatches.filter(n => !rssKeys.has(n));

if (missingPubs.length) {
  console.log('❌ Publisher keys NOT in en.json RssSources:');
  missingPubs.forEach(k => console.log('  -', k));
} else {
  console.log('✅ All publisher keys are in en.json');
}

if (missingCats.length) {
  console.log('❌ Category names NOT in en.json RssSources:');
  missingCats.forEach(k => console.log('  -', k));
} else {
  console.log('✅ All category names are in en.json');
}

console.log('\n=== SUMMARY ===');
const allPass = missingInAr.length === 0 && missingRssInAr.length === 0 && missingPubs.length === 0 && missingCats.length === 0;
console.log(allPass ? '✅ ALL CHECKS PASSED - Safe to deploy' : '❌ ISSUES FOUND - Fix before deploy');
