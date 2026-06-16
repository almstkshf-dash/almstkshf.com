import { ConvexHttpClient } from 'convex/browser';
import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve('.env.local');
const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envLocalContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const convexUrl = envVars.NEXT_PUBLIC_CONVEX_URL || "https://trusting-wombat-390.convex.cloud";
const convex = new ConvexHttpClient(convexUrl);

async function test() {
  try {
    const getRssArticles = "monitoring:getRssArticles";

    console.log("Querying with source: 'Hashtag Dubai'...");
    const resultHashtag = await convex.query(getRssArticles, { limit: 100, source: 'Hashtag Dubai' });
    console.log(`Hashtag Dubai results count: ${resultHashtag.items.length}`);
    resultHashtag.items.slice(0, 3).forEach(item => {
      console.log(`- [${item.source}]: ${item.title} (${item.publishedDate})`);
    });

    console.log("\nQuerying with source: 'Dubai PR Network'...");
    const resultPr = await convex.query(getRssArticles, { limit: 100, source: 'Dubai PR Network' });
    console.log(`Dubai PR Network results count: ${resultPr.items.length}`);
    resultPr.items.slice(0, 3).forEach(item => {
      console.log(`- [${item.source}]: ${item.title} (${item.publishedDate})`);
    });
  } catch (err) {
    console.error("Error querying:", err);
  }
}

test();
