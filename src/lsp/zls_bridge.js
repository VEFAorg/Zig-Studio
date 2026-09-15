// Dual-Mode ZLS Bridge: In-Browser Simulation & Native WebSocket JSON-RPC

export class ZlsBridge {
    constructor(statusIndicatorId, messageLogContainerId) {
        this.statusIndicator = document.getElementById(statusIndicatorId);
        this.messageLogContainer = document.getElementById(messageLogContainerId);
        this.mode = 'mock'; // 'mock' | 'websocket'
        this.ws = null;
        this.logs = [];

        this.logMessage("IN", "initialize", { processId: 1042, rootUri: "file:///workspace/zig_studio_app" });
        this.logMessage("OUT", "initialize:result", { capabilities: { hoverProvider: true, definitionProvider: true, completionProvider: {} } });
    }

    setMode(newMode, wsUrl = "ws://localhost:9999") {
        this.mode = newMode;
        if (newMode === 'websocket') {
            this.connectWebSocket(wsUrl);
        } else {
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            this.updateStatus("ZLS In-Browser JSON-RPC (Active)", "emerald");
        }
    }

    connectWebSocket(url) {
        this.updateStatus(`Connecting to ${url}...`, "amber");
        try {
            this.ws = new WebSocket(url);
            this.ws.onopen = () => {
                this.updateStatus("ZLS Native Daemon Connected (ws)", "emerald");
                this.logMessage("INFO", "Connected to local zls daemon via WebSocket");
            };
            this.ws.onerror = () => {
                this.updateStatus("Native ZLS Daemon Offline (Fallback to Mock)", "cyan");
                this.logMessage("WARN", "WebSocket connect failed; operating in high-fidelity in-browser mode.");
            };
            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    this.logMessage("IN", msg.method || "response", msg.params || msg.result);
                } catch (e) {
                    this.logMessage("IN", "raw", event.data);
                }
            };
        } catch (err) {
            this.updateStatus("Mock Mode (WebSocket Unsupported)", "cyan");
        }
    }

    logMessage(direction, method, payload) {
        const time = new Date().toISOString().substring(11, 19);
        this.logs.unshift({ time, direction, method, payload });
        if (this.logs.length > 50) this.logs.pop();
        this.renderLogs();
    }

    renderLogs() {
        if (!this.messageLogContainer) return;
        let html = '';
        this.logs.slice(0, 15).forEach(l => {
            const dirColor = l.direction === 'IN' ? 'text-cyan-400' : (l.direction === 'OUT' ? 'text-amber-400' : 'text-slate-400');
            html += `
                <div class="py-1 border-b border-[#242936]/40 text-[10px] font-mono">
                    <span class="text-slate-500">${l.time}</span>
                    <span class="font-bold ${dirColor} mx-1">[${l.direction}]</span>
                    <span class="text-slate-200">${l.method}</span>
                </div>
            `;
        });
        this.messageLogContainer.innerHTML = html;
    }

    updateStatus(text, color) {
        if (!this.statusIndicator) return;
        let dotClass = 'bg-emerald-400';
        if (color === 'amber') dotClass = 'bg-amber-400';
        if (color === 'cyan') dotClass = 'bg-cyan-400';

        this.statusIndicator.innerHTML = `
            <span class="w-2 h-2 rounded-full ${dotClass} animate-pulse"></span>
            <span class="text-slate-300 font-mono text-[11px]">${text}</span>
        `;
    }
}
