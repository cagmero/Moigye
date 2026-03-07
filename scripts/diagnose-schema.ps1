$KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l"
$URL = "https://rfzopdbbwujrohkxenmt.supabase.co"
$HDR = @{
    "apikey"        = $KEY
    "Authorization" = "Bearer $KEY"
}

function Test-Column($table, $col) {
    try {
        $u = "$URL/rest/v1/$table?select=$col&limit=1"
        Invoke-RestMethod -Uri $u -Headers $HDR | Out-Null
        Write-Host "  [OK] $table.$col"
    } catch {
        Write-Host "  [FAIL] $table.$col : $($_.Exception.Message)"
    }
}

Write-Host "Testing USERS columns..."
Test-Column "users" "wallet_address"
Test-Column "users" "privy_did"
Test-Column "users" "score"
Test-Column "users" "is_banned"

Write-Host ""
Write-Host "Testing GROUPS columns..."
Test-Column "groups" "group_id"
Test-Column "groups" "min_score_required"

Write-Host ""
Write-Host "Testing BID_HISTORY columns..."
Test-Column "bid_history" "wallet_address"
Test-Column "bid_history" "group_id"
