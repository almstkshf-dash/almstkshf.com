const fs = require('fs');
const path = require('path');

const urls = [
  "https://thegulfdaily.com/",
  "https://tunisdispatch.com/",
  "https://tunisianpost.com/",
  "https://tunisreview.com",
  "https://uae-photoz.com/en/",
  "https://uaebeacon.com/",
  "https://uaeherald.com/",
  "https://uaetribune.com/",
  "https://uaeviews.com/ntt-data-business-solutions-expands-presence-in-uae-with-stronger",
  "https://news.uppersetup.com/",
  "https://urbanabudhabi.com/",
  "https://whatsupgulf.com/",
  "https://article.wn.com/",
  "https://www.zawya.com/en/"
];

function generateId(url) {
  try {
    const u = new URL(url);
    const pathBits = u.pathname.replace(/\/$/, '').split('/').filter(Boolean).join('-');
    const baseId = u.hostname.replace('www.', '').replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return pathBits ? `${baseId}-${pathBits}` : baseId;
  } catch(e) { return 'unknown'; }
}

function generateName(id) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function generateDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch(e) { return 'unknown'; }
}

const seenIds = new Set();
const newSources = urls.map(url => {
  let id = generateId(url);
  if (seenIds.has(id)) {
    id = id + '-' + Math.floor(Math.random() * 1000);
  }
  seenIds.add(id);
  
  const name = generateName(id);
  const domain = generateDomain(url);
  
  return `  {
    "id": "${id}",
    "name": "${name}",
    "domain": "${domain}",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "${id}-latest",
        "category": "Latest News",
        "url": "${url}"
      }
    ]
  }`;
});

const file = path.join(process.cwd(), 'src/config/media-sources.ts');
const content = fs.readFileSync(file, 'utf8');

// A safer regex that handles any amount of whitespace
const regex = /];\s*export const SOURCES_BY_COUNTRY/;
if (regex.test(content)) {
  const newContent = content.replace(regex, (match) => {
    return ',\n' + newSources.join(',\n') + '\n' + match;
  });
  fs.writeFileSync(file, newContent);
  console.log('Successfully appended 14 new sources.');
} else {
  console.log('REGEX FAILED TO MATCH');
}
