Set-Location $PSScriptRoot
$repos = @{
  "mock-test"   = "https://github.com/the-lust/mock-test.git"
  "cbt-system"  = "https://github.com/cssadewale/cbt-system.git"
  "cissp-study" = "https://github.com/xcode96/ISC2.git"
  "cbt-basic"   = "https://github.com/Petec0x0/cbt.git"
}
foreach ($name in $repos.Keys) {
  if (Test-Path $name) { Write-Host "skip $name (exists)"; continue }
  git clone --depth 1 $repos[$name] $name
  Remove-Item -Recurse -Force "$name/.git"
}
Write-Host "Done. Reference repos ready."
