// Advanced Allocator Profiler: Dynamic Allocation Timeline & Canary Violation Detector

export class MemoryProfiler {
    constructor(canvasId, canaryBadgeId, onEventCallback) {
        this.canvas = document.getElementById(canvasId);
        this.canaryBadge = document.getElementById(canaryBadgeId);
        this.onEvent = onEventCallback || (() => {});
        this.history = [16, 32, 64, 64, 80, 64, 48, 64, 112, 64];
        this.maxBytes = 256;
        this.isCanaryCorrupted = false;
        this.drawTimeline();
    }

    recordAllocation(bytes) {
        this.history.push(bytes);
        if (this.history.length > 20) this.history.shift();
        this.drawTimeline();
    }

    drawTimeline() {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw background grid lines
        ctx.strokeStyle = '#1e2433';
        ctx.lineWidth = 1;
        for (let y = 10; y < h; y += 15) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw allocation line
        ctx.strokeStyle = this.isCanaryCorrupted ? '#ef4444' : '#4ea8de';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const step = w / (this.history.length - 1);
        this.history.forEach((val, idx) => {
            const x = idx * step;
            const y = h - (val / this.maxBytes) * (h - 10) - 5;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw gradient fill under line
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        if (this.isCanaryCorrupted) {
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            grad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        } else {
            grad.addColorStop(0, 'rgba(78, 168, 222, 0.4)');
            grad.addColorStop(1, 'rgba(78, 168, 222, 0.0)');
        }
        ctx.fillStyle = grad;
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
    }

    simulateCanaryCorruption() {
        this.isCanaryCorrupted = true;
        this.drawTimeline();

        if (this.canaryBadge) {
            this.canaryBadge.className = "text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono animate-pulse";
            this.canaryBadge.innerText = "🚨 GPA Canary Corrupted!";
        }

        this.onEvent('canary_corrupted', {
            expected: "0xAAAAAAAAAAAAAAAA",
            found: "0xDEADBEEFCAFEBABE",
            addr: "0x7FFF0050",
            location: "src/tracker.zig:31 (buffer overrun out-of-bounds write)"
        });
    }

    resetCanary() {
        this.isCanaryCorrupted = false;
        this.drawTimeline();

        if (this.canaryBadge) {
            this.canaryBadge.className = "text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono";
            this.canaryBadge.innerText = "✔ Canaries Intact";
        }

        this.onEvent('canary_restored', {});
    }
}
