// Comptime Monomorphization Inspector & Reactive AST Tree Viewer

export class ComptimeEngine {
    constructor(monomorphContainerId, astContainerId) {
        this.monomorphContainer = document.getElementById(monomorphContainerId);
        this.astContainer = document.getElementById(astContainerId);

        this.specializations = [
            {
                signature: "Matrix(4, 4, f32)",
                size: "64 bytes",
                alignment: "16-byte (AVX2 Vectorized)",
                status: "Inline Unrolled",
                cost: "0 runtime overhead",
                desc: "Evaluated at comptime into contiguous fixed array with SIMD alignment.",
                color: "emerald"
            },
            {
                signature: "Matrix(2, 2, i32)",
                size: "16 bytes",
                alignment: "4-byte Scalar",
                status: "Constant Folded",
                cost: "0 runtime overhead",
                desc: "Loop conditions resolved during semantic analysis; 0 allocations.",
                color: "cyan"
            },
            {
                signature: "SockAddrIn (C ABI)",
                size: "16 bytes",
                alignment: "4-byte (System V ABI)",
                status: "Zero-Cost Syscall Map",
                cost: "0 trampoline wrappers",
                desc: "Matches POSIX kernel struct layout bit-for-bit with comptime assert.",
                color: "amber"
            },
            {
                signature: "validateShape(4, 4)",
                size: "0 bytes",
                alignment: "Immediate bool",
                status: "Comptime Constant",
                cost: "Stripped from binary",
                desc: "Evaluated to constant 'true'; branch emitted without compare instruction.",
                color: "purple"
            }
        ];

        this.renderMonomorphizations();
    }

    renderMonomorphizations() {
        if (!this.monomorphContainer) return;
        this.monomorphContainer.innerHTML = '';

        this.specializations.forEach(spec => {
            const card = document.createElement('div');
            card.className = "bg-[#0f1115] border border-[#242936] rounded-lg p-2.5 hover:border-[#f7a41d]/60 transition cursor-pointer group";

            let tagColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            if (spec.color === 'cyan') tagColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            if (spec.color === 'amber') tagColor = 'text-[#f7a41d] bg-[#f7a41d]/10 border-[#f7a41d]/20';
            if (spec.color === 'purple') tagColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';

            card.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-mono font-bold text-white group-hover:text-[#f7a41d] transition">${spec.signature}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-mono border ${tagColor}">${spec.status}</span>
                </div>
                <div class="text-[11px] text-slate-400 font-mono mb-1">
                    <span>Size: <span class="text-slate-200">${spec.size}</span></span>
                    <span class="mx-1 text-slate-600">|</span>
                    <span>Align: <span class="text-slate-200">${spec.alignment}</span></span>
                </div>
                <p class="text-[11px] text-slate-400 leading-snug">${spec.desc}</p>
                <div class="mt-1.5 flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                    <span>⚡</span>
                    <span>${spec.cost}</span>
                </div>
            `;
            this.monomorphContainer.appendChild(card);
        });
    }

    renderAST(astNodes) {
        if (!this.astContainer) return;
        this.astContainer.innerHTML = '';

        if (!astNodes || astNodes.length === 0) {
            this.astContainer.innerHTML = `<div class="text-slate-500 text-xs italic">No AST available for this file.</div>`;
            return;
        }

        const buildNode = (node, depth = 0) => {
            const div = document.createElement('div');
            const paddingLeft = depth * 14;
            div.style.paddingLeft = `${paddingLeft}px`;
            div.className = "py-0.5 font-mono text-[11px] hover:bg-[#161920] rounded px-1 cursor-pointer transition flex items-center space-x-1.5";

            let icon = '📄';
            let color = 'text-slate-300';

            if (node.type === 'Root') { icon = '📁'; color = 'text-[#f7a41d] font-bold'; }
            else if (node.type === 'Import') { icon = '📦'; color = 'text-amber-400'; }
            else if (node.type === 'FnDeclaration') { icon = '⚡'; color = 'text-blue-400 font-semibold'; }
            else if (node.type === 'VarDecl') { icon = '🔷'; color = 'text-purple-400'; }
            else if (node.type === 'DeferStatement') { icon = '⏳'; color = 'text-emerald-400'; }
            else if (node.type === 'CallExpression') { icon = '📞'; color = 'text-green-300'; }
            else if (node.type === 'TestDeclaration') { icon = '🧪'; color = 'text-pink-400 font-semibold'; }
            else if (node.type === 'ComptimeBlock') { icon = '✨'; color = 'text-yellow-300'; }
            else if (node.type === 'StructDecl' || node.type === 'TypeDecl') { icon = '🏛️'; color = 'text-cyan-400'; }
            else if (node.type === 'ExternFn') { icon = '🔗'; color = 'text-red-400'; }

            div.innerHTML = `<span>${icon}</span><span class="${color}">${node.label}</span>`;
            this.astContainer.appendChild(div);

            if (node.children && node.children.length > 0) {
                node.children.forEach(child => buildNode(child, depth + 1));
            }
        };

        astNodes.forEach(rootNode => buildNode(rootNode, 0));
    }
}
