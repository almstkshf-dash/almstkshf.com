/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Auth } from "convex/server";
import { ConvexError } from "convex/values";

function getAdminIds(): string[] {
    // Only Actions have access to process.env in some Convex environments.
    // Queries/Mutations might fail or return undefined.
    try {
        const val = (typeof process !== 'undefined' && process.env?.ADMIN_USER_IDS) || "";
        return val.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
        return [];
    }
}

function hasAdminRole(identity: any): boolean {
    const role = (identity?.role || identity?.orgRole || identity?.publicMetadata?.role || identity?.claims?.role || "")
        .toString()
        .toLowerCase();

    if (["admin", "owner", "superadmin"].includes(role)) return true;
    if (getAdminIds().includes(identity?.subject)) return true;
    return false;
}

export async function requireUser(auth: Auth) {
    const identity = await auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError("Not authenticated: Identity is null. If testing in the Dashboard/CLI, please use 'Impersonate' or provide a user token.");
    }
    return identity;
}

export async function requireAdmin(auth: Auth) {
    const identity = await requireUser(auth);

    // In development only, we check for 'fake_id' (impersonation)
    if (process.env.NODE_ENV !== "production" && identity.subject === "fake_id") {
        return identity;
    }

    if (!hasAdminRole(identity)) {
        // Build a diagnostic payload so we can see exactly what Clerk sent
        const detectedRole = (
            identity?.role ||
            (identity as any)?.orgRole ||
            (identity as any)?.publicMetadata?.role ||
            (identity as any)?.claims?.role ||
            null
        );
        throw new ConvexError(
            `Not authorized. ` +
            `subject="${identity.subject}" ` +
            `detectedRole="${detectedRole ?? "NONE"}" ` +
            `(role must be "admin", "owner", or "superadmin" â€” ` +
            `set this in your Clerk JWT template under publicMetadata.role)`
        );
    }
    return identity;
}
export async function isAdmin(auth: Auth): Promise<boolean> {
    const identity = await auth.getUserIdentity();
    if (!identity) return false;
    
    // Developer bypass during local testing
    if (process.env.NODE_ENV !== "production" && identity.subject === "fake_id") {
        return true;
    }

    return hasAdminRole(identity);
}
