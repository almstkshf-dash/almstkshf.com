async function run() {
    console.log("Testing on-demand RSS sync API `/api/rss-sync` with IPv4 loopback...");
    try {
        const targetUrl = 'http://127.0.0.1:3001/api/rss-sync';
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: 'https://gulfnews.com/rss',
                publisher: 'Gulf News',
                country: 'UAE',
                lang: 'en',
                limit: 5
            })
        });

        console.log(`Response Status: ${res.status}`);
        const data = await res.json();
        console.log("API Response Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Error running sync test:", e.message);
    }
}

run();
