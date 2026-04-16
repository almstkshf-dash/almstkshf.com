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
    ],
};

export default authConfig;
