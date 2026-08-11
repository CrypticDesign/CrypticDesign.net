$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$rawArticles = Get-Content -Raw (Join-Path $PSScriptRoot "articles.raw.json") | ConvertFrom-Json
$outputRoot = Join-Path $repoRoot "public\images\articles\editorial"
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$manifest = [ordered]@{}

foreach ($article in $rawArticles) {
  $url = "https://www.crypticdesign.net/articles/$($article.slug)"
  Write-Host "Reading $url"
  try {
    $html = (Invoke-WebRequest -UseBasicParsing $url).Content
  } catch {
    Write-Warning "Skipped unavailable live article: $url"
    $manifest[$article.slug] = @()
    continue
  }
  $matches = [regex]::Matches($html, 'https://images\.squarespace-cdn\.com/content/v1/[^"''< ]+')
  $urls = $matches.Value |
    ForEach-Object { [System.Net.WebUtility]::HtmlDecode($_).Split('?')[0] } |
    Where-Object { $_ -notmatch 'favicon\.ico$|CRY_IMG_PlatonicSolidsBG\.png$' } |
    Select-Object -Unique

  $articleDir = Join-Path $outputRoot $article.slug
  New-Item -ItemType Directory -Force -Path $articleDir | Out-Null
  $items = @()
  $index = 0

  foreach ($imageUrl in $urls) {
    $index++
    $cleanUrl = $imageUrl -replace '&quot;.*$', '' -replace '\\u0026.*$', ''
    if ($cleanUrl -match 'favicon\.ico|CRY_IMG_PlatonicSolidsBG\.png') { continue }
    $baseName = [System.Uri]::UnescapeDataString(([System.Uri]$cleanUrl).Segments[-1])
    $safeName = $baseName -replace '[^A-Za-z0-9._-]', '-'
    if ([string]::IsNullOrWhiteSpace($safeName)) { $safeName = "image-$index.jpg" }
    $destination = Join-Path $articleDir $safeName
    if (-not (Test-Path $destination)) {
      Invoke-WebRequest -UseBasicParsing "$cleanUrl`?format=1500w" -OutFile $destination
    }
    $items += [ordered]@{
      src = "/images/articles/editorial/$($article.slug)/$safeName"
      alt = ($baseName -replace '\.[^.]+$', '') -replace '[-_]+', ' '
    }
  }

  $manifest[$article.slug] = $items
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $repoRoot "src\lib\article-images.json")
Write-Host "Wrote article image manifest for $($manifest.Count) articles."
