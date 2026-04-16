$header = @"
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */
"@

$files = Get-ChildItem -Path "src", "convex" -Include "*.ts", "*.tsx" -Recurse -File

foreach ($file in $files) {
    if ($file.FullName -match "node_modules") { continue }
    
    $content = Get-Content $file.FullName -Raw
    if ($content -match "MPL-2.0" -or $content -match "Mozilla Public") {
        # Already has MPL, maybe we need to update it? For now skip.
        continue
    }

    # Optional: simple regex to remove existing top-level block comments before applying
    $content = $content -replace '(?s)^\s*(?:\/\*(?![\*\s]*This Source Code).*?\*\/(\r?\n)*)*', ''
    
    $newContent = "$header`n`n$content"
    Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
    Write-Output "Updated: $($file.Name)"
}
