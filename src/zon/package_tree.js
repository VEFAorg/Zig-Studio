// Zig Package Manager Explorer (build.zig.zon)
// ZON (Zig Object Notation) manifest inspector and dependency hash validator

export const samplePackages = [
    {
        name: "zig_studio_app",
        version: "0.1.0",
        minZigVersion: "0.13.0",
        hash: "1220a597e7f1bc6238bfa762b9f8d193efecaa0914c62b9f291077b5a129188251e1",
        isRoot: true,
        dependencies: [
            {
                name: "network",
                url: "https://github.com/MasterQ32/zig-network/archive/refs/tags/v0.1.0.tar.gz",
                hash: "12209b5311ad786e42b8e3a24172f3d537f2a1bb18a7d656094b92b6a22f483786a1",
                version: "0.1.0",
                description: "Cross-platform network sockets for Zig"
            },
            {
                name: "vaxis",
                url: "https://github.com/rockorager/libvaxis/archive/v0.3.0.tar.gz",
                hash: "122081d58ec2d8cf4b3b1e7f62b70f058ab39841fef67dc2b3780598b9596397261a",
                version: "0.3.0",
                description: "Modern terminal user interface library for Zig"
            }
        ]
    }
];

export class ZonExplorer {
    constructor(containerId, onAddPackageCallback) {
        this.container = document.getElementById(containerId);
        this.onAddPackage = onAddPackageCallback || (() => {});
        this.packages = JSON.parse(JSON.stringify(samplePackages));
        this.render();
    }

    render() {
        if (!this.container) return;
        const rootPkg = this.packages[0];

        let html = `
            <div class="space-y-3 font-mono text-xs">
                <!-- Root Package Header Card -->
                <div class="bg-[#0f1115] border border-[#242936] rounded-lg p-3">
                    <div class="flex items-center justify-between pb-1.5 border-b border-[#242936] mb-2">
                        <span class="text-white font-bold flex items-center space-x-1.5">
                            <span class="text-amber-500">📦</span>
                            <span>${rootPkg.name}</span>
                        </span>
                        <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            v${rootPkg.version}
                        </span>
                    </div>
                    <div class="space-y-1 text-[11px] text-slate-400">
                        <div>Min Zig Version: <span class="text-slate-200">${rootPkg.minZigVersion}</span></div>
                        <div class="truncate">Root Hash: <span class="text-[#f7a41d]">${rootPkg.hash.substring(0, 20)}...</span></div>
                    </div>
                </div>

                <!-- Dependencies Header -->
                <div class="flex items-center justify-between pt-1">
                    <span class="text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                        Dependencies (${rootPkg.dependencies.length})
                    </span>
                    <button onclick="window.promptAddPackage()" class="text-[10px] text-[#f7a41d] hover:text-amber-300 font-semibold flex items-center space-x-1 bg-[#f7a41d]/10 px-2 py-0.5 rounded border border-[#f7a41d]/20">
                        <span>+ Add Package</span>
                    </button>
                </div>

                <!-- Dependency Cards -->
                <div class="space-y-2">
        `;

        rootPkg.dependencies.forEach((dep, idx) => {
            html += `
                <div class="bg-[#0f1115] border border-[#242936] rounded-lg p-2.5 hover:border-[#f7a41d]/40 transition">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[#4ea8de] font-bold text-xs flex items-center space-x-1">
                            <span>🔗</span>
                            <span>.${dep.name}</span>
                        </span>
                        <span class="text-[9px] text-slate-400 bg-[#161a24] px-1.5 py-0.5 rounded">v${dep.version}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 mb-1.5 leading-snug">${dep.description}</p>
                    <div class="text-[9px] text-slate-500 truncate bg-[#090b0f] p-1.5 rounded border border-[#242936]">
                        <span class="text-slate-400">hash:</span> <span class="text-emerald-400 font-mono">${dep.hash.substring(0, 26)}...</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    addDependency(name, url, version, description) {
        // Generate pseudo multihash for the package
        const fakeHash = "1220" + Array.from({length: 60}, () => Math.floor(Math.random()*16).toString(16)).join('');
        this.packages[0].dependencies.push({
            name,
            url,
            hash: fakeHash,
            version: version || "0.1.0",
            description: description || "Community Zig Package"
        });
        this.render();
        this.onAddPackage({ name, hash: fakeHash });
    }
}
