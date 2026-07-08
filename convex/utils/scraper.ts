/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { SCRAPER_TIMEOUT, PLAYWRIGHT_SCRAPER_TIMEOUT } from "./constants";
import { decodeHtmlBuffer } from "./encoding";
import { logger } from "./logger";

function getScraperUrl(): string {
    const base = process.env.SCRAPER_SERVICE_URL || "http://127.0.0.1:3002";
    return base.endsWith("/scrape") ? base : `${base.replace(/\/+$/, "")}/scrape`;
}

export async function extractWithWorldNews(url: string, apiKey: string, analyze: boolean = false): Promise<any | null> {
    try {
        const extractUrl = `https://api.worldnewsapi.com/extract-news?url=${encodeURIComponent(url)}&analyze=${analyze}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

        try {
            const res = await fetch(extractUrl, {
                headers: { "x-api-key": apiKey },
                signal: controller.signal,
            });
            if (!res.ok) return null;
            return await res.json();
        } finally {
            clearTimeout(timeout);
        }
    } catch (e: any) {
        logger.error(`WorldNews Extract fail for ${url}: ${e.message || e}`);
        return null;
    }
}

export async function parseHtml(html: string, url: string, analyze: boolean) {
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    // Extract title
    let title = $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text() ||
        $("h1").first().text();

    title = title ? title.trim() : "";

    // Extract description/text
    let text = $('meta[property="og:description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") || "";

    // Grab paragraph tags targeting main content elements first to exclude menus/footers
    const paragraphs: string[] = [];
    let mainContentEl: cheerio.Cheerio | null = null;
    const mainSelectors = [
        "article",
        "main",
        '[role="main"]',
        ".article-body",
        ".article-content",
        ".post-content",
        ".entry-content",
        ".story-body",
        "#article-body",
        "#main-content",
        "#content"
    ];

    for (const selector of mainSelectors) {
        const el = $(selector);
        if (el.length > 0) {
            if (!mainContentEl || el.text().length > mainContentEl.text().length) {
                mainContentEl = el;
            }
        }
    }

    if (mainContentEl) {
        mainContentEl.find("p").each((_, el) => {
            const pText = $(el).text().trim();
            // Filter out short fragments, social share calls, or copyright snippets
            if (pText.length > 30) {
                paragraphs.push(pText);
            }
        });
    } else {
        // General fallback but exclude header, footer, sidebars, navs, comments, cookies
        $("p")
            .not("header p, footer p, nav p, aside p, [role='complementary'] p, .sidebar p, #sidebar p, .menu p, .nav p, .footer p, .header p, .comment p, .comments p, .cookie p")
            .each((_, el) => {
                const pText = $(el).text().trim();
                if (pText.length > 30) {
                    paragraphs.push(pText);
                }
            });
    }

    if (paragraphs.length > 0) {
        text = paragraphs.join("\n\n");
    } else {
        text = text ? text.trim() : "";
    }

    // Extract image
    const image = $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        $('link[rel="image_src"]').attr("href") ||
        $("img").first().attr("src");

    // Extract publish date
    let publish_date = $('meta[property="article:published_time"]').attr("content") ||
        $('meta[property="og:article:published_time"]').attr("content") ||
        $('meta[name="publication_date"]').attr("content") ||
        $('meta[name="publish_date"]').attr("content") ||
        $('meta[name="publish-date"]').attr("content") ||
        $('meta[name="pubdate"]').attr("content") ||
        $('meta[property="og:pubdate"]').attr("content") ||
        $('meta[name="date"]').attr("content") ||
        $('meta[property="og:date"]').attr("content") ||
        $("time").attr("datetime") ||
        $("time[datetime]").attr("datetime");

    // Check for JSON-LD date
    if (!publish_date) {
        try {
            $('script[type="application/ld+json"]').each((_, el) => {
                try {
                    const json = JSON.parse($(el).html() || "");
                    const searchSchema = (obj: any): string | null => {
                        if (!obj) return null;
                        if (Array.isArray(obj)) {
                            for (const item of obj) {
                                const d = searchSchema(item);
                                if (d) return d;
                            }
                        } else if (typeof obj === "object") {
                            if (obj.datePublished) return obj.datePublished;
                            if (obj.dateModified) return obj.dateModified;
                            if (obj.dateCreated) return obj.dateCreated;
                            if (obj.uploadDate) return obj.uploadDate;
                            if (obj["@graph"] && Array.isArray(obj["@graph"])) {
                                return searchSchema(obj["@graph"]);
                            }
                        }
                        return null;
                    };
                    const foundDate = searchSchema(json);
                    if (foundDate) {
                        publish_date = foundDate;
                        return false; // Break Cheerio loop
                    }
                } catch {}
            });
        } catch {}
    }

    if (publish_date) {
        const parsed = Date.parse(publish_date);
        if (isNaN(parsed) || parsed < Date.parse("2000-01-01") || parsed > Date.now() + 86400000 * 2) {
            publish_date = new Date().toISOString();
        } else {
            publish_date = new Date(parsed).toISOString();
        }
    } else {
        publish_date = new Date().toISOString();
    }

    // Lightweight sentiment analysis if requested
    let sentiment = 0.0;
    if (analyze) {
        const textToAnalyze = ((title || "") + " " + (text || "")).toLowerCase();

        // Simple keyword dictionary
        const positiveWords = [
            "نجاح", "تميز", "رائع", "شراكة", "إنجاز", "سعادة", "مبادرة", "خير", "تقدم", "تطوير", "نمو", "أمل", "شكر", "تقدير",
            "success", "excel", "great", "partner", "achieve", "happy", "initiative", "good", "progress", "develop", "growth", "hope", "thanks"
        ];
        const negativeWords = [
            "فشل", "خسارة", "تراجع", "عجز", "أزمة", "مشكلة", "خطر", "سيء", "وفاة", "حادث", "حزن", "غضب", "سرقة", "جريمة",
            "fail", "loss", "decline", "deficit", "crisis", "problem", "danger", "bad", "death", "accident", "sad", "angry", "theft", "crime"
        ];

        let posCount = 0;
        let negCount = 0;

        positiveWords.forEach(word => {
            const regex = new RegExp(word, "g");
            const matches = textToAnalyze.match(regex);
            if (matches) posCount += matches.length;
        });

        negativeWords.forEach(word => {
            const regex = new RegExp(word, "g");
            const matches = textToAnalyze.match(regex);
            if (matches) negCount += matches.length;
        });

        const total = posCount + negCount;
        if (total > 0) {
            sentiment = (posCount - negCount) / total;
        }
    }

    return {
        title,
        text,
        image: image || "",
        publish_date,
        sentiment
    };
}

export async function extractWithDirectScraper(url: string, analyze: boolean = false): Promise<any | null> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
                },
                signal: controller.signal
            });

            if (!response.ok) return null;

            const buffer = await response.arrayBuffer();
            const html = decodeHtmlBuffer(buffer, response.headers.get("content-type"));
            return await parseHtml(html, url, analyze);
        } finally {
            clearTimeout(timeout);
        }
    } catch (e: any) {
        logger.error(`Direct Scraper Extract fail for ${url}: ${e.message || e}`);
        return null;
    }
}

export async function extractWithPlaywrightScraper(url: string, analyze: boolean = false): Promise<any | null> {
    try {
        const scraperUrl = getScraperUrl();
        logger.info(`Invoking Playwright Scraper Service for: ${url} at ${scraperUrl}`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PLAYWRIGHT_SCRAPER_TIMEOUT);

        try {
            const res = await fetch(scraperUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, timeout: 20000 }),
                signal: controller.signal,
            });
            
            if (!res.ok) {
                logger.info(`Playwright scraper-service returned HTTP status ${res.status}`);
                return null;
            }
            
            const scraperData = await res.json() as any;
            if (scraperData && scraperData.success && scraperData.rawContent) {
                return await parseHtml(scraperData.rawContent, url, analyze);
            }
            return null;
        } finally {
            clearTimeout(timeout);
        }
    } catch (e: any) {
        logger.error(`Playwright Scraper Extract fail for ${url}: ${e.message || e}`);
        return null;
    }
}
