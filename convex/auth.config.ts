/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

const providers = [];

// 1. Check if CLERK_FRONTEND_API_URL is configured (custom domain or staging domain)
let envClerkDomain = process.env["CLERK_FRONTEND_API_URL"];
if (envClerkDomain) {
    if (!envClerkDomain.startsWith("http://") && !envClerkDomain.startsWith("https://")) {
        envClerkDomain = `https://${envClerkDomain}`;
    }
    providers.push({
        domain: envClerkDomain,
        applicationID: "convex",
    });
}

// 2. Fallbacks to prevent auth errors if environment variables are not yet fully updated on Convex
const fallbacks = [
    "https://integral-bulldog-65.clerk.accounts.dev", // Local dev/test key domain
    "https://clerk.almstkshf.com",                     // Production custom domain
];

for (const fallback of fallbacks) {
    if (!providers.some(p => p.domain === fallback)) {
        providers.push({
            domain: fallback,
            applicationID: "convex",
        });
    }
}

const authConfig = {
    providers,
};

export default authConfig;
