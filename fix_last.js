const fs = require('fs');

const path1 = 'c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/src/lib/engines/textEngine.ts';
let c1 = fs.readFileSync(path1, 'utf8');
const lines1 = c1.split('\n');
for (let i = 0; i < lines1.length; i++) {
    if (lines1[i].includes('Ø')) {
        if (lines1[i].includes('مش')) {
           lines1[i] = '  /\\bمش عارف\\b/,';
        } else if (lines1[i].includes('عارف')) {
           lines1[i] = '  /\\bمش عارف\\b/,';
        } else if (lines1[i].includes('Ù…Ø´ Ø¹Ø§Ø±Ù ')) {
            lines1[i] = '  /\\bمش عارف\\b/,';
        } else if (lines1[i].includes('Ø§Ù„Ù„ÙŠ Ù Ø§Øª Ù…Ø§Øª')) {
             lines1[i] = '  /\\bاللي فات مات\\b/,';
        } else {
             // force replace lines 401 and 403 (0 indexed -> 401, 403)
             if (i === 401) lines1[i] = '  /\\bمش عارف\\b/,';
             if (i === 403) lines1[i] = '  /\\bاللي فات مات\\b/,';
        }
    }
}
fs.writeFileSync(path1, lines1.join('\n'), 'utf8');

const path2 = 'c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/src/components/hero/MediaWave.tsx';
let c2 = fs.readFileSync(path2, 'utf8');
const lines2 = c2.split('\n');
for (let i = 0; i < lines2.length; i++) {
    if (lines2[i].includes('Ø')) {
        lines2[i] = '            {/* طبقات عمق مختلفة */}';
    }
}
fs.writeFileSync(path2, lines2.join('\n'), 'utf8');
console.log('Fixed using array splitting.');
