// Interactive Terminal Emulator & Zig Build/Test Pipeline Runner

export class TerminalEmulator {
    constructor(panelConsoleId, panelTestsId, panelAsmId, testBadgeId) {
        this.panelConsole = document.getElementById(panelConsoleId);
        this.panelTests = document.getElementById(panelTestsId);
        this.panelAsm = document.getElementById(panelAsmId);
        this.testBadge = document.getElementById(testBadgeId);

        this.activeTab = 'console'; // 'console' | 'tests' | 'asm'
        this.isBuilding = false;

        this.initWelcomeMessage();
    }

    initWelcomeMessage() {
        if (!this.panelConsole) return;
        this.panelConsole.innerHTML = `
            <div class="text-slate-500">[Zig Studio v2026.1] ZLS (Zig Language Server 0.13.0) online via async JSON-RPC.</div>
            <div class="text-slate-500">Target Toolchain: <span class="text-amber-400 font-semibold">zig-0.13.0+x86_64-linux-gnu</span></div>
            <div class="text-slate-400 mt-1"><span class="text-[#f7a41d] font-bold">$</span> Ready. Click <span class="text-white font-semibold">'zig build run'</span> or <span class="text-white font-semibold">'zig test'</span> to execute.</div>
        `;
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        ['console', 'tests', 'asm'].forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const panel = document.getElementById(`panel-${t}`);
            if (btn) {
                if (t === tab) {
                    btn.className = "text-white border-b-2 border-[#f7a41d] pb-0.5 font-semibold transition";
                } else {
                    btn.className = "text-slate-400 hover:text-slate-200 pb-0.5 transition";
                }
            }
            if (panel) {
                if (t === tab) panel.classList.remove('hidden');
                else panel.classList.add('hidden');
            }
        });
    }

    clear() {
        if (this.activeTab === 'console' && this.panelConsole) {
            this.panelConsole.innerHTML = `<div class="text-slate-500">[Build Output buffer cleared] Ready.</div>`;
        } else if (this.activeTab === 'tests' && this.panelTests) {
            this.panelTests.innerHTML = `<div class="text-slate-500">Test history flushed. Click 'zig test' to run checks.</div>`;
        }
    }

    async runBuild(buildModeConfig, hasLeak = false) {
        if (this.isBuilding) return;
        this.isBuilding = true;
        this.switchTab('console');

        const optFlag = buildModeConfig.mode === 'Debug' ? '' : ` -Doptimize=${buildModeConfig.mode}`;
        const cmd = `zig build run${optFlag} --summary all`;

        this.appendConsole(`<div class="mt-2 pt-2 border-t border-[#242936] text-slate-300 font-bold"><span class="text-[#f7a41d]">$</span> ${cmd}</div>`);

        // Phase 1: Semantic Analysis & Comptime Pass
        await this.sleep(250);
        this.appendConsole(`<div class="text-slate-400 pl-3">↳ [1/4] <span class="text-cyan-400">Semantic Analysis</span>: Inlined 4 @comptime generic paths with 0-cost</div>`);

        // Phase 2: C ABI Invariant Check
        await this.sleep(250);
        this.appendConsole(`<div class="text-slate-400 pl-3">↳ [2/4] <span class="text-amber-400">C ABI Validation</span>: SockAddrIn layout verified against POSIX header (16B)</div>`);

        // Phase 3: Monomorphization & Codegen
        await this.sleep(300);
        this.appendConsole(`<div class="text-slate-400 pl-3">↳ [3/4] <span class="text-emerald-400">Code Emission</span>: Emitted native binary <span class="text-white font-mono">zig_studio_app</span> (${buildModeConfig.binarySize})</div>`);

        // Phase 4: Execution Output
        await this.sleep(350);
        this.appendConsole(`<div class="text-green-400 font-bold mt-2">✔ Build succeeded in ${(Math.random() * 0.08 + 0.04).toFixed(3)}s. Process stdout attached:</div>`);

        if (hasLeak) {
            // Simulated GPA Memory Leak output!
            this.appendConsole(`
                <div class="bg-red-950/40 border border-red-500/50 p-3 rounded font-mono text-red-200 mt-2 text-xs">
                    <div class="text-red-400 font-bold flex items-center space-x-1">
                        <span>❌ CRITICAL: GeneralPurposeAllocator Memory Leak Detected!</span>
                    </div>
                    <div class="text-slate-300 mt-1 pl-2 border-l border-red-500/40 text-[11px]">
                        [gpa] error: memory leak: 0x7FFF0030..0x7FFF0070 (64 bytes)<br/>
                        &nbsp;&nbsp;allocated at: src/tracker.zig:28:34 in initMatrix<br/>
                        &nbsp;&nbsp;called from: src/main.zig:20:19 in main<br/>
                        &nbsp;&nbsp;allocation count: 4 un-freed child slices<br/>
                        <span class="text-amber-300">hint: did you forget \`defer tracker.freeMatrix(allocator, matrix)\`?</span>
                    </div>
                </div>
            `);
        } else {
            this.appendConsole(`
                <div class="bg-black/50 border border-[#242936] p-2.5 rounded font-mono text-slate-200 mt-1.5 space-y-0.5 text-xs">
                    <div class="text-cyan-300">== Zig Studio v2026.1 Runtime Initialized ==</div>
                    <div class="text-slate-300">Allocated 4x4 matrix on explicit GPA heap (64 bytes).</div>
                    <div class="text-slate-300">Bound non-blocking socket (fd=3) via zero-cost C ABI.</div>
                    <div class="text-emerald-400">Pipeline executed with zero leaks and optimal memory layout.</div>
                </div>
            `);
        }

        this.scrollToBottom(this.panelConsole);
        this.isBuilding = false;
    }

    async runTests(buildModeConfig) {
        this.switchTab('tests');
        if (!this.panelTests) return;

        this.panelTests.innerHTML = `
            <div class="text-yellow-400 font-medium animate-pulse flex items-center space-x-2">
                <span class="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                <span>Executing test runner: zig test src/main.zig...</span>
            </div>
        `;

        await this.sleep(400);

        const testResults = [
            { file: "src/main.zig", name: "comptime matrix shape validator", time: "0.02ms", passed: true, note: "Comptime constant evaluation" },
            { file: "src/main.zig", name: "comptime generic matrix alignment", time: "0.01ms", passed: true, note: "AVX 16-byte alignment check" },
            { file: "src/fast_c.zig", name: "struct alignment and size invariants", time: "0.01ms", passed: true, note: "POSIX C ABI 16B zero-cost layout" },
            { file: "src/tracker.zig", name: "identity matrix generation", time: "0.04ms", passed: true, note: "Zero heap allocation verified" }
        ];

        let html = `
            <div class="flex items-center justify-between pb-2 border-b border-[#242936] mb-3">
                <span class="text-green-400 font-bold text-xs">All ${testResults.length} test suites passed cleanly</span>
                <span class="text-slate-400 text-[11px] font-mono">Total test time: 0.08ms</span>
            </div>
            <div class="space-y-2">
        `;

        testResults.forEach(t => {
            html += `
                <div class="bg-[#12151c] p-2.5 rounded border border-[#242936] flex items-center justify-between font-mono text-xs">
                    <div class="space-y-0.5">
                        <div class="flex items-center space-x-2">
                            <span class="text-green-400 font-bold">✓</span>
                            <span class="text-slate-200">[${t.file}]</span>
                            <span class="text-[#f7a41d]">"${t.name}"</span>
                        </div>
                        <div class="text-[10px] text-slate-500 pl-4">${t.note}</div>
                    </div>
                    <span class="text-green-400 font-medium text-[11px] bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">${t.time}</span>
                </div>
            `;
        });

        html += `
            </div>
            <div class="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Vector extensions: AVX2 / FMA native execution</span>
                <span class="text-emerald-400 font-semibold font-mono">Memory Leaks: 0</span>
            </div>
        `;

        this.panelTests.innerHTML = html;
        if (this.testBadge) {
            this.testBadge.innerText = `${testResults.length} OK`;
        }
    }

    updateAsm(asmSnippet, modeName) {
        if (!this.panelAsm) return;
        this.panelAsm.innerHTML = `
            <div class="flex items-center justify-between pb-1.5 border-b border-[#242936] mb-2 text-xs font-mono">
                <span class="text-[#f7a41d]">Emitted Machine Assembly (${modeName})</span>
                <span class="text-slate-500 text-[11px]">x86_64-linux-gnu / Intel Syntax</span>
            </div>
            <pre class="text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre selection:bg-[#f7a41d]/30">${this.escapeHtml(asmSnippet)}</pre>
        `;
    }

    appendConsole(html) {
        if (!this.panelConsole) return;
        this.panelConsole.innerHTML += html;
    }

    scrollToBottom(elem) {
        if (elem) elem.scrollTop = elem.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.innerText = text;
        return div.innerHTML;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
