$KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l"
$URL = "https://rfzopdbbwujrohkxenmt.supabase.co"
$HDR = @{
    "apikey"        = $KEY
    "Authorization" = "Bearer $KEY"
}

Write-Host "--- Checking users table ---"
try {
    $users = Invoke-RestMethod -Uri "$URL/rest/v1/users?select=wallet_address,score,privy_did&order=score.asc" -Headers $HDR
    Write-Host "Total users: $($users.Count)"
    foreach ($usr in $users) {
        Write-Host "  $($usr.wallet_address)  score=$($usr.score)  $($usr.privy_did)"
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "--- Checking bid_history table ---"
try {
    $hist = Invoke-RestMethod -Uri "$URL/rest/v1/bid_history?select=wallet_address,did_win,discount_amount&limit=5&order=completed_at.desc" -Headers $HDR
    Write-Host "Sample bid_history rows: $($hist.Count)"
    foreach ($row in $hist) {
        Write-Host "  $($row.wallet_address)  win=$($row.did_win)  amount=$($row.discount_amount)"
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "--- Checking groups table ---"
try {
    $grps = Invoke-RestMethod -Uri "$URL/rest/v1/groups?select=group_id,fixed_deposit,min_score_required" -Headers $HDR
    Write-Host "Total groups: $($grps.Count)"
    foreach ($grp in $grps) {
        Write-Host "  Group #$($grp.group_id)  deposit=$($grp.fixed_deposit)  min_score=$($grp.min_score_required)"
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)"
}
