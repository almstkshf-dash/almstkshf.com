const fs = require('fs');
const path = 'c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/convex/crons.ts';
let content = fs.readFileSync(path, 'utf8');

// The file looks like:
/*
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// ...
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";
*/

const lines = content.split('\n');
const newLines = [];
let seenCronJobs = false;
let seenApi = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Remove duplicates
    if (line.includes('import { cronJobs } from "convex/server";')) {
        if (seenCronJobs) continue;
        seenCronJobs = true;
    }
    if (line.includes('import { api } from "./_generated/api";')) {
        if (seenApi) continue;
        seenApi = true;
    }

    // Fix mojibake
    if (line.includes('â•')) {
        line = line.replace(/â•/g, '=');
    }
    if (line.includes('â€”')) {
        line = line.replace(/â€”/g, '-');
    }

    newLines.push(line);
}

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log('Fixed crons.ts');
