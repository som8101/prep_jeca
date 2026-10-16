#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
clone() { [ -d "$2" ] && echo "skip $2 (exists)" || git clone --depth 1 "$1" "$2"; }
clone https://github.com/the-lust/mock-test.git      mock-test
clone https://github.com/cssadewale/cbt-system.git   cbt-system
clone https://github.com/xcode96/ISC2.git            cissp-study
clone https://github.com/Petec0x0/cbt.git           cbt-basic
# remove nested .git so the main project doesn't treat them as submodules
for d in mock-test cbt-system cissp-study cbt-basic; do rm -rf "$d/.git"; done
echo "Done. Reference repos ready."
