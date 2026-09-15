# Zig Studio ⚡
### The Bespoke Web & Desktop IDE for the Zig Programming Language & Toolchain

[![Zig Version](https://img.shields.io/badge/Zig-0.13.0%20%7C%200.14.0--dev-F7A41D?logo=zig&logoColor=black)](https://ziglang.org)
[![ZLS Protocol](https://img.shields.io/badge/ZLS-JSON--RPC%202.0-4EA8DE?logo=json)](https://github.com/zigtools/zls)
[![License: MIT](https://img.shields.io/badge/License-MIT-06D6A0.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Version-v0.2-FF7096)](Roadmap_to_v1.md)

> *"Zig does not have an official IDE. Systems developers building next-generation infrastructure like Bun are forced to adapt generic text editors using standard LSP plugins that have no concept of explicit allocators, compile-time evaluation, or zero-cost C ABI invariants. Zig Studio exists to fill that vacuum."*

---

## 👥 Authors & Core Contributors
* **Devin Damon Shinkle**
* **VEFAorg**
* **Antigravity (Google DeepMind)**

---

## 🚀 Key Features

### 1. 🔍 Explicit Memory Allocation Visualizer (Heap Inspector Tracer)
Unlike garbage-collected languages, Zig mandates explicit allocators passed as interfaces (`std.mem.Allocator`).
* **32-Cell Interactive Heap Grid**: Models `GeneralPurposeAllocator` (GPA), `ArenaAllocator`, `FixedBufferAllocator`, and kernel `page_allocator`.
* **Live GPA Leak Detection**: Simulates un-freed slices on `.deinit()`, flashes pulsing leak indicators, and injects real Monaco diagnostic error squigglies directly onto offending code lines.
* **Canary Guard Sandbox**: Interactive buffer-overrun simulator demonstrating how GPA guard canaries (`0xAA`) trigger abort panics with hex memory dumps.
* **Allocation Timeline**: Rolling real-time canvas tracking byte allocation volume over time.

### 2. ⚡ Comptime Monomorphization & Inline Reflection
Zig replaces macros and C++ templates with zero-overhead `@comptime` evaluation.
* **In-Editor Comptime Hover Provider**: Hovering generic structs (`Matrix(4, 4, f32)`) or builtins (`@sizeOf`, `@alignOf`, `@memset`) displays floating diagnostics detailing pre-computed shapes, vector registers, and zero-cost proofs.
* **Live AST Inspector**: Reactive syntax tree parsing for the active compilation unit.

### 3. 🌐 First-Class Cross-Compilation Target Triple Explorer (`-Dtarget=...`)
Zig's signature superpower is cross-compiling out-of-the-box with no foreign toolchains.
* Instant switching between target triples:
  * `x86_64-linux-gnu` (GNU libc 64-bit)
  * `x86_64-windows-gnu` (MinGW / PE/COFF without MSVC tools)
  * `aarch64-macos.none` (Apple Silicon Mach-O binary)
  * `riscv64-linux-musl` (Lean static embedded Linux)
  * `wasm32-freestanding` (Freestanding WebAssembly linear memory)
* Real-time invariant updates: tracking pointer widths (64-bit vs 32-bit), binary footprints down to **22 KB** (`ReleaseSmall`), and CPU feature flags (`avx2`, `neon`).

### 4. 🌳 Interactive `std.Build` Step DAG Visualizer
* Visualizes the Directed Acyclic Graph compiled from `build.zig` (`exe` ➔ `install` ➔ `run`, `tests` ➔ `step`).
* Click any node to inspect build options, optimization flags, and downstream dependencies.

### 5. 📦 Package Manager Explorer (`build.zig.zon`)
* Inspects Zig Object Notation (ZON) dependencies with immutable `1220...` SHA-256 multihashes.
* Interactive **+ Add Package** drawer injecting live dependencies directly into the Monaco editor model.

### 6. 🔬 Side-by-Side Compiler Explorer (ZIR & Assembly)
* Two-column split view displaying:
  * **ZIR (Zig Intermediate Representation)**: The compiler's semantic representation before machine codegen.
  * **Machine Assembly**: Target-specific instructions reflecting `Debug`, `ReleaseSafe`, `ReleaseFast`, and `ReleaseSmall`.

### 7. 🔗 Dual-Mode ZLS Language Server Protocol Bridge
* **In-Browser Comptime VM**: Instant AST tokenization and hover reflections with zero setup.
* **Native WebSocket Daemon (`ws://localhost:9999`)**: Real bi-directional JSON-RPC 2.0 streaming to a local `zls` daemon via the bundled zero-dependency bridge server (`zls_bridge.js`).

### 8. 📐 Fluid Draggable Splitters & Panel Resizing
* Fluid, multi-directional resize splitters for the left sidebar, right inspector, and bottom terminal.
* 1-click collapse/expand toggles (`◧ Side`, `⬒ Term`, `◨ Tools`) and terminal maximize (`⤢ Max`).
* Zero DOM layout thrashing powered by Monaco's automatic reflow engine.

---

## 🛠️ Quick Start

### Option A: Direct Browser Preview (Zero Installation)
Simply open `index.html` in any modern web browser (Brave, Chrome, Edge, Firefox):
```bash
# On Windows
start index.html

# Or with any local HTTP server
npx serve .
```

### Option B: Running with Native ZLS WebSocket Bridge
Launch the included zero-dependency bridge server to connect Zig Studio to a live JSON-RPC daemon:
```bash
node zls_bridge.js
```
Then open `index.html`, click the **ZLS status button** in the top right, and select **Native WebSocket Daemon**.

---

## 📂 Project Structure

```
├── index.html                  # Flagship Zig Studio IDE Client
├── zls_bridge.js               # Zero-dependency local ZLS WebSocket bridge daemon
├── jarred_sumner_skill.md      # Zero-cost C ABI interop engineering guide (Bun style)
├── Roadmap_to_v1.md            # Comprehensive engineering plan for v1.0 production MVP
├── package.json                # Project metadata & npm runner scripts
├── LICENSE                     # MIT License
├── src/
│   ├── workspace/files.js      # Virtual file system (main, tracker, fast_c, build, zon)
│   ├── editor/
│   │   ├── zig_grammar.js      # Monaco Monarch tokenizer & Zig Studio Dark theme
│   │   └── comptime_provider.js# Comptime hover cards & reflection engine
│   ├── allocator/
│   │   ├── heap_tracer.js      # 32-cell heap inspector visualizer
│   │   └── memory_profiler.js  # Dynamic allocation timeline & canary sandbox
│   ├── cross_target/
│   │   └── target_matrix.js    # Multi-architecture target triples
│   ├── build_graph/
│   │   └── dag_renderer.js     # std.Build DAG dependency renderer
│   ├── zon/package_tree.js     # build.zig.zon dependency manager
│   ├── compiler_explorer/
│   │   └── zir_viewer.js       # ZIR & Assembly side-by-side explorer
│   └── lsp/zls_bridge.js       # Dual-mode JSON-RPC bridge dispatcher
```

---

## 🗺️ Roadmap to v1.0
Detailed technical specifications, Bun benchmark suites, and distribution plans (Desktop Native via WebKit vs Cloud Sandboxing) are documented in **[Roadmap_to_v1.md](Roadmap_to_v1.md)**.

---

## 📄 License
Released under the **MIT License**. Copyright (c) 2026 Devin Damon Shinkle, VEFAorg, and Antigravity (Google DeepMind).
