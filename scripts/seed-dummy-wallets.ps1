# seed-dummy-wallets.ps1
# Run from the project root: C:\Users\jpf\Desktop\Moyige\Moigye
# powershell -ExecutionPolicy Bypass -File scripts/seed-dummy-wallets.ps1

$SUPABASE_URL = "https://rfzopdbbwujrohkxenmt.supabase.co"
$SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l"

$BASE_HDR = @{
    "apikey"        = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
}

# Plain INSERT — no on_conflict needed for new rows
function Insert-Rows {
    param($table, $rows)
    $hdr  = $BASE_HDR.Clone()
    $hdr["Prefer"]       = "return=representation"
    $hdr["Content-Type"] = "application/json"
    $body = $rows | ConvertTo-Json -Depth 6 -Compress
    try {
        $r = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$table" `
             -Method POST -Headers $hdr -Body $body -ErrorAction Stop
        return @($r)
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $rd = New-Object System.IO.StreamReader($stream)
            $rb = $rd.ReadToEnd(); $rd.Dispose()
            try   { $j = $rb | ConvertFrom-Json; Write-Host "  INSERT ERROR: $($j.message)" }
            catch { Write-Host "  INSERT ERROR: $rb" }
        } else { Write-Host "  INSERT ERROR: $($_.Exception.Message)" }
        return @()
    }
}

# DELETE rows by a filter so we can re-insert safely
function Delete-Rows {
    param($table, $filter)
    $hdr  = $BASE_HDR.Clone()
    $hdr["Content-Type"] = "application/json"
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$($table)?$filter" `
            -Method DELETE -Headers $hdr -ErrorAction Stop | Out-Null
    } catch { <# ignore if nothing to delete #> }
}

function New-Address {
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $b   = New-Object byte[] 20
    $rng.GetBytes($b); $rng.Dispose()
    return "0x" + ([BitConverter]::ToString($b) -replace "-","").ToLower()
}

function Get-Rnd { param($min, $max) Get-Random -Minimum $min -Maximum ($max + 1) }
function Get-DaysAgo { param($n) (Get-Date).AddDays(-$n).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") }

# Wallet profiles — one per tier
$P0 = @{ label="T1 Newcomer";          score=320;  wins=0;  rounds=2;  avgBid=100  }
$P1 = @{ label="T1 Newcomer Growing";  score=380;  wins=1;  rounds=5;  avgBid=200  }
$P2 = @{ label="T2 Active Member";     score=450;  wins=3;  rounds=10; avgBid=500  }
$P3 = @{ label="T2 Active Member+";    score=570;  wins=5;  rounds=15; avgBid=800  }
$P4 = @{ label="T3 Circle Elder";      score=650;  wins=8;  rounds=22; avgBid=1500 }
$P5 = @{ label="T3 Circle Elder+";     score=750;  wins=12; rounds=30; avgBid=3000 }
$P6 = @{ label="T4 Protocol Guardian"; score=820;  wins=18; rounds=40; avgBid=5000 }
$P7 = @{ label="T5 Protocol Legend";   score=1000; wins=30; rounds=60; avgBid=9000 }
$PROFILES = @($P0,$P1,$P2,$P3,$P4,$P5,$P6,$P7)

# ── Generate wallets ──────────────────────────────────────────────────────────
Write-Host ""; Write-Host "Generating dummy wallets..."; Write-Host ""
$wallets = @()
for ($i = 0; $i -lt $PROFILES.Count; $i++) {
    $p    = $PROFILES[$i]
    $addr = New-Address
    $wallets += [PSCustomObject]@{ address=$addr; profile=$p; idx=($i+1) }
    Write-Host "  [$($i+1)] $($p.label)"
    Write-Host "      $addr  score=$($p.score)"; Write-Host ""
}

# ── Step 1: Seed groups (delete IDs 1-10 first, then insert fresh) ────────────
Write-Host "Seeding groups (1-10)..."
$depositArr  = @(100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000, 20000)
$minScoreArr = @(300, 300, 300,  400,  400,  600,  600,  800,  800,   800)

# Delete existing dummy groups to avoid PK conflict
for ($i = 1; $i -le 10; $i++) { Delete-Rows "groups" "group_id=eq.$i" }

$groupRows = @()
for ($i = 0; $i -lt 10; $i++) {
    $groupRows += [PSCustomObject]@{
        group_id           = $i + 1
        moderator          = $wallets[$i % $wallets.Count].address
        is_auction_started = if ($i -lt 5) { $true } else { $false }
        fixed_deposit      = $depositArr[$i]
        max_participants   = (Get-Rnd 5 20)
        is_public          = $true
        min_score_required = $minScoreArr[$i]
    }
}
$g = Insert-Rows "groups" $groupRows
Write-Host "  Inserted $(@($g).Count) groups"; Write-Host ""

# ── Step 2: Insert users ──────────────────────────────────────────────────────
Write-Host "Inserting users..."
$userRows = @()
foreach ($w in $wallets) {
    $userRows += [PSCustomObject]@{
        wallet_address = $w.address
        privy_did      = "dummy_wallet_$($w.idx)"
        score          = $w.profile.score
        is_banned      = $false
    }
}
$u = Insert-Rows "users" $userRows
Write-Host "  Inserted $(@($u).Count) users"; Write-Host ""

# ── Step 3: Insert bid_history ────────────────────────────────────────────────
Write-Host "Inserting bid history..."
$histRows = @()
foreach ($w in $wallets) {
    $p   = $w.profile
    $gid = Get-Rnd 1 5
    for ($r = 1; $r -le $p.rounds; $r++) {
        $lo = [math]::Floor($p.avgBid * 0.7)
        $hi = [math]::Floor($p.avgBid * 1.3)
        $histRows += [PSCustomObject]@{
            group_id        = $gid
            wallet_address  = $w.address
            discount_amount = Get-Rnd $lo $hi
            did_win         = if ($r -le $p.wins) { $true } else { $false }
            round_number    = $r
            completed_at    = Get-DaysAgo ($p.rounds - $r + 1)
        }
        if ($r % 5 -eq 0) { $gid = Get-Rnd 1 10 }
    }
}

$batchSize = 50
for ($i = 0; $i -lt $histRows.Count; $i += $batchSize) {
    $end   = [math]::Min($i + $batchSize - 1, $histRows.Count - 1)
    $batch = $histRows[$i..$end]
    Insert-Rows "bid_history" $batch | Out-Null
    Write-Host "  rows $($i+1)-$($end+1) inserted"
}
Write-Host "  Total: $($histRows.Count) bid history rows"; Write-Host ""

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ("=" * 70)
Write-Host "  SEED COMPLETE"
Write-Host ("=" * 70)
Write-Host "  Address                                       Score  Label"
Write-Host ("  " + ("-" * 66))
foreach ($w in $wallets) {
    Write-Host ("  {0}  {1,4}   {2}" -f $w.address, $w.profile.score, $w.profile.label)
}
Write-Host ""
