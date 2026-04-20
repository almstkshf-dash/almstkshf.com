
import { parseFeed } from '../src/lib/rss-engine';

async function test() {
  try {
    console.log('Testing aawsat main feed...');
    const items = await parseFeed('https://aawsat.com/feed');
    console.log(`Success! Found ${items.length} items.`);
  } catch (err: any) {
    console.error('Main feed failed:', err.message);
  }

  try {
    console.log('\nTesting aawsat vehicles feed...');
    const items = await parseFeed('https://aawsat.com/feed/vehicles');
    console.log(`Success! Found ${items.length} items.`);
  } catch (err: any) {
    console.error('Vehicles feed failed:', err.message);
  }
}

test();
