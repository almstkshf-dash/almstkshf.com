const fs = require('fs');
const path = require('path');

const header = `/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fullPath.includes('node_modules')) continue;

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Mozilla Public License') || content.includes('MPL-2.0')) {
                continue; // Skip if already there
            }

            // Remove existing block comments at the start (if any previous headers)
            content = content.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
            // Also clean any leading whitespace
            content = content.trimStart();

            fs.writeFileSync(fullPath, header + '\n\n' + content, 'utf8');
            console.log('Updated:', fullPath);
        }
    }
}

try {
    if (fs.existsSync('src')) processDir('src');
} catch (e) { console.error(e); }
try {
    if (fs.existsSync('convex')) processDir('convex');
} catch (e) { console.error(e); }
