$env_key = "CONVEX_DEPLOY_KEY"
$env_value = "prod:flexible-anaconda-162|eyJ2MiI6ImE5OWIxZTE2NjM2YTQ1OTk4YjNhYjcxNDY0OGYxMGQ1In0="
$scope = "almstkshfuae-lgtms-projects"
$token = "vcp_5xNBWnCmLWmCskI3X6goonTPtEqWEpfVj47gJYtAXYGNAAAgZF4YYygm"

Write-Host "Fixing $env_key on Vercel Production..."

# Remove existing key to ensure clean state
& vercel env rm "$env_key" production -y --scope "$scope" --token "$token" 2>$null

# Add new key
# We pipe the value directly to ensure correctness
# Note: "echo" in PowerShell is Write-Output and adds newline by default.
# We will use Write-Host -NoNewline cannot pipe easily.
# [System.Console]::Write is better but tricky.
# Safest: Use echo but rely on Vercel handling the newline if it's just one, 
# BUT the issue was likely double newline or weird piping.
# Let's try direct input via process start or just standard pipe which usually works if variable is clean.

$env_value | & vercel env add "$env_key" production --scope "$scope" --token "$token"

Write-Host "Please verify in Vercel Dashboard that $env_key does NOT have a trailing newline."
