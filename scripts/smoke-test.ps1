param([string]$BaseUrl = "http://127.0.0.1:3000")
$ErrorActionPreference = "Stop"
$base = $BaseUrl.TrimEnd("/")
$routes = @("/", "/entertainment", "/professional", "/account", "/search", "/releases", "/products", "/audio", "/professional/inquiry", "/personal/creative-labs", "/worlds", "/robots.txt", "/sitemap.xml", "/icon.svg", "/share.png")
$failures = @()
foreach ($route in $routes) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$base$route" -MaximumRedirection 5 -TimeoutSec 20
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) { $failures += "$route returned $($response.StatusCode)" }
    else { Write-Output "PASS $($response.StatusCode) $route" }
  } catch { $failures += "$route failed: $($_.Exception.Message)" }
}
$negativeChecks = @(
  @{ Method = "GET"; Route = "/definitely-missing-cry320"; Expected = 404 },
  @{ Method = "POST"; Route = "/api/membership/session"; Expected = 503 }
)
foreach ($check in $negativeChecks) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Method $check.Method -Uri "$base$($check.Route)" -TimeoutSec 20
    if ($response.StatusCode -ne $check.Expected) { $failures += "$($check.Route) returned $($response.StatusCode); expected $($check.Expected)" }
  } catch {
    $status = [int]$_.Exception.Response.StatusCode
    if ($status -eq $check.Expected) { Write-Output "PASS $status $($check.Method) $($check.Route)" }
    else { $failures += "$($check.Route) failed with $status; expected $($check.Expected)" }
  }
}
if ($failures.Count -gt 0) { throw ($failures -join [Environment]::NewLine) }
