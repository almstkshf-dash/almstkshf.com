const fs = require('fs');

const files = [
    'src/components/media-pulse/NewsGenerator.tsx',
    'src/components/media-pulse/TerroristListTab.tsx',
    'src/lib/engines/textEngine.ts',
    'src/utils/exportUtils.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find strings that contain Ø
    const regex = /(["'`])([^"'`]*Ø[^"'`]*)\1/g;
    
    let modified = false;
    content = content.replace(regex, (match, quote, inner) => {
        try {
            // Attempt to decode latin1 back to utf8
            const decoded = Buffer.from(inner, 'latin1').toString('utf8');
            // If it still contains weird characters, or is completely empty, don't replace
            if (decoded && decoded !== inner && !decoded.includes('ï¿½')) {
                modified = true;
                return quote + decoded + quote;
            }
        } catch (e) {}
        return match;
    });

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed mojibake in ${file}`);
    }
});
