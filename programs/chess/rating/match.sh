#!/usr/bin/env bash
# Plays CISAB (Rust port of v14) against Texel 1.12 at a given UCI_Elo.
# Usage: ./match.sh ELO GAMES [TC]   e.g. ./match.sh 0 100 30+0.2
# Writes results/texel-ELO-GAMES.pgn; summarize with ./summarize.py.
set -euo pipefail
cd "$(dirname "$0")"
elo=$1 games=$2 tc=${3:-30+0.2}
[ -x third_party/texel/build/texel ] && [ -x third_party/fastchess/fastchess ] || ./setup.sh
cargo build --release --quiet --manifest-path uci/Cargo.toml
mkdir -p results
out=results/texel-$elo-$games.pgn
rm -f "$out" "${out%.pgn}.log"
export CISAB_LOG=$PWD/${out%.pgn}.log
third_party/fastchess/fastchess \
  -engine cmd=uci/target/release/cisab-uci name=CISAB \
  -engine cmd=third_party/texel/build/texel name="Texel-$elo" option.UCI_LimitStrength=true option.UCI_Elo="$elo" \
  -each tc="$tc" -rounds $((games / 2)) -games 2 -concurrency "${CONCURRENCY:-16}" \
  -recover -maxmoves 200 -pgnout file="$out" | grep -E '^(Games|Elo|Results)' || true
./summarize.py "$out"
