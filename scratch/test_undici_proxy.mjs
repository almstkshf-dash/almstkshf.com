import { ProxyAgent } from 'undici';

const proxyUrl = 'http://brd.superproxy.io:33335';
const proxyAuth = 'brd-customer-hl_243fbef5-zone-residential_proxy_almstkshf:a9qhdb3zagfd';

async function run() {
    console.log("Testing direct proxy fetch with undici ProxyAgent...");
    try {
        const dispatcher = new ProxyAgent({
            uri: proxyUrl,
            auth: btoa(proxyAuth)
        });

        // Test with Gulf News RSS
        const targetUrl = 'https://gulfnews.com/rss';
        console.log(`Fetching ${targetUrl} via proxy...`);

        const res = await fetch(targetUrl, {
            dispatcher,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
            }
        });

        console.log(`Response Status: ${res.status}`);
        if (res.ok) {
            const text = await res.text();
            console.log("✅ Success! Parsed length:", text.length);
            console.log("Snippet:", text.substring(0, 300));
        } else {
            console.log("❌ Failed to fetch. Status:", res.status);
        }
    } catch (e) {
        console.error("❌ Error during proxy fetch:", e.message);
    }
}

run();
