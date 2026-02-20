/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync, spawn } = require('child_process');

const envs = {
    "CHATBOT_IDENTITY_SECRET": "h2ax7gd1icx41i3kh26bgabo0oj5l0ta",
    "CLERK_FRONTEND_API_URL": "https://integral-bulldog-65.clerk.accounts.dev",
    "CLERK_SECRET_KEY": "sk_test_sSgKFk48HYj5oOWdZdirVnCAwblKLFwX9hUroUwSBc",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_test_aW50ZWdyYWwtYnVsbGRvZy02NS5jbGVyay5hY2NvdW50cy5kZXYk",
    "CONVEX_DEPLOYMENT": "prod:flexible-anaconda-162",
    "NEXT_PUBLIC_CONVEX_URL": "https://flexible-anaconda-162.convex.cloud",
    "NEXT_PUBLIC_CONVEX_SITE_URL": "https://flexible-anaconda-162.convex.site",
    "CONVEX_DEPLOY_KEY": "prod:flexible-anaconda-162|eyJ2MiI6ImE5OWIxZTE2NjM2YTQ1OTk4YjNhYjcxNDY0OGYxMGQ1In0="
};

const scope = "almstkshfuae-lgtms-projects";
const token = "vcp_5xNBWnCmLWmCskI3X6goonTPtEqWEpfVj47gJYtAXYGNAAAgZF4YYygm";

for (const [key, value] of Object.entries(envs)) {
    console.log(`Resetting ${key}...`);
    try {
        // Use npx to ensure it works cross-platform/shell
        execSync(`npx vercel env rm ${key} production -y --scope ${scope} --token ${token}`, { stdio: 'ignore' });
    } catch (e) {
        // ignore
    }

    console.log(`Adding ${key}...`);
    const child = spawn('npx', ['vercel', 'env', 'add', key, 'production', '--scope', scope, '--token', token], {
        stdio: ['pipe', 'inherit', 'inherit'],
        shell: true
    });
    child.stdin.write(value);
    child.stdin.end();

    // Pulse check wait 
    execSync(`node -e "setTimeout(() => {}, 4000)"`);
}
