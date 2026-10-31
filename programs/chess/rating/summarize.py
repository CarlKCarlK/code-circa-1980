#!/usr/bin/env python3
"""Summarizes CISAB's games from fastchess PGN files.

Software defects (illegal moves, crashes, time forfeits) are counted apart from
ordinary chess results. The Texel-calibrated estimate counts every game: a defect
loses, as it would in a tournament. The opponent's Elo comes from its name, Texel-N.
The reasons come from the adapter's CISAB_LOG file beside each PGN.
Usage: ./summarize.py results/*.pgn
"""
import math
import os
import re
import sys
from collections import Counter

def games(path):
    text = open(path, encoding='utf-8').read()
    for block in re.split(r'\n\n(?=\[Event )', text.strip()):
        tags = dict(re.findall(r'^\[(\w+) "(.*)"\]$', block, re.M))
        if tags:
            comments = re.findall(r'\{([^}]*)\}', block)
            yield tags, comments[-1] if comments else ''

def classify(tags, last):
    cisab_white = tags['White'] == 'CISAB'
    result = tags['Result']
    score = {'1-0': 1, '0-1': 0, '1/2-1/2': 0.5}.get(result)
    if score is None:
        return 'unfinished', None
    score = score if cisab_white else 1 - score
    if score == 1:
        return 'win', 1
    if score == 0.5:
        return 'draw', 0.5
    term = tags.get('Termination', '')
    if term == 'illegal move':
        return 'illegal move', 0
    if term == 'time forfeit':
        return 'time forfeit', 0
    if term in ('abandoned', 'stalled connection') or 'disconnect' in last.lower() or 'crash' in last.lower():
        return 'crash', 0
    return 'chess loss', 0

def elo(score, n):
    s = min(max(score / n, 0.5 / n), 1 - 0.5 / n)
    diff = -400 * math.log10(1 / s - 1)
    # Standard error from the per-game variance of the score.
    se = math.sqrt(s * (1 - s) / n) / (s * (1 - s) * math.log(10) / 400)
    return diff, se

by_opponent = {}
for path in sys.argv[1:]:
    for tags, last in games(path):
        opponent = tags['Black'] if tags['White'] == 'CISAB' else tags['White']
        kind, score = classify(tags, last)
        entry = by_opponent.setdefault(opponent, {'kinds': Counter(), 'score': 0.0, 'n': 0, 'logs': set()})
        log = path[:-4] + '.log'
        if os.path.exists(log):
            entry['logs'].add(log)
        entry['kinds'][kind] += 1
        if score is not None:
            entry['score'] += score
            entry['n'] += 1

for opponent, e in sorted(by_opponent.items(), key=lambda kv: int(re.fullmatch(r'Texel-(-?\d+)', kv[0]).group(1))):
    rating = int(re.fullmatch(r'Texel-(-?\d+)', opponent).group(1))
    diff, se = elo(e['score'], e['n'])
    kinds = ', '.join(f'{k} {v}' for k, v in e['kinds'].most_common())
    print(f"vs {opponent}: {e['n']} games, CISAB scored {e['score']:g} ({100 * e['score'] / e['n']:.1f}%) -> "
          f"Texel-calibrated estimate {rating + diff:.0f} ± {1.96 * se:.0f} (95%)")
    print(f"   {kinds}")
    reasons = Counter()
    for path in e['logs']:
        for line in open(path, encoding='utf-8'):
            kind, _ply, _move, why = line.rstrip('\n').split('\t')
            reasons[f'{kind}: {why}'] += 1
    for why, count in reasons.most_common():
        print(f"   {count:4}  {why}")
