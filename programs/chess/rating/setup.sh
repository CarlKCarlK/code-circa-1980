#!/usr/bin/env bash
# Fetches and builds the pinned rating tools into third_party/ (not committed).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p third_party && cd third_party
[ -d texel ] || git clone https://github.com/peterosterlund2/texel
[ -d fastchess ] || git clone https://github.com/Disservin/fastchess
git -C texel checkout -q 1.12            # bd5698c67f3c1841db623296cfd49d4a37abd5a3
git -C fastchess checkout -q v1.8.2-alpha # f618e34540f94f4719ad3817950618dabe441318
(mkdir -p texel/build && cd texel/build && cmake -DCMAKE_BUILD_TYPE=Release .. && make -j8 texel)
make -C fastchess -j8
