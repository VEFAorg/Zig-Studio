# Contributing to Zig Studio ⚡

Thank you for your interest in contributing to **Zig Studio**! We welcome contributions from systems programmers, toolchain hackers, frontend engineers, and compiler enthusiasts.

---

## 👥 Authors & Governance
Zig Studio was created and is maintained by:
* **Devin Damon Shinkle**
* **VEFAorg**
* **Antigravity (Google DeepMind)**

---

## 🧭 Guiding Philosophy

Zig Studio adheres to the core ethos of the Zig Programming Language as established by Andrew Kelley:
1. **Clarity over Cleverness**: No hidden control flow, no hidden allocations, and no obfuscated abstractions.
2. **Mechanical Sympathy**: Visualizers must reflect genuine compiler and runtime mechanics (GPA leak detection, arena deallocation, comptime evaluation, ZIR/AIR stages).
3. **Zero-Overhead Engineering**: Keep dependencies minimal. Prefer native Web and Node.js APIs over heavy frameworks.

---

## 🛠️ Development Setup

Zig Studio is designed to run with **zero required compilation toolchain** for frontend development:

1. Clone the repository:
   ```bash
   git clone https://github.com/VEFAorg/zig-studio.git
   cd zig-studio
   ```
2. Serve locally:
   ```bash
   npx serve . -l 3000
   ```
3. (Optional) Launch the native ZLS bridge daemon:
   ```bash
   node zls_bridge.js
   ```

---

## 📐 Code Quality & Formatting

* **Zig Code**: All Zig code samples or tests must format cleanly using `zig fmt` and compile without memory leaks under `std.heap.GeneralPurposeAllocator`.
* **JavaScript**: Use modern, clean ES6+ standards. Avoid large third-party runtime dependencies. Keep DOM manipulation performant and prevent layout thrashing.
* **Monaco Editor**: Always preserve multi-model state (`monaco.editor.createModel`) when handling file switches.
* **AI Agent Contributions**: If you are using autonomous AI agents or copilot systems, please review [AGENTS.md](AGENTS.md) for strict architectural invariants.

---

## 📬 Submitting Pull Requests

1. Fork the repo and create a feature branch (`git checkout -b feat/my-enhancement`).
2. Verify all syntax with `node -c zls_bridge.js`.
3. Ensure no console errors occur on clean initialization of `index.html`.
4. Commit your changes with clear, descriptive commit messages.
5. Submit a Pull Request targeting `main`.
