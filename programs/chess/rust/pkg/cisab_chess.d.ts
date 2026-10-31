/* tslint:disable */
/* eslint-disable */

/**
 * The original program's prompts, answered one typed line at a time.
 */
export class Engine {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * The events up to the next prompt, as JSON; an error string for malformed input.
     */
    input(line: string): string;
    constructor();
    snapshot(): string;
}

/**
 * A game on the site: your legal move becomes the lines an operator would type.
 */
export class Game {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * The opening move CISAB makes as White before your first move, as JSON (or null).
     */
    first_reply(): string;
    /**
     * Starts a game. You play White or Black; CISAB answers WHAT COLOR ARE WE with the other.
     */
    constructor(you_are_white: boolean);
    /**
     * Plays your move (CISAB's squares), then CISAB's reply. `promote` is 2-5 for a
     * pawn reaching row 8; `iq` answers IQ instead of OK, ending CISAB's opening.
     * Returns the new events as JSON, or an error if the move is not legal.
     */
    play(fr: number, fc: number, tr: number, tc: number, promote: number, iq: boolean): string;
    /**
     * Board, prompt, your legal moves and status, as JSON.
     */
    state(): string;
}

/**
 * For the parity recorder: your legal moves on a B(0-10,0-10) board (row by row),
 * as JSON. `passant` is the skipped square as row*16+column, or 0.
 */
export function legal_moves_json(board: Int8Array, col1: boolean, col8: boolean, passant: number): string;

/**
 * For tests: RND(N) for N = 1, 2, … 120, 1, 2, … (`count` calls), then the seed's three bytes.
 */
export function rnd_sequence(count: number): Uint8Array;

/**
 * For tests: every score lines 3000-3030 and 1205 can produce, as MBF bytes,
 * in the order of the BASIC program in tests/chess-rust.test.mjs.
 */
export function score_table(): Uint8Array;

/**
 * For tests: the move steps derived from 45° angles, as JSON.
 */
export function steps_json(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_engine_free: (a: number, b: number) => void;
    readonly __wbg_game_free: (a: number, b: number) => void;
    readonly engine_input: (a: number, b: number, c: number) => [number, number, number, number];
    readonly engine_new: () => number;
    readonly engine_snapshot: (a: number) => [number, number];
    readonly game_first_reply: (a: number) => [number, number];
    readonly game_new: (a: number) => number;
    readonly game_play: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly game_state: (a: number) => [number, number];
    readonly legal_moves_json: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly rnd_sequence: (a: number) => [number, number];
    readonly score_table: () => [number, number];
    readonly steps_json: () => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
