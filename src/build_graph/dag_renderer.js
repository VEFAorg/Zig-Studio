// Interactive std.Build Step DAG Visualizer (Directed Acyclic Graph)
// Represents the actual execution dependency topology configured in build.zig

export const buildDagNodes = [
    {
        id: "target_opt",
        label: "Target & Optimize Options",
        category: "config",
        details: "target = b.standardTargetOptions(.{})\noptimize = b.standardOptimizeOption(.{})",
        x: 40,
        y: 80,
        color: "#4ea8de",
        icon: "⚙️"
    },
    {
        id: "exe",
        label: "b.addExecutable(\"zig_studio_app\")",
        category: "compile",
        details: "root_source_file = b.path(\"src/main.zig\")\ntarget: x86_64-linux-gnu\noptimize: Debug / ReleaseSmall",
        x: 280,
        y: 40,
        color: "#f7a41d",
        icon: "⚡"
    },
    {
        id: "install_artifact",
        label: "b.installArtifact(exe)",
        category: "install",
        details: "Emits binary into zig-out/bin/zig_studio_app\nStripped symbols: mode dependent",
        x: 520,
        y: 40,
        color: "#06d6a0",
        icon: "📦"
    },
    {
        id: "run_cmd",
        label: "b.addRunArtifact(exe)",
        category: "run",
        details: "Executes zig-out/bin/zig_studio_app with b.args forwarder",
        x: 740,
        y: 40,
        color: "#f3c68f",
        icon: "▶️"
    },
    {
        id: "step_run",
        label: "b.step(\"run\", \"Run application\")",
        category: "step",
        details: "Top-level command step invoked via `zig build run`",
        x: 960,
        y: 40,
        color: "#e9c46a",
        icon: "🚀"
    },
    {
        id: "unit_tests",
        label: "b.addTest(\"src/main.zig\")",
        category: "compile",
        details: "Compiles test harness covering matrix validator, alignment, and fast_c",
        x: 280,
        y: 140,
        color: "#ff7096",
        icon: "🧪"
    },
    {
        id: "run_tests",
        label: "b.addRunArtifact(unit_tests)",
        category: "run",
        details: "Executes unit test binary and parses TAP/summary output",
        x: 520,
        y: 140,
        color: "#ff7096",
        icon: "▶️"
    },
    {
        id: "step_test",
        label: "b.step(\"test\", \"Run all test suites\")",
        category: "step",
        details: "Top-level command step invoked via `zig build test`",
        x: 740,
        y: 140,
        color: "#e9c46a",
        icon: "🏁"
    }
];

export const buildDagEdges = [
    { from: "target_opt", to: "exe" },
    { from: "target_opt", to: "unit_tests" },
    { from: "exe", to: "install_artifact" },
    { from: "install_artifact", to: "run_cmd" },
    { from: "run_cmd", to: "step_run" },
    { from: "unit_tests", to: "run_tests" },
    { from: "run_tests", to: "step_test" }
];

export class DagRenderer {
    constructor(containerId, inspectorId) {
        this.container = document.getElementById(containerId);
        this.inspector = document.getElementById(inspectorId);
        this.selectedNodeId = "exe";
        this.render();
    }

    render() {
        if (!this.container) return;

        let svgHtml = `
            <svg class="w-full h-full min-h-[300px]" viewBox="0 0 1100 230" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#4b5563" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f7a41d" />
                    </marker>
                </defs>
        `;

        // Render Dependency Arrows (Edges)
        buildDagEdges.forEach(edge => {
            const fromNode = buildDagNodes.find(n => n.id === edge.from);
            const toNode = buildDagNodes.find(n => n.id === edge.to);
            if (fromNode && toNode) {
                const x1 = fromNode.x + 160;
                const y1 = fromNode.y + 25;
                const x2 = toNode.x;
                const y2 = toNode.y + 25;
                const isConnected = this.selectedNodeId === edge.from || this.selectedNodeId === edge.to;
                const strokeColor = isConnected ? "#f7a41d" : "#374151";
                const marker = isConnected ? "url(#arrow-active)" : "url(#arrow)";

                svgHtml += `
                    <path d="M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}" 
                          stroke="${strokeColor}" stroke-width="${isConnected ? '2.5' : '1.5'}" fill="none" 
                          marker-end="${marker}" stroke-dasharray="${isConnected ? 'none' : '4,4'}" />
                `;
            }
        });

        // Render Step Nodes
        buildDagNodes.forEach(node => {
            const isSelected = this.selectedNodeId === node.id;
            const borderStroke = isSelected ? "#f7a41d" : "#242936";
            const bgFill = isSelected ? "#1c2230" : "#12151c";

            svgHtml += `
                <g class="cursor-pointer transition group" onclick="window.selectDagNode('${node.id}')" transform="translate(${node.x}, ${node.y})">
                    <!-- Card Background -->
                    <rect width="180" height="50" rx="8" ry="8" fill="${bgFill}" stroke="${borderStroke}" stroke-width="${isSelected ? '2' : '1'}" />
                    
                    <!-- Left Accent Pill -->
                    <rect width="4" height="34" x="8" y="8" rx="2" fill="${node.color}" />
                    
                    <!-- Icon & Title -->
                    <text x="20" y="24" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">
                        ${node.icon} ${node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                    </text>
                    
                    <!-- Category Badge -->
                    <text x="20" y="40" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="9" text-transform="uppercase">
                        [${node.category}]
                    </text>
                </g>
            `;
        });

        svgHtml += `</svg>`;
        this.container.innerHTML = svgHtml;
        this.renderInspector();
    }

    selectNode(nodeId) {
        this.selectedNodeId = nodeId;
        this.render();
    }

    renderInspector() {
        if (!this.inspector) return;
        const node = buildDagNodes.find(n => n.id === this.selectedNodeId);
        if (!node) return;

        const incoming = buildDagEdges.filter(e => e.to === node.id).map(e => e.from);
        const outgoing = buildDagEdges.filter(e => e.from === node.id).map(e => e.to);

        this.inspector.innerHTML = `
            <div class="bg-[#0f1115] border border-[#242936] rounded-lg p-3 text-xs font-mono">
                <div class="flex items-center justify-between pb-2 border-b border-[#242936] mb-2">
                    <span class="text-white font-bold text-sm flex items-center space-x-1.5">
                        <span>${node.icon}</span>
                        <span>${node.label}</span>
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-[#f7a41d]/15 text-[#f7a41d] uppercase border border-[#f7a41d]/30">
                        ${node.category} Step
                    </span>
                </div>
                <div class="space-y-1.5 text-slate-300">
                    <div class="text-slate-400 text-[11px]">std.Build Implementation:</div>
                    <pre class="bg-black/50 p-2 rounded text-emerald-300 text-[11px] leading-relaxed">${node.details}</pre>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#242936] text-[11px]">
                    <div>
                        <span class="text-slate-500">Depends On:</span>
                        <span class="text-slate-300 block">${incoming.length > 0 ? incoming.join(', ') : 'None (Root Step)'}</span>
                    </div>
                    <div>
                        <span class="text-slate-500">Downstream Triggers:</span>
                        <span class="text-slate-300 block">${outgoing.length > 0 ? outgoing.join(', ') : 'Terminal Step'}</span>
                    </div>
                </div>
            </div>
        `;
    }
}
