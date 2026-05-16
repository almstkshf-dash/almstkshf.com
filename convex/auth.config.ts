/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

const clerkDomain = process.env.CLERK_FRONTEND_API_URL;

if (!clerkDomain) {
    throw new Error("CLERK_FRONTEND_API_URL is missing. Please set it in Convex environment variables.");
}

const authConfig = {
    providers: [
        {
            domain: clerkDomain,
            applicationID: "convex",
        },
        // Fallback for local development using Clerk dev keys
        {
            domain: "https://integral-bulldog-65.clerk.accounts.dev",
            applicationID: "convex",
        }
    ],
};

export default authConfig;
