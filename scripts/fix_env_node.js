/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process');

const envKey = 'CONVEX_DEPLOY_KEY';
const envValue = 'prod:flexible-anaconda-162|eyJ2MiI6ImE5OWIxZTE2NjM2YTQ1OTk4YjNhYjcxNDY0OGYxMGQ1In0=';
const scope = 'almstkshfuae-lgtms-projects';
const token = 'vcp_5xNBWnCmLWmCskI3X6goonTPtEqWEpfVj47gJYtAXYGNAAAgZF4YYygm';

console.log(`Fixing ${envKey} via Node.js...`);

// First remove the old key (ignore errors)
const rm = spawn('vercel', ['env', 'rm', envKey, 'production', '-y', '--scope', scope, '--token', token], { stdio: 'inherit', shell: true });

rm.on('close', () => {
    console.log('Old key removed (if existed). Adding new key...');

    // Add new key
    const add = spawn('vercel', ['env', 'add', envKey, 'production', '--scope', scope, '--token', token], { stdio: ['pipe', 'inherit', 'inherit'], shell: true });

    add.stdin.write(envValue); // Write value WITHOUT newline
    add.stdin.end();

    add.on('close', (code) => {
        console.log(`Process exited with code ${code}`);
    });
});
