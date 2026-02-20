$envs = @{
    "CHATBOT_IDENTITY_SECRET"           = "h2ax7gd1icx41i3kh26bgabo0oj5l0ta";
    "CLERK_FRONTEND_API_URL"            = "https://integral-bulldog-65.clerk.accounts.dev";
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" = "pk_test_aW50ZWdyYWwtYnVsbGRvZy02NS5jbGVyay5hY2NvdW50cy5kZXYk";
    "NEXT_PUBLIC_CONVEX_URL"            = "https://avid-jackal-18.convex.cloud";
    "NEXT_PUBLIC_CONVEX_SITE_URL"       = "https://avid-jackal-18.convex.site";
    "CONVEX_DEPLOYMENT"                 = "dev:avid-jackal-18";
    "CONVEX_DEPLOY_KEY"                 = "prod:flexible-anaconda-162|eyJ2MiI6ImE5OWIxZTE2NjM2YTQ1OTk4YjNhYjcxNDY0OGYxMGQ1In0="
}

foreach ($key in $envs.Keys) {
    Write-Host "Setting $key..."
    $val = $envs[$key]
    # Use comma to create an array for piping multiple lines
    $val, "n" | & vercel env add $key production
}
