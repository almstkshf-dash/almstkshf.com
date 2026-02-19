async function verifyGemini(apiKey) {
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "ping" }] }]
                })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ GEMINI_API_KEY is VALID for model: ${model}`);
                return true;
            } else {
                console.log(`⚠️ GEMINI model ${model} failed:`, data.error?.message || response.statusText);
            }
        } catch (e) {
            console.error(`❌ GEMINI verification failed for ${model}:`, e.message);
        }
    }
    return false;
}

async function verifyClerk(secretKey) {
    const url = `https://api.clerk.com/v1/users?limit=1`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            console.log("✅ CLERK_SECRET_KEY is VALID.");
            return true;
        } else {
            console.error("❌ CLERK_SECRET_KEY is INVALID or restricted:", JSON.stringify(data.errors || data, null, 2));
            return false;
        }
    } catch (e) {
        console.error("❌ CLERK verification failed:", e.message);
        return false;
    }
}

async function verifyResend(apiKey) {
    const url = `https://api.resend.com/emails`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'ALMSTKSHF <onboarding@resend.dev>',
                to: 'delivered@resend.dev',
                subject: 'Verification',
                html: '<p>Verifying API Key</p>'
            })
        });
        const data = await response.json();
        if (response.ok || data.name === "validation_error") {
            // validation_error often means it hit the API but to/from was restricted or similar, 
            // but it proves the KEY is authenticated.
            console.log("✅ RESEND_API_KEY is likely VALID (received response).");
            return true;
        } else {
            console.error("❌ RESEND_API_KEY is INVALID or restricted:", JSON.stringify(data, null, 2));
            return false;
        }
    } catch (e) {
        console.error("❌ RESEND verification failed:", e.message);
        return false;
    }
}

async function run() {
    const geminiKey = "AIzaSyByJa5app8Wlrd68npV0o2Y8D_SndQYcQA";
    const clerkSecret = "sk_live_MB3vomMXSXgJV2ynPA40D9v1A5JusPloH8zbjR9xq5";
    const resendKey = "re_iUQ9ahfx_8VBdJnyXAn23fS9F2BvD1K4";

    console.log("--- Starting Root Verification ---");
    await verifyGemini(geminiKey);
    await verifyClerk(clerkSecret);
    await verifyResend(resendKey);
}

run();
