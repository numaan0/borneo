#!/usr/bin/env pwsh
# fetch-licensed-fixtures.ps1
#
# Re-downloads the licensed boardview fixtures used by Phase 1 into data/raw/.
# Nothing here is proprietary. Everything is under an open licence; licence and
# provenance lines are printed after each fetch.
#
# Raw datasets are gitignored; this script is the reproducible source of truth.
#
# Usage:
#   pwsh scripts/fetch-licensed-fixtures.ps1            # fetch everything
#   pwsh scripts/fetch-licensed-fixtures.ps1 -Only mnt   # only MNT Reform
#
# Safe by design:
#   - pinned commits (reproducible)
#   - never overwrites files that already exist (unless -Force)
#   - never touches grey-market / Apple-proprietary data

param(
  [ValidateSet("all", "mnt", "opensfc", "obdata")]
  [string]$Only = "all",

  [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$rawDir = Join-Path $root "data\raw"
$work = Join-Path $env:TEMP "borneo-fixture-fetch"

function Assert-EmptyDir([string]$dir, [string]$name) {
  if ((Test-Path $dir) -and (Get-ChildItem -Force $dir | Measure-Object).Count -gt 0) {
    throw "$name already populated at $dir. Use -Force to overwrite (data is re-fetchable, provenance is in this script)."
  }
}

function Invoke-SparseGitFetch([string]$remote, [string]$commit, [string]$sparsePath) {
  $tmp = Join-Path $work ("git-" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  git init -q $tmp
  git -C $tmp remote add origin $remote
  git -C $tmp config core.sparseCheckout true
  Set-Content -Path (Join-Path $tmp ".git\info\sparse-checkout") -Value $sparsePath -Encoding ascii
  git -C $tmp fetch -q --depth 1 origin $commit
  git -C $tmp checkout -q $commit
  return $tmp
}

function Show-LicenceBanner([string]$title, [string]$licence, [string]$url) {
  Write-Host ""
  Write-Host "==> $title" -ForegroundColor Cyan
  Write-Host "    Licence: $licence"
  Write-Host "    Details: $url"
}

New-Item -ItemType Directory -Force -Path $rawDir, $work | Out-Null

# --- MNT Reform (CERN-OHL-S v2) ---------------------------------------------
if ($Only -in @("all", "mnt")) {
  $dest = Join-Path $rawDir "mnt-reform"
  $commit = "a85c5df98993dc0e41c840ed7d0a602639a19f1a"
  Show-LicenceBanner "MNT Reform motherboard (KiCad 5.1)" "CERN-OHL-S v2" "https://git.sr.ht/~rwa/reform"

  if ((Test-Path $dest) -and -not $Force) {
    throw "MNT Reform data already present at $dest (use -Force to re-fetch)."
  }

  $src = Invoke-SparseGitFetch "https://git.sr.ht/~rwa/reform" $commit "reform2-motherboard-pcb/*"
  $s = Join-Path $src "reform2-motherboard-pcb"
  New-Item -ItemType Directory -Force -Path $dest | Out-Null

  Copy-Item (Join-Path $s "reform2-motherboard.kicad_pcb") $dest
  Copy-Item (Join-Path $s "reform2-motherboard.net") $dest
  Copy-Item (Join-Path $s "reform2-motherboard.csv") $dest
  Copy-Item (Join-Path $s "reform2-motherboard-r2c.pdf") $dest
  Copy-Item (Join-Path $s "reform2-motherboard.sch") $dest

  Remove-Item -Recurse -Force $src
  Write-Host "    -> $dest (commit $commit)"
}

# --- OpenSFC (CERN-OHL-S-2.0) -----------------------------------------------
if ($Only -in @("all", "opensfc")) {
  $dest = Join-Path $rawDir "opensfc"
  $commit = "6574450b1a4594b2aae436cf23869b0fb5808ce8"
  Show-LicenceBanner "OpenSFC Super Famicom motherboard (KiCad 9)" "CERN-OHL-S-2.0" "https://github.com/starlightk7/OpenSFC"

  if ((Test-Path $dest) -and -not $Force) {
    throw "OpenSFC data already present at $dest (use -Force to re-fetch)."
  }

  $src = Invoke-SparseGitFetch "https://github.com/starlightk7/OpenSFC.git" $commit "Motherboards/SHVC-CPU-01/Rev A/*"
  $s = Join-Path $src "Motherboards\SHVC-CPU-01\Rev A"
  New-Item -ItemType Directory -Force -Path $dest | Out-Null

  Copy-Item (Join-Path $s "SHVC-CPU-01.kicad_pcb") $dest
  Copy-Item (Join-Path $s "SHVC-CPU-01-Front.kicad_sch") $dest

  Remove-Item -Recurse -Force $src
  Write-Host "    -> $dest (commit $commit)"
}

# --- OpenBoardData (ODbL 1.0) ------------------------------------------------
if ($Only -in @("all", "obdata")) {
  $dest = Join-Path $rawDir "openboarddata"
  Show-LicenceBanner "OpenBoardData reference measurements" "ODbL 1.0" "https://opendatacommons.org/licenses/odbl/1-0/"
  New-Item -ItemType Directory -Force -Path $dest | Out-Null

  $files = @{
    "iphone8_qualcomm.obdata" = "https://openboarddata.org/?a=generate&bpath=phones%2Fapple%2Fiphone8_qualcomm";
    "ip8_qualcomm.obdata"     = "https://openboarddata.org/?a=generate&bpath=phones%2Fapple%2Fip8_qualcomm";
    "ip5_example.obdata"      = "https://openboarddata.org/?a=generate&bpath=phones%2Fapple%2Fip5";
    "ip7_example.obdata"      = "https://openboarddata.org/?a=generate&bpath=phones%2Fapple%2Fip7"
  }

  foreach ($name in $files.Keys) {
    $out = Join-Path $dest $name
    if ((Test-Path $out) -and -not $Force) {
      Write-Host "    skip existing $name (use -Force to refetch)"
      continue
    }
    Invoke-WebRequest -Uri $files[$name] -OutFile $out -UseBasicParsing
    Write-Host "    -> $out"
  }
}

Write-Host ""
Write-Host "Done. Provenance + licence metadata lives in data/raw/README.md" -ForegroundColor Green