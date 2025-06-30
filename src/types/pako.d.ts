// src/types/pako.d.ts
declare module 'pako' {
  export function gzip(data: string | Uint8Array, options?: any): Uint8Array;
}
