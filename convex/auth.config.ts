export default {
    providers: [
        {
            // Use the Clerk Issuer URL. Fallback logic to prevent deployment failure if env var is missing.
            domain: process.env.CLERK_FRONTEND_API_URL || "https://integral-bulldog-65.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
