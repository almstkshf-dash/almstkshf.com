import { Auth } from "convex/server";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function hasAdminRole(identity: any): boolean {
    const role = (identity?.role || identity?.orgRole || identity?.publicMetadata?.role || identity?.claims?.role || "")
        .toString()
        .toLowerCase();

    if (["admin", "owner", "superadmin"].includes(role)) return true;
    if (ADMIN_IDS.includes(identity?.subject)) return true;
    return false;
}

export async function requireUser(auth: Auth) {
    const identity = await auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }
    return identity;
}

export async function requireAdmin(auth: Auth) {
    const identity = await requireUser(auth);
    if (!hasAdminRole(identity)) {
        throw new Error("Not authorized");
    }
    return identity;
}

