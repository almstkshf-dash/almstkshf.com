$envs = @{
    "CHATBOT_IDENTITY_SECRET"           = "h2ax7gd1icx41i3kh26bgabo0oj5l0ta";
    "CLERK_FRONTEND_API_URL"            = "https://clerk.almstkshf.com";
    "CLERK_SECRET_KEY"                  = "sk_live_zk27tQWBQlh4gmp5LrUWXOQO35SG3rjQFUDgGda5ZX";
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" = "pk_live_Y2xlcmsuYWxtc3Rrc2hmLmNvbSQ";
    "CONVEX_DEPLOYMENT"                 = "prod:flexible-anaconda-162";
    "NEXT_PUBLIC_CONVEX_URL"            = "https://flexible-anaconda-162.convex.cloud";
    "NEXT_PUBLIC_CONVEX_SITE_URL"       = "https://flexible-anaconda-162.convex.site";
    "CONVEX_DEPLOY_KEY"                 = "prod:flexible-anaconda-162|eyJ2MiI6ImE5OWIxZTE2NjM2YTQ1OTk4YjNhYjcxNDY0OGYxMGQ1In0="
}

$scope = "almstkshfuae-lgtms-projects"
$token = "vcp_5xNBWnCmLWmCskI3X6goonTPtEqWEpfVj47gJYtAXYGNAAAgZF4YYygm"

foreach ($key in $envs.Keys) {
    Write-Host "Resetting $key..."
    & vercel env rm $key production -y --scope $scope --token $token | Out-Null
    
    $val = $envs[$key]
    Write-Host "Adding $key..."
    # Create temp file without newline
    [System.IO.File]::WriteAllText("$pwd/temp_val.txt", $val)
    
    # Use Get-Content to pipe the file content
    Get-Content "$pwd/temp_val.txt" -Raw | & vercel env add $key production --scope $scope --token $token
}

Remove-Item "$pwd/temp_val.txt"
