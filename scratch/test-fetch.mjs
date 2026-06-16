async function test() {
  try {
    console.log("Directly fetching Al Madar RSS feed...");
    const res = await fetch("https://www.almadarmagazine.ae/feed/", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text length:", text.length);
    console.log("First 500 chars:", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
