# @localmock/wasm

WASM engine for LocalMock's performance-critical hot loops.

## What it accelerates

- Random integer/float generation (xorshift64 PRNG)
- Alphanumeric and hex string generation
- Luhn checksum validation (credit cards, IMEIs)
- UUID v4 generation
- Random index picking from pools

## Building

Requires [Rust](https://rustup.rs/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/):

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build the WASM module
pnpm build
```

This outputs compiled files to `pkg/` which are imported by the Worker.

## Usage in a Worker

```ts
import { initWasm, wasmEngine } from '@localmock/wasm/js';

await initWasm();

const numbers = wasmEngine.generateIntegers(10000, 0, 100);
const uuids = wasmEngine.generateUuids(5000);
const cards = wasmEngine.generateLuhn(1000, 16);
```
