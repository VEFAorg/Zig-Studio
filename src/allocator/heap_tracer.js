// Explicit Memory Allocation Visualizer & Heap Inspector Tracer Grid
// Models Zig's explicit allocators: GeneralPurposeAllocator, ArenaAllocator, FixedBufferAllocator

export class HeapTracer {
    constructor(containerId, legendContainerId, statusBadgeId, onEventCallback) {
        this.container = document.getElementById(containerId);
        this.legendContainer = document.getElementById(legendContainerId);
        this.statusBadge = document.getElementById(statusBadgeId);
        this.onEvent = onEventCallback || (() => {});
        
        this.allocatorType = 'gpa'; // 'gpa' | 'arena' | 'fixed' | 'page'
        this.hasLeak = false;
        this.totalSlots = 32;
        this.blocks = [];
        
        this.initDefaultLayout();
        this.render();
    }

    setAllocator(type) {
        this.allocatorType = type;
        this.hasLeak = false;
        this.initDefaultLayout();
        this.render();
        this.onEvent('allocator_changed', { type });
    }

    initDefaultLayout() {
        this.blocks = [];
        const baseAddr = 0x7FFF0010;

        if (this.allocatorType === 'gpa') {
            // GeneralPurposeAllocator: Canaries + Metadata + User Data + Free Slots
            for (let i = 0; i < this.totalSlots; i++) {
                const addr = (baseAddr + i * 16).toString(16).toUpperCase();
                if (i === 0 || i === 1) {
                    this.blocks.push({ type: 'metadata', label: 'GPA Header', size: '16B', addr, owner: 'gpa.meta' });
                } else if (i >= 2 && i <= 5) {
                    this.blocks.push({ type: 'user', label: 'Matrix Row 0..3', size: '64B', addr, owner: 'tracker.initMatrix' });
                } else if (i >= 6 && i <= 7) {
                    this.blocks.push({ type: 'canary', label: 'Guard Canary', size: '16B', addr, owner: 'gpa.canary' });
                } else if (i >= 8 && i <= 10) {
                    this.blocks.push({ type: 'user', label: 'FastSocket Buff', size: '48B', addr, owner: 'fast_c.init' });
                } else {
                    this.blocks.push({ type: 'free', label: 'Uncommitted', size: '16B', addr, owner: 'heap.free' });
                }
            }
        } else if (this.allocatorType === 'arena') {
            // ArenaAllocator: Monotonic linear sequence, single wholesale teardown
            for (let i = 0; i < this.totalSlots; i++) {
                const addr = (baseAddr + i * 16).toString(16).toUpperCase();
                if (i === 0) {
                    this.blocks.push({ type: 'metadata', label: 'Arena Node Head', size: '16B', addr, owner: 'arena.root' });
                } else if (i >= 1 && i <= 14) {
                    this.blocks.push({ type: 'user', label: `Arena Bump [${i}]`, size: '16B', addr, owner: 'linear_alloc' });
                } else {
                    this.blocks.push({ type: 'free', label: 'Remaining Arena Capacity', size: '16B', addr, owner: 'arena.buffer' });
                }
            }
        } else if (this.allocatorType === 'fixed') {
            // FixedBufferAllocator: Finite stack buffer, deterministic, no dynamic realloc
            for (let i = 0; i < this.totalSlots; i++) {
                const addr = (baseAddr + i * 16).toString(16).toUpperCase();
                if (i < 8) {
                    this.blocks.push({ type: 'user', label: `Fixed Stack Byte [${i * 16}..${(i + 1) * 16}]`, size: '16B', addr, owner: 'stack_buf' });
                } else {
                    this.blocks.push({ type: 'free', label: 'Stack Buffer Free Space', size: '16B', addr, owner: 'stack_buf.free' });
                }
            }
        } else if (this.allocatorType === 'page') {
            // Page allocator: Uniform 4KB virtual OS pages
            for (let i = 0; i < this.totalSlots; i++) {
                const addr = (baseAddr + i * 4096).toString(16).toUpperCase();
                if (i < 4) {
                    this.blocks.push({ type: 'user', label: `mmap OS Page [${i}]`, size: '4096B', addr, owner: 'kernel.mmap' });
                } else {
                    this.blocks.push({ type: 'free', label: 'Unmapped Virtual Address', size: '4096B', addr, owner: 'kernel.vmm' });
                }
            }
        }
    }

    triggerLeak() {
        if (this.allocatorType !== 'gpa') {
            this.setAllocator('gpa');
        }
        this.hasLeak = true;
        // Turn blocks 2..5 into orphaned leaked blocks
        for (let i = 2; i <= 5; i++) {
            this.blocks[i].type = 'leak';
            this.blocks[i].label = 'ORPHANED LEAK: Matrix Rows';
            this.blocks[i].owner = 'tracker.initMatrix [Missing defer free]';
        }
        this.render();
        this.onEvent('leak_detected', {
            addr: this.blocks[2].addr,
            bytes: 64,
            stack: 'src/main.zig:20:19 in main()'
        });
    }

    resetClean() {
        this.hasLeak = false;
        this.initDefaultLayout();
        this.render();
        this.onEvent('clean_state', {});
    }

    allocateChunk() {
        // Find first free block and allocate it
        const firstFree = this.blocks.findIndex(b => b.type === 'free');
        if (firstFree !== -1) {
            this.blocks[firstFree].type = 'user';
            this.blocks[firstFree].label = 'User Vector Alloc (Dynamic)';
            this.blocks[firstFree].owner = 'user.alloc';
            this.render();
            this.onEvent('allocated_chunk', { index: firstFree });
        }
    }

    freeChunk() {
        // Find last user block and free it
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            if (this.blocks[i].type === 'user') {
                this.blocks[i].type = 'free';
                this.blocks[i].label = 'Uncommitted (Freed)';
                this.blocks[i].owner = 'heap.free';
                this.render();
                this.onEvent('freed_chunk', { index: i });
                break;
            }
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        // Status Badge Update
        if (this.statusBadge) {
            if (this.hasLeak) {
                this.statusBadge.className = "text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono animate-pulse";
                this.statusBadge.innerHTML = "⚠ Memory Leak (GPA)";
            } else {
                this.statusBadge.className = "text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono";
                this.statusBadge.innerHTML = "✔ No Leaks (Clean)";
            }
        }

        // Render Grid Cells
        this.blocks.forEach((block, idx) => {
            const cell = document.createElement('div');
            let colorClasses = '';

            switch (block.type) {
                case 'metadata':
                    colorClasses = 'bg-[#f7a41d] border-[#f7a41d] shadow-[0_0_8px_rgba(247,164,29,0.3)]';
                    break;
                case 'user':
                    colorClasses = 'bg-[#4ea8de] border-[#4ea8de] shadow-[0_0_8px_rgba(78,168,222,0.3)]';
                    break;
                case 'canary':
                    colorClasses = 'bg-pink-500/80 border-pink-600';
                    break;
                case 'leak':
                    colorClasses = 'bg-red-500 border-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]';
                    break;
                case 'free':
                default:
                    colorClasses = 'bg-[#161920] border-[#242936] hover:border-slate-600';
                    break;
            }

            cell.className = `h-7 rounded transition-all transform hover:scale-110 cursor-pointer border ${colorClasses} flex items-center justify-center text-[9px] font-mono select-none`;
            cell.title = `[0x${block.addr}] ${block.label} (${block.size})\nOwner: ${block.owner}`;

            // Cell click inspect event
            cell.addEventListener('click', () => {
                this.onEvent('cell_inspected', { block, index: idx });
            });

            this.container.appendChild(cell);
        });

        this.renderLegend();
    }

    renderLegend() {
        if (!this.legendContainer) return;
        this.legendContainer.innerHTML = `
            <div class="flex items-center space-x-1"><span class="w-2 h-2 rounded bg-[#f7a41d]"></span><span>Metadata</span></div>
            <div class="flex items-center space-x-1"><span class="w-2 h-2 rounded bg-[#4ea8de]"></span><span>User Data</span></div>
            <div class="flex items-center space-x-1"><span class="w-2 h-2 rounded bg-pink-500"></span><span>Canary</span></div>
            <div class="flex items-center space-x-1"><span class="w-2 h-2 rounded bg-red-500 ${this.hasLeak ? 'animate-pulse' : ''}"></span><span>Leak</span></div>
            <div class="flex items-center space-x-1"><span class="w-2 h-2 rounded bg-[#161920] border border-[#242936]"></span><span>Free</span></div>
        `;
    }
}
