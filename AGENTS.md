# AGENTS.md — Zig Studio Agent Operational Specification ⚡

> **Notice for AI Coding Agents & LLM Pairs**: This document defines the engineering standards, architectural invariants, code conventions, and execution workflows for any autonomous agent (Antigravity, Devin, Claude Code, Cursor, Copilot Workspace, etc.) operating on the `zig-studio` codebase.

---

## 1. Project Overview & Philosophy

**Zig Studio** is an open-source, bespoke web and desktop Integrated Development Environment engineered specifically for the [Zig Programming Language](https://ziglang.org) and systems developers building extreme-performance software (such as Jarred Sumner's [Bun](https://bun.sh)).

### Authors & Core Contributors
* **Devin Damon Shinkle**
* **VEFAorg**
* **Antigravity (Google DeepMind)**

### Core Tenets
1. **Mechanical Sympathy**: Never hide memory allocations, garbage collection cycles, or compiler stages. If Zig makes something explicit, the IDE must make it visible.
2. **Zero Overhead & Minimal Dependencies**: Keep the frontend lean (HTML5, CSS3, ES6, Monaco Editor CDN). Keep backend bridges zero-dependency (native Node.js `http` and `crypto` with no bloated npm trees).
3. **Radical Transparency**: Visualizers (Heap Inspector, Comptime Evaluator, std.Build DAG, ZIR Explorer) must reflect real compiler and runtime semantics.

---

## 2. Architecture & File Layout

```
├── index.html                  # Core single-page IDE client (Monaco multi-model, DOM splitters, visualizers)
├── zls_bridge.js               # Zero-dependency RFC 6455 WebSocket-to-ZLS JSON-RPC daemon
├── package.json                # Project manifest & execution scripts
├── README.md                   # Comprehensive project documentation & motivation
├── Roadmap_to_v1.md            # Version milestones from v0.2 to v1.0 Bun-tier production
├── jarred_sumner_skill.md      # Systems engineering guide on zero-cost C ABI & async event loops
├── LICENSE                     # MIT License (Devin Damon Shinkle, VEFAorg, Antigravity)
├── AGENTS.md                   # This specification file
├── .github/
│   ├── workflows/deploy.yml    # GitHub Pages automated deployment pipeline
│   └── ISSUE_TEMPLATE/         # GitHub issue templates for bug reports and RFCs
├── src/                        # Modular JavaScript visualizer components
│   ├── workspace/files.js      # Virtual in-memory file system (main.zig, tracker.zig, etc.)
│   ├── editor/                 # Monaco Monarch tokenizer & comptime hover cards
│   ├── allocator/              # GPA heap tracer & canary guard profiler
│   ├── cross_target/           # Multi-target compilation matrix
│   ├── build_graph/            # std.Build DAG dependency renderer
│   ├── zon/package_tree.js     # build.zig.zon manifest inspector
│   ├── compiler_explorer/      # ZIR and machine assembly viewer
│   └── lsp/zls_bridge.js       # JSON-RPC dispatcher
└── archive/                    # Historical snapshots and early prototypes (DO NOT MODIFY)
```

---

## 3. Agent Operating Rules & Invariants

When modifying or expanding `zig-studio`, agents **MUST** respect the following rules:

### A. Zig Language Semantics
* **Allocators are Values**: Zig never allocates memory behind the developer's back. Always reflect `std.mem.Allocator` passing. Any simulated or real code samples must clean up memory (`defer allocator.free(...)` or `defer arena.deinit()`).
* **No Hidden Control Flow**: Zig does not have operator overloading or hidden runtime exceptions. All error states must be modeled as error sets (`!T`) or explicit diagnostics.
* **Comptime Invariants**: Comptime evaluation runs during compilation. Comptime types (e.g. `type`, `anytype`) do not exist at runtime. Diagnostics must separate compile-time monomorphization from runtime execution.
* **Zero-Cost C ABI**: C interop uses `extern struct` with strict C-compatible alignment and zero wrapping overhead.

### B. Frontend / Monaco Editor Invariants
* **Multi-Model Preservation**: Never call `editor.setValue()` when switching active files! Always create individual `monaco.editor.createModel()` instances for each file and swap them via `editor.setModel(targetModel)`. This preserves cursor position, scroll offset, and the undo/redo history stack.
* **Layout Thrashing Prevention**: After adjusting panel dimensions via splitters or collapsing sidebars, always trigger debounced `editor.layout()` calls.
* **Marker Management**: When reporting diagnostic errors (e.g. GPA memory leaks or syntax errors), use `monaco.editor.setModelMarkers(model, 'zls', markers)` with valid 1-indexed line and column numbers.

### C. ZLS Bridge & Protocol Streaming
* The bridge daemon (`zls_bridge.js`) implements RFC 6455 WebSockets and JSON-RPC 2.0 without third-party npm packages.
* Message framing over stdio to a real `zls` process must format headers as:
  ```
  Content-Length: <byte_length>\r\n\r\n<json_payload>
  ```
* The frontend client must maintain reconnection backoff if `ws://localhost:9999` is unreachable and gracefully fall back to the built-in browser comptime engine.

---

## 4. Development & Verification Commands

Autonomous agents should verify changes using the following local commands:

```bash
# Start local ZLS WebSocket bridge server
npm start
# or: node zls_bridge.js

# Test ZLS bridge packet verification
npm test
# or: node zls_bridge.js --test

# Serve the static IDE for browser inspection
npx serve . -l 3000
```

### Automated Code Quality Checks
Before committing or proposing changes:
1. Validate JSON syntax for `package.json` and `.github/` workflows.
2. Validate JavaScript syntax with Node:
   ```bash
   node -c zls_bridge.js
   ```
3. Ensure no console errors occur on clean initialization of `index.html`.

---

## 5. Guidelines for Proposing Upgrades

When adding new features:
1. **Reference the Roadmap**: Check [Roadmap_to_v1.md](Roadmap_to_v1.md) to confirm feature alignment (v0.3 UI upgrades, v0.4 alpha sandbox, v0.7 beta WASM engine, v1.0 production).
2. **Preserve Backward Compatibility**: Never break direct browser loading of `index.html` (zero-install offline accessibility must always work).
3. **Maintain Authorship**: Always retain the three credited entities: **Devin Damon Shinkle**, **VEFAorg**, and **Antigravity (Google DeepMind)**.
