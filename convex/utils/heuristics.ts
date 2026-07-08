/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { ArticleAnalysis } from "./gemini";

// ── AHO-CORASICK KEYWORD MATCHER IMPLEMENTATION ──────────────────────────────

class AhoCorasickNode {
    children: Map<string, AhoCorasickNode> = new Map();
    fail: AhoCorasickNode | null = null;
    output: string[] = [];
}

export class AhoCorasickMatcher {
    private root: AhoCorasickNode = new AhoCorasickNode();

    constructor(patterns: string[]) {
        this.buildTrie(patterns);
        this.buildFailureLinks();
    }

    private buildTrie(patterns: string[]) {
        for (const pattern of patterns) {
            const normalized = pattern.toLowerCase().trim();
            if (!normalized) continue;

            let node = this.root;
            for (const char of normalized) {
                if (!node.children.has(char)) {
                    node.children.set(char, new AhoCorasickNode());
                }
                node = node.children.get(char)!;
            }
            node.output.push(pattern);
        }
    }

    private buildFailureLinks() {
        const queue: AhoCorasickNode[] = [];
        
        // Root children failure links point to root
        for (const child of this.root.children.values()) {
            child.fail = this.root;
            queue.push(child);
        }

        while (queue.length > 0) {
            const current = queue.shift()!;

            for (const [char, child] of current.children.entries()) {
                let failure = current.fail;
                while (failure !== null && !failure.children.has(char)) {
                    failure = failure.fail;
                }
                child.fail = failure ? failure.children.get(char)! : this.root;
                child.output.push(...child.fail.output);
                queue.push(child);
            }
        }
    }

    /**
     * Checks if any pattern exists within the target text.
     */
    match(text: string): boolean {
        const normalized = text.toLowerCase();
        let node = this.root;

        for (const char of normalized) {
            while (node !== null && !node.children.has(char)) {
                node = node.fail!;
            }
            node = node ? node.children.get(char)! : this.root;
            if (node.output.length > 0) {
                return true;
            }
        }
        return false;
    }
}

// ── HEURISTIC FALLBACK KEYWORD CONFIGURATION ─────────────────────────────────

const POSITIVE_KEYWORDS = [
    "growth", "success", "positive", "profit", "award", "win", "won", "increase",
    "expansion", "partnership", "launch", "breakthrough", "milestone", "leader",
    "innovative", "نجاح", "ارباح", "فوز", "ازدهار", "نمو", "تطور", "شراكة", "اطلاق", "ابتكار"
];

const NEGATIVE_KEYWORDS = [
    // Original keyword matching list with typoes preserved for backward compatibility
    "نصب", "خراب", "زفت", "فضيحة", "ورطة", "تعيس", "فاشل", "حشيش", "ماريجوانا", "كريستال",
    "كوك", "ترامادول", "لاريكا", "سي بي دي", "loss", "decline", "negative", "drop", "decrease",
    "fail", "scandal", "breach", "lawsuit", "violation", "fraud", "crisis", "warning", "risk",
    "hashish", "weed", "cocauine", "teramadol", "larica", "massage in dubai", "happy ending",
    "cristal mith", "escort girls", "harm", "harmfull", "cbd oil", "خسارة", "تراجع", "فشل",
    "فضيحة", "اختراق", "دعوى", "انتهاك", "احتيال", "ازمة", "تحذير", "خطر",
    // Standard corrected spellings for safety addition
    "cocaine", "tramadol", "crystal meth", "harmful"
];

// Cache matcher compilations
const positiveMatcher = new AhoCorasickMatcher(POSITIVE_KEYWORDS);
const negativeMatcher = new AhoCorasickMatcher(NEGATIVE_KEYWORDS);

/**
 * Executes fallback heuristic evaluation on title and snippet when Gemini is unavailable.
 */
export function runHeuristicsFallback(title: string, snippet: string): ArticleAnalysis {
    const combinedText = `${title} ${snippet}`;
    let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
    let risk: "Low" | "Medium" | "High" | "Critical" = "Medium";

    if (negativeMatcher.match(combinedText)) {
        sentiment = "Negative";
        risk = "High";
    } else if (positiveMatcher.match(combinedText)) {
        sentiment = "Positive";
        risk = "Low";
    }

    const lowerText = combinedText.toLowerCase();
    const isSocial = lowerText.includes("twitter.com") || 
                     lowerText.includes("x.com") || 
                     lowerText.includes("reddit.com");

    const reach_estimate = isSocial ? 15000 : 50000;
    const sourceType = isSocial ? "Social Media" : "Online News";
    const tone = sentiment === "Positive" ? "Optimistic" : (sentiment === "Negative" ? "Concerning" : "Informative");

    return {
        sentiment,
        summary: snippet.substring(0, 200).trim() + "...",
        sourceType,
        reach_estimate,
        tone,
        risk,
        hashtags: [],
        emotions: {
            joy: sentiment === "Positive" ? 60 : 0,
            sadness: sentiment === "Negative" ? 40 : 0,
            anger: sentiment === "Negative" ? 30 : 0,
            fear: sentiment === "Negative" ? 50 : 0,
            surprise: 20,
            trust: sentiment === "Positive" ? 70 : 30
        }
    };
}
