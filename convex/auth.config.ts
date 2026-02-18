const clerkDomain = process.env.CLERK_FRONTEND_API_URL;

if (!clerkDomain) {
    throw new Error("CLERK_FRONTEND_API_URL is missing. Please set it in Convex environment variables.");
}

export default {
    providers: [
        {
            domain: clerkDomain,
            applicationID: "convex",
        },
    ],
};
