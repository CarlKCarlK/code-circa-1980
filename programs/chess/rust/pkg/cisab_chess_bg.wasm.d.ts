/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_engine_free: (a: number, b: number) => void;
export const __wbg_game_free: (a: number, b: number) => void;
export const engine_input: (a: number, b: number, c: number) => [number, number, number, number];
export const engine_new: () => number;
export const engine_snapshot: (a: number) => [number, number];
export const game_first_reply: (a: number) => [number, number];
export const game_new: (a: number) => number;
export const game_play: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
export const game_state: (a: number) => [number, number];
export const legal_moves_json: (a: number, b: number, c: number, d: number, e: number) => [number, number];
export const rnd_sequence: (a: number) => [number, number];
export const score_table: () => [number, number];
export const steps_json: () => [number, number];
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
