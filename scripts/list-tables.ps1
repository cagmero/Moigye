$KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l"
$URL = "https://rfzopdbbwujrohkxenmt.supabase.co"
$HDR = @{
    "apikey"        = $KEY
    "Authorization" = "Bearer $KEY"
}

Write-Host "Fetching OpenAPI definitions..."
try {
    $r = Invoke-RestMethod -Uri "$URL/rest/v1/" -Headers $HDR
    Write-Host "Tables found in definitions:"
    $r.definitions.PSObject.Properties.Name | Sort-Object | ForEach-Object { Write-Host " - $_" }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
