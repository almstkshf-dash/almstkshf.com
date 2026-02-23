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
    if (!hasAdminRole(identity)) {
        throw new ConvexError("Not authorized");
    }
    return identity;
}

