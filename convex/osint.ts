"use node";
import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";
import { requireAdmin } from "./utils/auth";
import { resolveApiKey } from "./utils/keys";

// ═══════════════════════════════════════════════════════════════════
// OSINT ENGINE — Active Open-Source Intelligence Lookups
// All external API calls use public, free-tier APIs where available.
// ═══════════════════════════════════════════════════════════════════

// ─── Email Intelligence ─────────────────────────────────────────────
export const lookupEmail = action({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const email = args.email.trim().toLowerCase();
            if (!email || !email.includes("@")) {
                return { success: false, error: "Invalid email address style." };
            }

            const results: Record<string, any> = { email };

            // 1. HaveIBeenPwned — free public API (no key required for single email check)
            try {
                const hibpRes = await fetch(
                    `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
                    {
                        headers: {
                            "User-Agent": "ALMSTKSHF-OSINT/1.0",
                            "hibp-api-key": await resolveApiKey(ctx, "HIBP_API_KEY", "hibp") || "",
                        },
                    }
                );
                if (hibpRes.status === 404) {
                    results.breaches = [];
                    results.breachCount = 0;
                } else if (hibpRes.ok) {
                    const breaches = await hibpRes.json();
                    results.breaches = breaches.map((b: any) => ({
                        name: b.Name,
                        domain: b.Domain,
                        breachDate: b.BreachDate,
                        dataClasses: b.DataClasses,
                        isVerified: b.IsVerified,
                    }));
                    results.breachCount = breaches.length;
                } else {
                    results.breachNote = `HIBP API: ${hibpRes.status}`;
                }
            } catch (e: any) {
                results.breachNote = `HIBP unavailable: ${e?.message}`;
            }

            // 2. Gravatar profile (email hash lookup)
            try {
                const md5 = await emailToMd5(email);
                const gravatarRes = await fetch(
                    `https://www.gravatar.com/${md5}.json`
                );
                if (gravatarRes.ok) {
                    const g = await gravatarRes.json();
                    const entry = g?.entry?.[0];
                    if (entry) {
                        results.gravatar = {
                            displayName: entry.displayName,
                            profileUrl: entry.profileUrl,
                            thumbnailUrl: entry.thumbnailUrl,
                            aboutMe: entry.aboutMe,
                            accounts: entry.accounts?.map((a: any) => ({
                                domain: a.domain,
                                username: a.username,
                            })),
                        };
                    }
                }
            } catch (_) { /* Gravatar not found = normal */ }

            // 3. Email format & domain MX record check
            try {
                const domain = email.split("@")[1];
                const dnsRes = await fetch(
                    `https://dns.google/resolve?name=${domain}&type=MX`
                );
                if (dnsRes.ok) {
                    const dnsData = await dnsRes.json();
                    results.mxRecords = dnsData.Answer?.map((r: any) => r.data) || [];
                    results.domainHasMx = (results.mxRecords.length > 0);
                }
            } catch (_) { /* DNS check failed */ }

            // Save result to DB
            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "email",
                query: email,
                result: results,
            });

            // Trigger notification
            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Email lookup for ${email} finished. ${results.breachCount || 0} breaches found.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupEmail failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    },
});

// ─── Domain Intelligence ─────────────────────────────────────────────
export const lookupDomain = action({
    args: {
        domain: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const domain = args.domain.trim().toLowerCase()
                .replace(/^https?:\/\//, "")
                .replace(/\/.*$/, "");

            if (!domain || !domain.includes(".")) {
                return { success: false, error: "Invalid domain format." };
            }

            const results: Record<string, any> = { domain };

            // 1. WHOIS via whoisjson.com (free public API)
            try {
                const whoisKey = await resolveApiKey(ctx, "WHOISJSON_API_KEY", "whoisjson");
                const whoisRes = await fetch(
                    `https://whoisjson.com/api/v1/whois?domain=${domain}`,
                    { headers: { "Authorization": `TOKEN=${whoisKey || ""}` } }
                );
                if (whoisRes.ok) {
                    const w = await whoisRes.json();
                    results.whois = {
                        registrar: w.registrar,
                        createdDate: w.created_date,
                        updatedDate: w.updated_date,
                        expiresDate: w.expiry_date,
                        registrant: w.registrant_name || w.registrant_organization,
                        nameServers: w.name_servers,
                        status: w.status,
                    };
                }
            } catch (e: any) {
                results.whoisNote = `WHOIS unavailable: ${e?.message}`;
            }

            // 2. DNS Records (A, MX, TXT, NS via Google DNS-over-HTTPS)
            try {
                const dnsTypes = ["A", "MX", "TXT", "NS", "AAAA"];
                const dnsResults: Record<string, any[]> = {};
                await Promise.all(
                    dnsTypes.map(async (type) => {
                        const res = await fetch(
                            `https://dns.google/resolve?name=${domain}&type=${type}`
                        );
                        if (res.ok) {
                            const data = await res.json();
                            dnsResults[type] = data.Answer?.map((r: any) => r.data) || [];
                        }
                    })
                );
                results.dns = dnsResults;
            } catch (e: any) {
                results.dnsNote = `DNS lookup failed: ${e?.message}`;
            }

            // 3. SSL Certificate info via crt.sh
            try {
                const crtRes = await fetch(
                    `https://crt.sh/?q=${domain}&output=json`
                );
                if (crtRes.ok) {
                    const certs = await crtRes.json();
                    // Get unique issuers and most recent certs
                    const recent = certs.slice(0, 5).map((c: any) => ({
                        issuer: c.issuer_name,
                        notBefore: c.not_before,
                        notAfter: c.not_after,
                        commonName: c.common_name,
                    }));
                    results.sslCerts = recent;
                    results.certCount = certs.length;
                }
            } catch (_) { /* crt.sh unavailable */ }

            // 4. IP Resolution
            try {
                const ipRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
                if (ipRes.ok) {
                    const ipData = await ipRes.json();
                    const ip = ipData.Answer?.[0]?.data;
                    if (ip) {
                        results.resolvedIp = ip;
                        // Geo/ASN lookup for that IP
                        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
                        if (geoRes.ok) {
                            const geo = await geoRes.json();
                            results.ipInfo = {
                                ip,
                                city: geo.city,
                                region: geo.region,
                                country: geo.country_name,
                                org: geo.org,
                                asn: geo.asn,
                                timezone: geo.timezone,
                            };
                        }
                    }
                }
            } catch (_) { /* IP lookup failed */ }

            // 5. Wayback Machine — first/last snapshot
            try {
                const waybackRes = await fetch(
                    `https://archive.org/wayback/available?url=${domain}`
                );
                if (waybackRes.ok) {
                    const wb = await waybackRes.json();
                    results.wayback = wb.archived_snapshots?.closest
                        ? {
                            available: wb.archived_snapshots.closest.available,
                            url: wb.archived_snapshots.closest.url,
                            timestamp: wb.archived_snapshots.closest.timestamp,
                        }
                        : { available: false };
                }
            } catch (_) { /* Wayback unavailable */ }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "domain",
                query: domain,
                result: results,
            });

            // Trigger notification
            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Domain lookup for ${domain} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupDomain failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    },
});

// ─── IP Intelligence ──────────────────────────────────────────────────
export const lookupIp = action({
    args: {
        ip: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const ip = args.ip.trim();
            if (!ip) return { success: false, error: "IP address is required." };

            const results: Record<string, any> = { ip };

            // 1. ipapi.co — free tier (1000 requests/day, no key needed)
            try {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    results.geo = {
                        city: geo.city,
                        region: geo.region,
                        country: geo.country_name,
                        countryCode: geo.country_code,
                        latitude: geo.latitude,
                        longitude: geo.longitude,
                        org: geo.org,
                        asn: geo.asn,
                        timezone: geo.timezone,
                        isp: geo.org,
                    };
                }
            } catch (e: any) {
                results.geoNote = `Geo lookup failed: ${e?.message}`;
            }

            // 2. Abuse IPDB — check if IP is known malicious (free tier)
            try {
                const abuseKey = await resolveApiKey(ctx, "ABUSEIPDB_API_KEY", "abuseipdb");
                if (abuseKey) {
                    const abuseRes = await fetch(
                        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
                        { headers: { Key: abuseKey, Accept: "application/json" } }
                    );
                    if (abuseRes.ok) {
                        const abuse = await abuseRes.json();
                        results.abuse = {
                            abuseScore: abuse.data?.abuseConfidenceScore,
                            totalReports: abuse.data?.totalReports,
                            lastReportedAt: abuse.data?.lastReportedAt,
                            isWhitelisted: abuse.data?.isWhitelisted,
                            isp: abuse.data?.isp,
                            usageType: abuse.data?.usageType,
                            hostnames: abuse.data?.hostnames,
                        };
                    }
                } else {
                    results.abuseNote = "AbuseIPDB key not configured (optional)";
                }
            } catch (_) { /* AbuseIPDB unavailable */ }

            // 3. Reverse DNS
            try {
                // Convert IP to arpa format for PTR record
                const parts = ip.split(".").reverse().join(".");
                const ptrRes = await fetch(
                    `https://dns.google/resolve?name=${parts}.in-addr.arpa&type=PTR`
                );
                if (ptrRes.ok) {
                    const ptrData = await ptrRes.json();
                    results.reverseDns = ptrData.Answer?.map((r: any) => r.data) || ["No PTR record"];
                }
            } catch (_) { /* Reverse DNS failed */ }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "ip",
                query: ip,
                result: results,
            });

            // Trigger notification
            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `IP lookup for ${ip} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupIp failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    },
});

// ─── Username Intelligence ─────────────────────────────────────────────
export const lookupUsername = action({
    args: {
        username: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const username = args.username.trim().replace(/^@/, "");

            if (!username) {
                return { success: false, error: "Username cannot be empty." };
            }

            // Check username existence on major platforms
            // Uses HEAD requests where possible — no API key needed
            const platforms = [
                { name: "GitHub", url: `https://github.com/${username}`, api: `https://api.github.com/users/${username}` },
                { name: "Twitter/X", url: `https://twitter.com/${username}`, api: null },
                { name: "Instagram", url: `https://www.instagram.com/${username}/`, api: null },
                { name: "TikTok", url: `https://www.tiktok.com/@${username}`, api: null },
                { name: "LinkedIn", url: `https://www.linkedin.com/in/${username}`, api: null },
                { name: "Reddit", url: `https://www.reddit.com/user/${username}`, api: `https://www.reddit.com/user/${username}/about.json` },
                { name: "YouTube", url: `https://www.youtube.com/@${username}`, api: null },
                { name: "Telegram", url: `https://t.me/${username}`, api: null },
                { name: "Pinterest", url: `https://www.pinterest.com/${username}/`, api: null },
                { name: "Medium", url: `https://medium.com/@${username}`, api: null },
            ];

            const checkResults = await Promise.allSettled(
                platforms.map(async (p) => {
                    try {
                        // Use public API if available (richer data)
                        if (p.api) {
                            const res = await fetch(p.api, {
                                headers: { "User-Agent": "ALMSTKSHF-OSINT/1.0" },
                                signal: AbortSignal.timeout(5000),
                            });
                            if (res.ok) {
                                const data = await res.json();
                                const extra: Record<string, any> = {};
                                if (p.name === "GitHub") {
                                    extra.name = data.name;
                                    extra.bio = data.bio;
                                    extra.company = data.company;
                                    extra.location = data.location;
                                    extra.publicRepos = data.public_repos;
                                    extra.followers = data.followers;
                                    extra.createdAt = data.created_at;
                                }
                                if (p.name === "Reddit") {
                                    extra.name = data.data?.name;
                                    extra.karma = data.data?.total_karma;
                                    extra.createdAt = data.data?.created_utc
                                        ? new Date(data.data.created_utc * 1000).toISOString()
                                        : null;
                                    extra.verified = data.data?.verified;
                                }
                                return { platform: p.name, found: true, url: p.url, ...extra };
                            }
                            return { platform: p.name, found: false, url: p.url };
                        }

                        // Fall back to HEAD request for platforms without API
                        const res = await fetch(p.url, {
                            method: "HEAD",
                            headers: { "User-Agent": "Mozilla/5.0" },
                            redirect: "manual",
                            signal: AbortSignal.timeout(5000),
                        });
                        // 200 or redirect = exists; 404 = not found
                        const found = res.status === 200 || res.status === 301 || res.status === 302;
                        return { platform: p.name, found, url: p.url };
                    } catch {
                        return { platform: p.name, found: null, url: p.url, error: "timeout" };
                    }
                })
            );

            const platformResults = checkResults.map((r) =>
                r.status === "fulfilled" ? r.value : { platform: "unknown", found: null }
            );

            const results = {
                username,
                platforms: platformResults,
                foundOn: platformResults.filter((p) => p.found === true).map((p) => p.platform),
                notFoundOn: platformResults.filter((p) => p.found === false).map((p) => p.platform),
                unknownOn: platformResults.filter((p) => p.found === null).map((p) => p.platform),
            };

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "username",
                query: username,
                result: results,
            });

            // Trigger notification
            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Username lookup for ${username} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupUsername failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    },
});

// ─── Phone Number Intelligence ────────────────────────────────────────
export const lookupPhone = action({
    args: {
        phone: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const phone = args.phone.trim().replace(/\s+/g, "");

            if (!phone || phone.length < 7) {
                return { success: false, error: "Invalid phone number format." };
            }

            const results: Record<string, any> = { phone };

            // numverify — free tier (100 requests/month)
            try {
                const numKey = await resolveApiKey(ctx, "NUMVERIFY_API_KEY", "numverify");
                if (numKey) {
                    const numRes = await fetch(
                        `http://apilayer.net/api/validate?access_key=${numKey}&number=${encodeURIComponent(phone)}&format=1`
                    );
                    if (numRes.ok) {
                        const num = await numRes.json();
                        results.validation = {
                            valid: num.valid,
                            number: num.number,
                            localFormat: num.local_format,
                            internationalFormat: num.international_format,
                            countryCode: num.country_code,
                            countryName: num.country_name,
                            location: num.location,
                            carrier: num.carrier,
                            lineType: num.line_type,
                        };
                    }
                } else {
                    // Basic format check without API
                    results.validation = {
                        valid: phone.startsWith("+"),
                        note: "Configure NUMVERIFY_API_KEY for full validation",
                    };
                }
            } catch (e: any) {
                results.validationNote = `Phone lookup failed: ${e?.message}`;
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "phone",
                query: phone,
                result: results,
            });

            // Trigger notification
            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Phone lookup for ${phone} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupPhone failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    },
});

// ─── Persistence: moved to convex/osintDb.ts (mutations/queries can't live in Node.js runtime)
// Import path for frontend: api.osintDb.*

// ─── News Intelligence (Replaces GDELT) ──────────────────────────────────
export const lookupNews = action({
    args: {
        query: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const query = args.query.trim();
            if (!query) return { success: false, error: "Query is required." };

            const results: Record<string, any> = { query };

            // Fetch via Google News RSS (Free and highly reliable)
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
            try {
                const res = await fetch(rssUrl);
                if (res.ok) {
                    const text = await res.text();

                    // Simple Regex-based RSS parser to avoid adding heavy dependencies
                    const items: any[] = [];
                    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                    let match;
                    while ((match = itemRegex.exec(text)) !== null) {
                        if (items.length >= 15) break; // Limit to Top 15
                        const itemBlock = match[1];

                        const titleMatch = itemBlock.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
                        const linkMatch = itemBlock.match(/<link>(.*?)<\/link>/);
                        const pubDateMatch = itemBlock.match(/<pubDate>(.*?)<\/pubDate>/);
                        const sourceMatch = itemBlock.match(/<source url=".*?">([^<]+)<\/source>/);

                        const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : "Unknown Title";
                        const link = linkMatch ? linkMatch[1] : "";
                        const date = pubDateMatch ? pubDateMatch[1] : "";
                        const source = sourceMatch ? sourceMatch[1] : "Unknown Source";

                        items.push({ title, link, date, source });
                    }

                    results.totalArticles = items.length;
                    results.articles = items;
                    results.provider = "Google News Feed";
                } else {
                    return { success: false, error: `News fetch failed: ${res.status}` };
                }
            } catch (e: any) {
                console.warn("News fetch failed:", e);
                return { success: false, error: "Failed to connect to the news provider." };
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "news",
                query: query,
                result: results,
            });

            // Trigger notification
            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `News Analysis for "${query}" is ready.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupNews failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    },
});

// ─── Corporate Intelligence ───────────────────────────────────────────
export const lookupCorporate = action({
    args: { companyName: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const query = args.companyName.trim();
            if (!query) return { success: false, error: "Company name is required." };
            const results: Record<string, any> = { query };

            try {
                const res = await fetch(`https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(query)}&per_page=5`);
                if (res.ok) {
                    const data = await res.json();
                    const companies = data?.results?.companies || [];
                    results.companies = companies.map((c: any) => ({
                        name: c.company?.name,
                        number: c.company?.company_number,
                        jurisdiction: c.company?.jurisdiction_code,
                        status: c.company?.current_status,
                        incorporationDate: c.company?.incorporation_date,
                        url: c.company?.opencorporates_url,
                    }));
                } else {
                    results.error = `OpenCorporates API error: ${res.status}`;
                }
            } catch (e: any) {
                results.error = `OpenCorporates unavailable: ${e.message}`;
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "corporate" as any,
                query: query,
                result: results,
            });

            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Corporate lookup for ${query} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupCorporate failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
});

// ─── Location Intelligence ────────────────────────────────────────────
export const lookupLocation = action({
    args: { locationName: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const query = args.locationName.trim();
            if (!query) return { success: false, error: "Location is required." };
            const results: Record<string, any> = { query, locations: [] };

            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
                const res = await fetch(url, { headers: { "User-Agent": "ALMSTKSHF-OSINT/1.0" } });
                if (res.ok) {
                    const data = await res.json();
                    results.locations = data.map((item: any) => ({
                        displayName: item.display_name,
                        type: item.type,
                        lat: item.lat,
                        lon: item.lon,
                        city: item.address?.city || item.address?.town || "",
                        country: item.address?.country || "",
                        osmUrl: `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`
                    }));
                } else {
                    results.error = `Nominatim API error: ${res.status}`;
                }
            } catch (e: any) {
                results.error = `Nominatim unavailable: ${e.message}`;
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "location" as any,
                query: query,
                result: results,
            });

            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Location lookup for ${query} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupLocation failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
});

// ─── Wikipedia Intelligence ───────────────────────────────────────────
export const lookupWikipedia = action({
    args: { query: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const query = args.query.trim();
            if (!query) return { success: false, error: "Query is required." };
            const results: Record<string, any> = { query };
            const API_URL = "https://en.wikipedia.org/w/api.php";

            try {
                const res = await fetch(`${API_URL}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`);
                if (res.ok) {
                    const data = await res.json();
                    const searchResults = data?.query?.search || [];
                    if (searchResults.length > 0) {
                        const topTitle = searchResults[0].title;
                        const pageRes = await fetch(`${API_URL}?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(topTitle)}&format=json`);
                        if (pageRes.ok) {
                            const pageData = await pageRes.json();
                            const pages = pageData?.query?.pages || {};
                            const pageKeys = Object.keys(pages);
                            if (pageKeys.length > 0) {
                                const page = pages[pageKeys[0]];
                                const extract = page.extract || "";
                                results.wiki = {
                                    title: page.title,
                                    summary: extract.length > 500 ? extract.substring(0, 500) + "..." : extract,
                                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
                                };
                            }
                        }
                    }
                }
            } catch (e: any) {
                results.error = `Wikipedia unavailable: ${e.message}`;
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "wikipedia" as any,
                query: query,
                result: results,
            });

            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Wikipedia lookup for ${query} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupWikipedia failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
});

// ─── GLEIF Intelligence ──────────────────────────────────────────────
export const lookupGleif = action({
    args: { companyName: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const query = args.companyName.trim();
            if (!query) return { success: false, error: "Company name is required." };
            const results: Record<string, any> = { query };

            try {
                const res = await fetch(`https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(query)}&page[size]=5`);
                if (res.ok) {
                    const data = await res.json();
                    const records = data?.data || [];
                    results.records = records.map((r: any) => ({
                        lei: r.attributes?.lei,
                        legalName: r.attributes?.entity?.legalName?.name,
                        status: r.attributes?.registration?.registrationStatus,
                        jurisdiction: r.attributes?.entity?.jurisdiction,
                        legalAddress: r.attributes?.entity?.legalAddress,
                        entityType: r.attributes?.entity?.entityCategory,
                    }));
                } else {
                    results.error = `GLEIF API error: ${res.status}`;
                }
            } catch (e: any) {
                results.error = `GLEIF unavailable: ${e.message}`;
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "gleif" as any,
                query: query,
                result: results,
            });

            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `GLEIF lookup for ${query} finished.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupGleif failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
});

// ─── Watchlist Intelligence (UN/OFAC) ─────────────────────────────────
export const lookupWatchlist = action({
    args: { query: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; data?: Record<string, any>; recordId?: string; error?: string }> => {
        try {
            await requireAdmin(ctx.auth);
            const query = args.query.trim();
            if (!query) return { success: false, error: "Search query is required." };
            const results: Record<string, any> = { query };

            const osKey = await resolveApiKey(ctx, "OPENSANCTIONS_API_KEY", "opensanctions");

            try {
                // OpenSanctions "Search" endpoint resolves against UN, OFAC, and more.
                const url = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(query)}&limit=10`;
                const headers: Record<string, string> = { "Accept": "application/json" };
                if (osKey) headers["Authorization"] = `ApiKey ${osKey}`;

                const res = await fetch(url, { headers });

                if (res.ok) {
                    const data = await res.json();
                    const results_list = data?.results || [];
                    results.matches = results_list.map((m: any) => ({
                        id: m.id,
                        caption: m.caption,
                        schema: m.schema,
                        countries: m.properties?.countries,
                        datasets: m.datasets,
                        firstSeen: m.first_seen,
                        lastSeen: m.last_seen,
                        topics: m.properties?.topics,
                        matchScore: m.score,
                    }));
                    results.totalMatches = results.matches.length;
                    results.isClean = results.totalMatches === 0;
                } else {
                    results.error = `Watchlist API error: ${res.status}`;
                }
            } catch (e: any) {
                results.error = `Watchlist unavailable: ${e.message}`;
            }

            const recordId = await ctx.runMutation(api.osintDb.saveOsintResult, {
                type: "watchlist" as any,
                query: query,
                result: results,
            });

            const ident = await ctx.auth.getUserIdentity();
            if (ident) {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: ident.subject,
                    title: "osint_ready",
                    message: `Watchlist screening for ${query} is complete.`,
                    type: "system"
                });
            }

            return { success: true, data: results, recordId };
        } catch (e: any) {
            console.error("lookupWatchlist failed:", e);
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
});

// ─── Internal helper: email → MD5 (for Gravatar) ─────────────────────
async function emailToMd5(email: string): Promise<string> {
    // This file already uses "use node" so this is safe.
    const { createHash } = await import("crypto");
    return createHash("md5").update(email).digest("hex");
}
