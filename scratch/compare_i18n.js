const fs = require('fs');

function getKeys(obj, prefix = '') {
    let keys = new Set();
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            getKeys(obj[key], prefix + key + '.').forEach(k => keys.add(k));
        } else {
            keys.add(prefix + key);
        }
    }
    return keys;
}

try {
    const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));
    const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

    const arKeys = getKeys(ar);
    const enKeys = getKeys(en);

    const onlyAr = [...arKeys].filter(k => !enKeys.has(k));
    const onlyEn = [...enKeys].filter(k => !arKeys.has(k));

    console.log('Keys only in AR:', onlyAr);
    console.log('Keys only in EN:', onlyEn);
} catch (e) {
    console.error('Error parsing JSON:', e.message);
}
