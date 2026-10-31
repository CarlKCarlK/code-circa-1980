#!/usr/bin/env python3
"""How CISAB's drawn games end: who was stalemated, and the material balance.

Needs python-chess (pip install chess==1.11.2).
Usage: endgame.py results/texel-0-100.pgn ...
Material counts pawn 1, knight 3, bishop 3, rook 5, queen 9, from CISAB's side.
"""
import sys
from collections import Counter

import chess
import chess.pgn

VALUE = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9}

def material(board, color):
    return sum(VALUE.get(p.piece_type, 0) * (1 if p.color == color else -1) for p in board.piece_map().values())

for path in sys.argv[1:]:
    ends, ahead = Counter(), []
    with open(path, encoding='utf-8') as f:
        while (game := chess.pgn.read_game(f)) is not None:
            cisab = chess.WHITE if game.headers['White'] == 'CISAB' else chess.BLACK
            board = game.end().board()
            if board.is_stalemate():
                who = 'CISAB stalemated its opponent' if board.turn != cisab else 'CISAB was stalemated'
                ends[who] += 1
                if board.turn != cisab:
                    ahead.append(material(board, cisab))
    print(path)
    for kind, n in ends.most_common():
        print(f'   {n:4}  {kind}')
    if ahead:
        up = sum(1 for m in ahead if m > 0)
        big = sum(1 for m in ahead if m >= 9)
        print(f'   when CISAB stalemated its opponent: ahead in material {up} of {len(ahead)}, '
              f'by a queen or more {big}; median lead {sorted(ahead)[len(ahead) // 2]}')
