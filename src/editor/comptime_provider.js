// Monaco Hover Provider for Zig Comptime Evaluation & Zero-Overhead Reflection

export function registerComptimeHoverProvider(monaco) {
    monaco.languages.registerHoverProvider('zig', {
        provideHover: function (model, position) {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const lineContent = model.getLineContent(position.lineNumber);
            const token = word.word;

            // 1. Hover on @comptime or comptime keyword
            if (token === 'comptime' || token === '@comptime') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**⚡ `@comptime` Inlined Evaluation**' },
                        { value: '```zig\n// Resolved at compile-time\n// Runtime Instructions: 0 bytes\n// Heap Allocations: 0\n```' },
                        { value: 'Zig compiler fully executes this branch in the compiler comptime interpreter before emitting machine instructions. Zero binary overhead.' }
                    ]
                };
            }

            // 2. Hover on Matrix generic function
            if (token === 'Matrix') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**⚡ Monomorphized Generic Type: `Matrix(4, 4, f32)`**' },
                        { value: '```zig\nstruct {\n    data: [16]f32 align(16)\n}\n// Total Size: 64 bytes (Packed)\n// Alignment: 16 bytes (AVX/SIMD Ready)\n```' },
                        { value: 'Monomorphization generated a specialized concrete struct layout with vector registers and zero dynamic indirection.' }
                    ]
                };
            }

            // 3. Hover on validateShape
            if (token === 'validateShape') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**⚡ Comptime Constant Folding: `validateShape(4, 4)`**' },
                        { value: '```zig\n// Static Invariant Check\nvalidateShape(4, 4) => true\n```' },
                        { value: 'Evaluated to constant `true` at compile time. Branch entirely stripped from release binaries.' }
                    ]
                };
            }

            // 4. Hover on GeneralPurposeAllocator
            if (token === 'GeneralPurposeAllocator') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**🔍 `std.heap.GeneralPurposeAllocator` (GPA)**' },
                        { value: '```zig\nvar gpa = std.heap.GeneralPurposeAllocator(.{}){};\ndefer _ = gpa.deinit();\n```' },
                        { value: '**Features:** Thread-safe, canary detection, double-free prevention, and active leak detection on `.deinit()`. Check the **Explicit Allocator Tracer** panel to the right.' }
                    ]
                };
            }

            // 5. Hover on ArenaAllocator
            if (token === 'ArenaAllocator') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**⚡ `std.heap.ArenaAllocator`**' },
                        { value: '```zig\nvar arena = std.heap.ArenaAllocator.init(child_allocator);\ndefer arena.deinit();\n```' },
                        { value: 'Fast monotonic bump allocation. All allocated child blocks are freed together instantly in `arena.deinit()` with O(1) time.' }
                    ]
                };
            }

            // 6. Hover on SockAddrIn or FastNonBlockingServer
            if (token === 'SockAddrIn' || token === 'FastNonBlockingServer') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**🚀 Zero-Cost C ABI System API Interop (Sumner Style)**' },
                        { value: '```zig\npub const SockAddrIn = extern struct {\n    sin_family: u16,\n    sin_port: u16,\n    sin_addr: u32,\n    sin_zero: [8]u8,\n};\n```' },
                        { value: 'Matches raw Linux `struct sockaddr_in` bit-for-bit. Compiles directly into native register syscalls without wrapper libraries or memory copies.' }
                    ]
                };
            }

            // 7. Hover on @import
            if (token === '@import') {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: '**Builtin: `@import(comptime path: []const u8)`**' },
                        { value: 'Imports another Zig file or package into the compilation unit at compile time. Symbol resolution is explicit.' }
                    ]
                };
            }

            // 8. Hover on builtins like @sizeOf, @alignOf, @memset
            if (token.startsWith('@')) {
                return {
                    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                    contents: [
                        { value: `**Zig Builtin Function: \`${token}\`**` },
                        { value: 'Evaluated during compile-time or inlined to intrinsic CPU instructions.' }
                    ]
                };
            }

            return null;
        }
    });
}
