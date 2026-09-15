# Zig Studio ⚡
### The Bespoke Web & Desktop IDE for the Zig Programming Language & Toolchain

[![Zig Version](https://img.shields.io/badge/Zig-0.13.0%20%7C%200.14.0--dev-F7A41D?logo=zig&logoColor=black)](https://ziglang.org)
[![ZLS Protocol](https://img.shields.io/badge/ZLS-JSON--RPC%202.0-4EA8DE?logo=json)](https://github.com/zigtools/zls)
[![Agents Ready](https://img.shields.io/badge/Agents-AGENTS.md-9B5DE5)](AGENTS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-06D6A0.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Version-v0.3.0-FF7096)](Roadmap_to_v1.md)

> *"Zig does not have an official IDE. Systems developers building next-generation infrastructure like Bun are forced to adapt generic text editors using standard LSP plugins that have no concept of explicit allocators, compile-time evaluation, or zero-cost C ABI invariants. Zig Studio exists to give Zig the dedicated, mechanical-sympathy development environment it deserves."*

---

## 👥 Authors & Core Contributors
* **Devin Damon Shinkle**
* **VEFAorg**
* **Antigravity (Google DeepMind)**

---

## 🌟 What's New in v0.3.0: The Systems Upgrade (vs. v0.2.0)

Version **0.3.0** elevates Zig Studio from a single-buffer proof-of-concept into a full-fledged, multi-pane systems workspace built for extreme developer velocity.

### Architectural & Feature Delta

| Dimension / Capability | **v0.2.0 (Baseline Prototype)** | **v0.3.0 (Systems Upgrade)** ⚡ |
| :--- | :--- | :--- |
| **Editor Canvas** | Single Monaco editor instance. Viewing `build.zig` meant navigating away from `main.zig`. | **Dual Side-by-Side Split Panes (`Ctrl+\`)**. Independent primary and secondary Monaco instances sharing the in-memory model cache. Edit source and build logic simultaneously with a draggable divider. |
| **Memory Inspection** | High-level 32-cell color blocks. Great for macroscopic status, but blind to raw byte layouts. | **Raw Hex Memory Dump Visualizer (`Alt+H`)**. 16-byte aligned memory inspector with 64-bit addresses (`0x7FFF0010`), byte columns, printable ASCII sidebar, and live red `0xDEADBEEF` canary alerts. |
| **Developer Navigation** | Manual mouse clicks required to open files, toggle sidebars, and run builds. | **Fuzzy Command Palette (`Ctrl+P` / `Ctrl+Shift+P`)**. Keyboard-first fuzzy search across workspace files and 1-click execution of targets, allocators, views, and simulations. |
| **Lexical Awareness** | Static tab titles and flat line numbers. | **Sticky AST Breadcrumbs & Scope Bar**. Real-time scope hierarchy (`📁 src › 📄 main.zig › ⚡ Server › ƒ listen()`) dynamically tracking cursor positions across structs and functions. |
| **Immersion & Focus** | Fixed sidebars and toolbars crowding smaller displays. | **Distraction-Free Zen Mode (`Alt+Z`)**. 1-key toggle collapsing all chrome into an edge-to-edge full-screen code canvas with a floating exit pill. |
| **OSS Repository Governance** | Basic `package.json` and prototype layout. | **Complete OSS Suite**. First-class AI agent specification ([`AGENTS.md`](AGENTS.md)), posterity assessment ([`CRITIQUE_AND_MODERNIZATION_REPORT.md`](CRITIQUE_AND_MODERNIZATION_REPORT.md)), [`CONTRIBUTING.md`](CONTRIBUTING.md), GitHub Issue Templates, and CI test pipeline. |

---

## 💡 The Motivation: Why Zig Studio?

### 1. The Bun Phenomenon & Jarred Sumner's Bet
When Jarred Sumner set out to create **[Bun](https://bun.sh)**—the ultra-fast all-in-one JavaScript runtime that redefined web development performance—he did not choose C++, Go, or Rust. He bet everything on **Zig**.

Why? Because Zig possesses a unique combination of structural superpowers found nowhere else:
* **Zero-Cost C ABI Interoperability**: Zig can directly import and call C libraries, POSIX kernel syscalls, Linux `epoll` / `io_uring`, and macOS `kqueue` without wrapper glue, FFI overhead, or runtime marshaling.
* **Explicit Allocator Architecture**: Memory allocations never occur invisibly. Slices, buffers, and string allocations explicitly accept a `std.mem.Allocator`. This allowed Bun to integrate `mimalloc` and arena allocators directly into hot request paths, eliminating garbage collection pauses and malloc lock contention.
* **Compile-Time Metaprogramming (`@comptime`)**: Instead of relying on brittle macro preprocessors or heavy C++ template instantiation, Zig evaluates standard imperative code during compilation to generate types, unroll SIMD loops, and guarantee safety invariants with zero runtime penalty.
* **Hermetic Cross-Compilation**: Out of the box, a single Zig compiler binary can target Linux, macOS, Windows, RISC-V, and WebAssembly without external sysroots or GCC/MSVC toolchains.

Today, Zig powers world-class infrastructure: **Bun**, **TigerBeetle DB** (financial transactions at wire speed), **Ghostty** (Mitchell Hashimoto's fast terminal), and the **Mach engine**.

---

### 2. The Paradox: The Missing Official IDE
Despite powering some of the most critical and performant software on Earth, **Zig has never had an official IDE**.

Andrew Kelley architected Zig with radical principles:
1. **No Hidden Control Flow**: No operator overloading, no hidden method dispatch, no exceptions.
2. **No Hidden Memory Allocation**: If a function doesn't take an allocator, it cannot allocate heap memory.
3. **Mechanical Sympathy**: Code should reflect the actual execution mechanics of the CPU, the caches, and the operating system.

Yet developers writing Zig are forced to use generic code editors:
* **VS Code** with ZLS
* **JetBrains / CLion** with generic C/Rust plugins
* **Zed** or **Sublime Text**

---

### 3. The Failure of General-Purpose Editors
General-purpose editors treat source code as an arbitrary stream of characters with syntax highlighting and standard LSP code completion. For Zig, this mental model is fundamentally broken:

| Architectural Dimension | Generic IDE (VS Code / JetBrains / Zed) | **Zig Studio** ⚡ |
| :--- | :--- | :--- |
| **Heap Memory Allocation** | **Invisible**. Allocation occurs silently behind the scenes. No insight into allocators. | **Live Heap Inspector Grid**. Real-time visualization of `GeneralPurposeAllocator`, `ArenaAllocator`, and `FixedBufferAllocator`. Live leak squigglies and canary guard overflow alerts. |
| **`@comptime` Evaluation** | **Opaque**. Treated as ordinary syntax; monomorphized types and dead branches are hidden. | **Inline Comptime Reflection**. Interactive hover cards displaying precomputed type layouts, vector registers, and zero-overhead branch elimination. |
| **Build System (`build.zig`)** | **Black Box**. Relies on typing `zig build` into a terminal. Errors are raw text dumps. | **Interactive `std.Build` Step DAG**. Visual dependency graph mapping compilation steps, test suites, and build artifact pipelines. |
| **Package Manifest (`build.zig.zon`)** | **Raw Text**. Manual editing of ZON hashes and URLs with zero validation. | **Live ZON Package Manager Drawer**. Visual dependency tree with cryptographic SHA-256 multihash verification and in-editor injection. |
| **Cross-Compilation (`-Dtarget=...`)** | **Hidden Flags**. Manually typed terminal flags (`-Dtarget=x86_64-windows`). | **Target Triple Explorer Matrix**. 1-click switching across OS/CPU triples (`x86_64`, `aarch64`, `wasm32`) showing real-time binary size, alignment, and pointer widths. |
| **Compiler Stages (ZIR & Assembly)** | **External Tool Required**. Developers must leave the IDE to visit Godbolt Compiler Explorer. | **Integrated Side-by-Side Explorer**. Real-time mapping between Zig source, Zig Intermediate Representation (ZIR), and target Machine Assembly. |

---

### 4. The Mission: An IDE to Make Andrew Kelley Blush
**Zig Studio** was built to bridge this chasm. By rejecting generic editor paradigms and crafting bespoke visual tools mapped directly to Zig's compiler pipeline and memory model, Zig Studio equips developers to build Bun-caliber systems software with total clarity, mechanical sympathy, and zero friction.

---

## 🚀 Key Features

### 1. 🔍 Explicit Memory Allocation Visualizer (Heap Inspector)
* **32-Cell Interactive Heap Grid**: Real-time visualization of `GeneralPurposeAllocator` (GPA), `ArenaAllocator`, `FixedBufferAllocator`, and `page_allocator`.
* **Live GPA Leak Detection**: Simulates un-freed heap blocks on `.deinit()`, flashes pulsating red leak alerts, and injects real Monaco diagnostic squigglies directly onto the offending lines of code.
* **Canary Guard Sandbox**: Interactive buffer-overrun simulator demonstrating how GPA guard canaries (`0xAA`) catch write-past-end errors with hex memory dumps.
* **Allocation Timeline**: Rolling real-time canvas tracking byte allocation volume over time.

### 2. ⚡ Comptime Monomorphization & Inline Reflection
* **In-Editor Comptime Hover Cards**: Hover generic structs (`Matrix(4, 4, f32)`) or builtins (`@sizeOf`, `@alignOf`, `@typeInfo`) to view floating diagnostics detailing precomputed memory layouts, register targets, and zero-cost proofs.
* **AST Inspector**: Reactive syntax tree parsing for the active compilation unit.

### 3. 🌐 First-Class Cross-Compilation Target Triple Explorer
* Instant target triple switching:
  * `x86_64-linux-gnu` (GNU libc 64-bit)
  * `x86_64-windows-gnu` (PE/COFF without MSVC tools)
  * `aarch64-macos.none` (Apple Silicon Mach-O binary)
  * `riscv64-linux-musl` (Lean static embedded Linux)
  * `wasm32-freestanding` (Freestanding WebAssembly linear memory)
* Real-time invariant updates: tracking pointer widths (64-bit vs 32-bit), binary footprints down to **22 KB** (`ReleaseSmall`), and CPU feature flags (`avx2`, `neon`).

### 4. 🌳 Interactive `std.Build` Step DAG Visualizer
* Visualizes the Directed Acyclic Graph compiled from `build.zig` (`exe` ➔ `install` ➔ `run`, `tests` ➔ `step`).
* Click any node in the SVG graph to inspect build options, optimization flags, and downstream dependencies.

### 5. 📦 Package Manager Manifest Sync (`build.zig.zon`)
* Inspects Zig Object Notation (ZON) dependencies with immutable `1220...` SHA-256 multihashes.
* Interactive **+ Add Package** drawer injecting live dependencies directly into the Monaco editor model.

### 6. 🔬 Side-by-Side Compiler Explorer (ZIR & Assembly)
* Two-column split view displaying:
  * **ZIR (Zig Intermediate Representation)**: The compiler's typed semantic representation prior to LLVM/machine codegen.
  * **Machine Assembly**: Target-specific instructions reflecting `Debug`, `ReleaseSafe`, `ReleaseFast`, and `ReleaseSmall`.

### 7. 🔗 Dual-Mode ZLS Language Server Protocol Bridge
* **In-Browser Comptime VM**: Instant AST tokenization, diagnostics, and hover reflections with zero setup.
* **Native WebSocket Bridge (`ws://localhost:9999`)**: Real bi-directional JSON-RPC 2.0 streaming to a local `zls` daemon via the bundled zero-dependency bridge server (`zls_bridge.js`).

### 8. ◫ Split Editor Panes (Side-by-Side Multi-Model)
* Side-by-side dual Monaco editor panes enabling simultaneous editing of source files (e.g. `main.zig` alongside `build.zig` or `tracker.zig`).
* Shared underlying model repository with independent scroll offsets, cursor positions, and separate tab switchers.
* Draggable vertical divider splitter for fluid real-time pane proportion resizing.

### 9. 🔬 Raw Hex Memory Dump Visualizer
* 16-byte aligned memory inspector displaying byte addresses (`0x7FFF0010`), hexadecimal bytes, and printable ASCII decode.
* Dynamic color coding: Orange (GPA headers), Cyan (User payloads), Pink (Guard canaries `0xAA`), Flashing Red (Corrupted memory `0xDEADBEEF`), and Dimmed Gray (Free memory `0x00`).
* Real-time sync with buffer overrun tests and GPA memory leak simulations.

### 10. ⌘ Fuzzy Quick Open & Command Palette (`Ctrl+P` / `Ctrl+Shift+P`)
* High-velocity keyboard workflow matching VS Code muscle memory.
* File Picker mode (`Ctrl+P`): Instant fuzzy search across workspace files.
* Action Command mode (`Ctrl+Shift+P`): 1-click execution of target triple switching, allocator changing, simulation runs, and panel toggles.

### 11. 🌲 Sticky AST Breadcrumbs & Scope Bar
* Real-time lexical scope tracking: `📁 src › 📄 main.zig › ⚡ Server › ƒ listen()`.
* Automatically updates based on Monaco editor cursor position with direct symbol navigation.

### 12. 🧘 Distraction-Free Zen Mode (`Alt+Z`)
* 1-click collapse of sidebars, toolbars, and terminals into an edge-to-edge full-screen code canvas with a floating restore button.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl+P` | **Quick Open Files** | Fuzzy search and switch between workspace files |
| `Ctrl+Shift+P` | **Command Palette** | Execute IDE commands, target switches, and allocators |
| `Ctrl+\` | **Toggle Split Editor** | Open or close side-by-side dual Monaco editor panes |
| `Ctrl+1` | **Focus Primary Pane** | Switch keyboard focus to Pane 1 (Left) |
| `Ctrl+2` | **Focus Secondary Pane**| Switch keyboard focus to Pane 2 (Right) |
| `Alt+Z` | **Toggle Zen Mode** | Expand editor to edge-to-edge distraction-free view |
| `Alt+H` | **Toggle Hex Memory Dump**| Switch Heap Inspector between 32-cell grid and raw hex dump |
| `Ctrl+B` | **Toggle Left Sidebar** | Collapse or restore file tree and target options |
| `Escape` | **Close Overlays** | Dismiss command palette or exit Zen mode |
| `F5` / `F6` | **Run / Test** | Execute `zig build run` or `zig test` pipelines |

---

## 🛠️ Quick Start

### Option A: Instant Web Preview (Zero Installation)
Simply open `index.html` in any modern web browser (Brave, Chrome, Edge, Firefox):
```bash
# On Windows
start index.html

# Or with any local HTTP server
npx serve .
```

### Option B: Local Development with ZLS WebSocket Bridge
Launch the included zero-dependency bridge daemon to connect Zig Studio to your local `zls` installation:
```bash
# 1. Start the bridge daemon (RFC 6455 WebSocket <-> ZLS JSON-RPC)
npm start

# 2. Serve the IDE client
npm run serve
```
Then open `index.html`, click the **ZLS status badge** in the header, and select **Native WebSocket Daemon**.

---

## 🤖 AI Agents & LLM Integration (`AGENTS.md`)

Zig Studio provides first-class support for autonomous coding agents and LLM pair programming tools.

Review **[AGENTS.md](AGENTS.md)** for our complete agent operational specification:
* Strict architectural invariants (no hidden allocations, explicit `std.mem.Allocator`, error sets).
* Monaco editor multi-model lifecycle rules.
* Zero-dependency bridge standards and automated verification commands (`npm test`, `node -c zls_bridge.js`).

---

## 📂 Project Structure

```
├── index.html                  # Flagship Zig Studio IDE Client (Monaco, Splitters, Visualizers)
├── zls_bridge.js               # Zero-dependency local ZLS WebSocket bridge daemon
├── package.json                # Project manifest & npm runner scripts
├── README.md                   # Comprehensive project documentation & motivation
├── AGENTS.md                   # AI agent operational specification & guidelines
├── CONTRIBUTING.md             # Community contribution guidelines & code standards
├── Roadmap_to_v1.md            # Comprehensive engineering plan from v0.2 to v1.0
├── jarred_sumner_skill.md      # Zero-cost C ABI interop engineering guide (Bun style)
├── LICENSE                     # MIT License
├── .github/
│   ├── workflows/deploy.yml    # GitHub Pages automated deployment pipeline
│   └── ISSUE_TEMPLATE/         # GitHub issue templates for bug reports and RFCs
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
│   ├── compiler_explorer/      # ZIR & Assembly side-by-side explorer
│   └── lsp/zls_bridge.js       # Dual-mode JSON-RPC bridge dispatcher
└── archive/                    # Historical snapshots and prototypes
```

---

## 🗺️ Roadmap to v1.0
Detailed technical milestones, Bun benchmark suites, and distribution architectures (Desktop Native via WebKit vs Ephemeral Sandboxed Containers) are documented in **[Roadmap_to_v1.md](Roadmap_to_v1.md)**:
* **v0.3**: Split editor panes, fuzzy command palette (`Ctrl+P`), raw hex memory dump inspector.
* **v0.4**: Ephemeral micro-VM compilation sandbox & native desktop wrapper.
* **v0.7**: In-browser client-side compilation via WebAssembly (`zig.wasm`).
* **v1.0**: Production Bun-tier daily driver with full ZLS language server parity.

---

## 📄 License
Released under the **MIT License**.

Copyright (c) 2026 **Devin Damon Shinkle**, **VEFAorg**, and **Antigravity (Google DeepMind)**.
