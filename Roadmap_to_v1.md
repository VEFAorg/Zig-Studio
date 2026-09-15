# Roadmap to v1.0: "Zig Studio"
## Engineering a First-Party IDE Worthy of Bun & Zig

> *"Zig does not have an official IDE. Systems developers building next-generation infrastructure like Bun are forced to adapt generic text editors using standard LSP plugins that have no concept of explicit allocators, comptime evaluation, or zero-cost C ABI invariants."*

This roadmap defines the architectural milestones, feature specifications, and compatibility requirements necessary to take **Zig Studio** from an interactive prototype to a production-grade **v1.0 MVP** capable of serving as the primary daily driver for projects on the scale of **Bun**, the **Zig Compiler**, and production high-performance systems.

---

## 1. The Core Philosophy (The North Star)

To earn the respect of Andrew Kelley, Jarred Sumner, and the Zig Software Foundation, Zig Studio v1.0 must embody the same radical principles as the language itself:

1. **Zero Bloat & Blazing Speed**:
   - Cold startup time under **15 milliseconds**.
   - Idle memory footprint under **45 MB RAM** (rejecting 500MB+ Electron container bloat).
   - Zero layout stuttering or DOM thrashing, even on 200,000-line translation units.
2. **Explicit Transparency Over Magic**:
   - No hidden memory allocations. Every heap operation is visible and traceable.
   - No hidden control flow. Comptime branching, macro replacements, and function pointers are clearly visualized.
3. **Cross-Compilation as a First-Class Citizen**:
   - Switching target architectures (`x86_64`, `aarch64`, `riscv64`, `wasm32`) should be as trivial as switching tabs, updating ABI alignments and disassembly live.
4. **Symbiotic C Interop**:
   - Treat C headers and C ABI structures with the same fidelity as native Zig structs.

---

## 2. Release Milestones: Path to v1.0

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      v0.2       │ ──> │      v0.4       │ ──> │      v0.7       │ ──> │      v1.0       │
│ Current Concept │     │ Developer Alpha │     │  Beta / Systems │     │ Production MVP  │
│  - Target Matrix│     │  - Native ZLS   │     │  - Memory Profil│     │  - Desktop Dist │
│  - Mock Engine  │     │  - Real PTY CLI │     │  - Comptime VM  │     │  - Bun Testbed  │
│  - DAG & ZIR    │     │  - File Watcher │     │  - C Struct Map │     │  - Daily Driver │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Milestone 1 (v0.4) — Developer Alpha: Real Toolchain & Native ZLS

*Goal: Make Zig Studio capable of editing, building, and debugging real Zig projects stored on local disk.*

### 1.1 Bi-Directional Native ZLS Engine
- **JSON-RPC 2.0 Streaming**: Complete IPC connection to a locally running `zls` daemon via standard I/O pipes or local domain sockets (`\\.\pipe\zls` on Windows, `/tmp/zls.sock` on Linux/macOS).
- **Semantic Token Engine**: Precise AST-derived syntax coloring (distinguishing `@comptime` variables, primitive types, function pointers, and error unions).
- **Code Intelligence**:
  - `textDocument/definition` (Go-to-Definition across Zig and C header boundaries).
  - `textDocument/references` (Find all references).
  - `textDocument/rename` (Global symbol renaming with cross-file safety).
  - `textDocument/codeAction` (Autofix missing error sets, autofix discarded values `_ = foo;`, and auto-generate missing struct fields).

### 1.2 Interactive PTY Terminal & Task Runner
- Replace simulated terminal logs with a real pseudo-terminal (xterm.js backed by `node-pty` or a native Zig PTY backend).
- Real-time ANSI color escapes, cursor positioning, and raw keyboard interaction.
- Direct execution pipelines for:
  - `zig build` (with full `--summary all` tree parsing).
  - `zig test` (capturing test failure stack traces and linking directly to editor line numbers).
  - `zig run` (interactive console I/O).

### 1.3 Local Filesystem Sync & File Watcher
- Native file tree connected directly to project directories on disk.
- Debounced file-system watcher (`ReadDirectoryChangesW` on Windows / `inotify` on Linux / `kqueue` on macOS) to handle external git checkouts and branch switching cleanly.

---

## Milestone 2 (v0.7) — Systems Engineering Suite: Memory & Comptime

*Goal: Implement the bespoke tooling that no other IDE provides, specifically for explicit allocators and compile-time evaluation.*

### 2.1 The Bun-Grade Allocator Profiler
- **Live Memory Event Hooks**: Connect to `std.heap.GeneralPurposeAllocator` and custom allocators via a lightweight runtime telemetry agent.
- **Allocation Flamegraphs**: Real-time stack trace attribution for every allocated byte.
- **Allocator Fragmentation & Churn Heatmap**: Visualizing virtual page utilization across `GeneralPurposeAllocator`, `ArenaAllocator`, `FixedBufferAllocator`, and `c_allocator`.
- **Zero-Allocation Hot Path Verifier**: Static analysis mode that inspects a designated loop or function and asserts that 0 heap allocations occur during execution.

### 2.2 Comptime Time-Travel Debugger & Monomorphization Tree
- **Comptime Execution Stepper**: Set breakpoints inside `@comptime` expressions and step through the compiler's compile-time interpreter.
- **Monomorphization Tree Inspector**:
  - Visual hierarchy of all generic struct and function instantiations across the codebase (e.g., viewing all instantiated shapes of `ArrayList(T)` or `Matrix(M, N, T)`).
  - Identification of generic template bloat and binary footprint attribution per specialization.

### 2.3 C ABI & Struct Layout Visualizer (The Sumner Engine)
- **Live `@cImport` Expansion**: Instant side-by-side inspection showing exactly what C header files expand to in Zig syntax.
- **Cache-Line & Padding Inspector**:
  - Graphical representation of struct byte alignment, field offsets, and padding holes.
  - False-sharing warnings for multithreaded structs spanning 64-byte cache lines.

---

## Milestone 3 (v0.9) — Production Build Engine & Package Hub

*Goal: Full support for the modern Zig package manager and complex multi-target build graphs.*

### 3.1 Interactive `std.Build` DAG Orchestrator
- Live visual graph editor for `build.zig`.
- Support for complex dependency graphs:
  - C library compilation steps (`addCSourceFiles`).
  - System library linking (`linkSystemLibrary`).
  - Code generation steps (`addRunArtifact` generating Zig code before compilation).
- Single-click build pipeline execution with step-by-step failure highlighting.

### 3.2 Visual `build.zig.zon` Package Hub
- Search and browse packages directly from the Zig community package index.
- Automatic dependency resolution via `zig fetch --save <url>`.
- Multihash integrity verification (`1220...`) with duplicate dependency conflict warnings.

---

## Milestone 4 (v1.0 MVP) — The Daily Driver

*Goal: Production distribution, enterprise sandboxing, and real-world validation on the Bun codebase.*

### 4.1 Delivery Architecture & Distribution Model
To meet different workflow demands, Zig Studio v1.0 will provide two first-class distributions:
1. **Desktop Native (Ultra-Lean)**:
   - Built using a native Zig GUI or ultra-lightweight webview runtime (Tauri v2 / Native Zig + WebKit).
   - Instant startup (<15ms), native OS menu integration, and direct filesystem access with zero sandboxing friction.
2. **Enterprise Cloud & Web IDE**:
   - Sandboxed browser distribution running against ephemeral micro-VM containers (Firecracker or gVisor) with strict cgroups ceilings for secure multi-tenant compilation.

### 4.2 The "Bun Benchmark" Validation Suite
Zig Studio v1.0 must prove its mettle by loading, indexing, and building the real **Bun codebase**:
- Load Bun's entire repository without memory exhaustion or indexing pauses.
- Provide instant hover documentation across Bun's WebKit JavaScriptCore C++ bindings, POSIX syscall wrappers, and Zig standard library routines.
- Accurately trace Bun's custom mimalloc memory allocators and edge-triggered epoll/kqueue event loops.

---

## 3. Detailed Feature Comparison & Gap Analysis

| Feature Area | Current Generic Editors (VS Code / Neovim) | Zig Studio v1.0 Goal |
|---|---|---|
| **Memory Visualizer** | None (Third-party heap profilers only) | **First-class Heap Inspector & Allocator Churn Heatmap** built into the workspace |
| **Comptime Inspection** | Limited to static tooltip text | **Interactive Monomorphization Tree & Comptime Stepper** |
| **Cross-Compilation** | Manual command-line flags (`-Dtarget=...`) | **Interactive Target Triple Selector** with live ABI alignment and binary size tracking |
| **Build System** | Manual inspection of `build.zig` text | **Interactive `std.Build` Step DAG Visualizer** |
| **C ABI Struct Layout** | None (Manual mental math of byte offsets) | **Graphical Cache-Line & Padding Inspector** showing struct bitfields and alignments |
| **Binary Disassembly** | Requires switching to Godbolt / Compiler Explorer | **In-Editor Split ZIR & Machine Assembly Viewer** synchronized to cursor position |
| **Resource Usage** | 500 MB – 1.2 GB RAM (Electron / Extensions) | **< 45 MB RAM (Ultra-lean native architecture)** |

---

## 4. Compatibility & Standards Matrix

| Target Layer | Supported Versions / Specs |
|---|---|
| **Zig Toolchain** | Zig `0.13.0` (Stable), `0.14.0-dev` (Nightly), and future `1.0.0` |
| **Language Server** | ZLS `0.13.0`+ via standard JSON-RPC 2.0 specification |
| **Operating Systems** | Linux (x86_64, aarch64, riscv64), Windows 10/11 (x86_64, aarch64), macOS Sonoma/Sequoia (Apple Silicon, Intel) |
| **Cross-Targets** | All official tier-1 & tier-2 Zig targets, including `wasm32-freestanding` and embedded freestanding targets |
| **C / C++ Toolchain** | Integrated `zig cc` and `zig c++` (Clang-compatible) |
| **Package Format** | Zig Object Notation (`build.zig.zon`) with SHA-256 multihashes |

---

## 5. Summary & Next Immediate Action

The foundation built in **v0.2** establishes the unique design language and proof-of-concept tools (Heap Tracer, Comptime Inspector, Target Matrix, and ZLS Bridge). 

The immediate next priority for **v0.3 / v0.4** is **local filesystem persistence and native ZLS process spawning**, transitioning Zig Studio from an in-browser sandbox into an executable tool that opens real Zig projects directly from the developer's terminal.
