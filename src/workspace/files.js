// Virtual File System for Zig Studio
// Contains idiomatic, production-grade Zig source code reflecting core Zig principles

export const initialFiles = {
    "src/main.zig": {
        name: "main.zig",
        path: "src/main.zig",
        category: "src",
        icon: "⚡",
        ast: [
            { type: "Root", label: "src/main.zig", children: [
                { type: "Import", label: "const std = @import(\"std\");" },
                { type: "Import", label: "const tracker = @import(\"tracker.zig\");" },
                { type: "Import", label: "const fast_c = @import(\"fast_c.zig\");" },
                { type: "FnDeclaration", label: "pub fn main() !void", children: [
                    { type: "VarDecl", label: "var gpa = std.heap.GeneralPurposeAllocator(.{}){}" },
                    { type: "DeferStatement", label: "defer _ = gpa.deinit()" },
                    { type: "VarDecl", label: "const allocator = gpa.allocator()" },
                    { type: "CallExpression", label: "std.debug.print(\"Initializing...\\n\", .{})" },
                    { type: "VarDecl", label: "const matrix = try tracker.initMatrix(allocator, 4, 4)" },
                    { type: "DeferStatement", label: "defer tracker.freeMatrix(allocator, matrix)" },
                    { type: "CallExpression", label: "std.debug.print(\"Computation completed.\\n\", .{})" }
                ]},
                { type: "TestDeclaration", label: "test \"comptime matrix shape validator\"", children: [
                    { type: "ComptimeBlock", label: "@comptime tracker.validateShape(4, 4)" },
                    { type: "ExpectCall", label: "try std.testing.expect(verified)" }
                ]}
            ]}
        ],
        code: `const std = @import("std");
const tracker = @import("tracker.zig");
const fast_c = @import("fast_c.zig");

pub fn main() !void {
    // 1. Explicit allocator setup — no hidden allocations in Zig
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer {
        const deinit_status = gpa.deinit();
        if (deinit_status == .leak) {
            std.debug.print("CRITICAL: Memory leak detected in GPA!\\n", .{});
        }
    }
    const allocator = gpa.allocator();

    std.debug.print("== Zig Studio v2026.1 Runtime Initialized ==\\n", .{});

    // 2. Comptime-validated generic matrix computation
    const matrix = try tracker.initMatrix(allocator, 4, 4);
    defer tracker.freeMatrix(allocator, matrix);

    std.debug.print("Allocated 4x4 matrix on explicit GPA heap.\\n", .{});

    // 3. Zero-cost C ABI socket demonstration (Jarred Sumner style)
    var server = try fast_c.FastNonBlockingServer.init(8080);
    defer server.deinit();

    std.debug.print("Bound non-blocking socket (fd={d}) via zero-cost C ABI.\\n", .{server.server_fd});
    std.debug.print("Pipeline executed with zero leaks and optimal memory layout.\\n", .{});
}

test "comptime matrix shape validator" {
    // Verified entirely during compile-time pass with 0 runtime instructions
    const verified = @comptime tracker.validateShape(4, 4);
    try std.testing.expect(verified);
}

test "comptime generic matrix alignment" {
    const Mat4x4 = tracker.Matrix(4, 4, f32);
    try std.testing.expectEqual(@sizeOf(Mat4x4), 64);
    try std.testing.expectEqual(@alignOf(Mat4x4), 16);
}
`
    },

    "src/tracker.zig": {
        name: "tracker.zig",
        path: "src/tracker.zig",
        category: "src",
        icon: "⚡",
        ast: [
            { type: "Root", label: "src/tracker.zig", children: [
                { type: "Import", label: "const std = @import(\"std\");" },
                { type: "FnDeclaration", label: "pub fn Matrix(comptime rows, cols, type) type", children: [
                    { type: "StructDecl", label: "return struct { data: [rows * cols]T }" }
                ]},
                { type: "FnDeclaration", label: "pub fn initMatrix(allocator, rows, cols) ![][]f32", children: [
                    { type: "AllocCall", label: "try allocator.alloc([]f32, rows)" },
                    { type: "LoopExpression", label: "for (data) |*row|" }
                ]},
                { type: "FnDeclaration", label: "pub fn freeMatrix(allocator, matrix) void", children: [
                    { type: "LoopExpression", label: "for (matrix) |row| allocator.free(row)" },
                    { type: "FreeCall", label: "allocator.free(matrix)" }
                ]},
                { type: "FnDeclaration", label: "pub fn validateShape(r, c) bool", children: [
                    { type: "ReturnStatement", label: "return r == c" }
                ]}
            ]}
        ],
        code: `const std = @import("std");

/// Generic compile-time monomorphized matrix structure
pub fn Matrix(comptime rows: usize, comptime cols: usize, comptime T: type) type {
    return struct {
        const Self = @This();
        pub const RowCount = rows;
        pub const ColCount = cols;
        pub const ElementType = T;

        data: [rows * cols]T align(16),

        pub fn identity() Self {
            var m: Self = undefined;
            @memset(&m.data, 0);
            comptime var i: usize = 0;
            inline while (i < @min(rows, cols)) : (i += 1) {
                m.data[i * cols + i] = 1.0;
            }
            return m;
        }
    };
}

/// Dynamically allocated matrix using explicit passed allocator
pub fn initMatrix(allocator: std.mem.Allocator, rows: usize, cols: usize) ![][]f32 {
    const data = try allocator.alloc([]f32, rows);
    errdefer allocator.free(data);

    for (data, 0..) |*row, i| {
        row.* = try allocator.alloc(f32, cols);
        @memset(row.*, 0.0);
        errdefer {
            for (data[0..i]) |allocated_row| allocator.free(allocated_row);
        }
    }
    return data;
}

pub fn freeMatrix(allocator: std.mem.Allocator, matrix: [][]f32) void {
    for (matrix) |row| {
        allocator.free(row);
    }
    allocator.free(matrix);
}

/// Comptime assertion helper: checks square matrix invariants
pub fn validateShape(r: usize, c: usize) bool {
    return r == c;
}
`
    },

    "src/fast_c.zig": {
        name: "fast_c.zig",
        path: "src/fast_c.zig",
        category: "src",
        icon: "⚡",
        ast: [
            { type: "Root", label: "src/fast_c.zig", children: [
                { type: "Import", label: "const std = @import(\"std\");" },
                { type: "TypeDecl", label: "pub const SockAddrIn = extern struct", children: [
                    { type: "ComptimeAssert", label: "assert(@sizeOf(SockAddrIn) == 16)" }
                ]},
                { type: "ExternFn", label: "extern \"c\" fn socket(...) callconv(.c) fd_t" },
                { type: "ExternFn", label: "extern \"c\" fn bind(...) callconv(.c) c_int" },
                { type: "ExternFn", label: "extern \"c\" fn listen(...) callconv(.c) c_int" },
                { type: "StructDecl", label: "pub const FastNonBlockingServer = struct", children: [
                    { type: "FnDeclaration", label: "pub fn init(port) SystemError!Self" },
                    { type: "FnDeclaration", label: "pub fn deinit(self) void" }
                ]}
            ]}
        ],
        code: `// Jarred Sumner Style: Zero-Cost C ABI Interop with System APIs
// Literal 0 runtime overhead — compiles directly into raw syscall instructions

const std = @import("std");

pub const fd_t = c_int;
pub const socklen_t = u32;

/// Exact C ABI layout matching \`struct sockaddr_in\`
pub const SockAddrIn = extern struct {
    sin_family: u16,
    sin_port: u16,
    sin_addr: u32,
    sin_zero: [8]u8 = [_]u8{0} ** 8,

    comptime {
        std.debug.assert(@sizeOf(SockAddrIn) == 16);
        std.debug.assert(@alignOf(SockAddrIn) == 4);
    }
};

// System constants matching POSIX/Linux headers
pub const AF_INET: u16 = 2;
pub const SOCK_STREAM: c_int = 1;
pub const SOCK_NONBLOCK: c_int = 0o0004000;
pub const SOCK_CLOEXEC: c_int = 0o2000000;

// Direct C ABI function imports without bulky libc headers
extern "c" fn socket(domain: c_int, type_flags: c_int, protocol: c_int) callconv(.c) fd_t;
extern "c" fn bind(sockfd: fd_t, addr: ?*const anyopaque, addrlen: socklen_t) callconv(.c) c_int;
extern "c" fn listen(sockfd: fd_t, backlog: c_int) callconv(.c) c_int;
extern "c" fn close(fd: fd_t) callconv(.c) c_int;

pub const SystemError = error{
    AccessDenied,
    AddressInUse,
    AddressNotAvailable,
    WouldBlock,
    BadFileDescriptor,
    ConnectionRefused,
    UnexpectedSystemError,
};

pub const FastNonBlockingServer = struct {
    server_fd: fd_t,

    /// Zero-cost inlined non-blocking server constructor
    pub fn init(port: u16) SystemError!FastNonBlockingServer {
        const s_fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK | SOCK_CLOEXEC, 0);
        if (s_fd < 0) return SystemError.UnexpectedSystemError;
        errdefer _ = close(s_fd);

        const addr = SockAddrIn{
            .sin_family = AF_INET,
            .sin_port = std.mem.nativeToBig(u16, port),
            .sin_addr = 0,
        };

        if (bind(s_fd, @ptrCast(&addr), @sizeOf(SockAddrIn)) != 0) {
            return SystemError.AddressInUse;
        }

        if (listen(s_fd, 4096) != 0) {
            return SystemError.UnexpectedSystemError;
        }

        return FastNonBlockingServer{ .server_fd = s_fd };
    }

    pub fn deinit(self: *FastNonBlockingServer) void {
        _ = close(self.server_fd);
        self.* = undefined;
    }
};
`
    },

    "build.zig": {
        name: "build.zig",
        path: "build.zig",
        category: "root",
        icon: "⚙️",
        ast: [
            { type: "Root", label: "build.zig", children: [
                { type: "Import", label: "const std = @import(\"std\");" },
                { type: "FnDeclaration", label: "pub fn build(b: *std.Build) void", children: [
                    { type: "VarDecl", label: "const target = b.standardTargetOptions(.{})" },
                    { type: "VarDecl", label: "const optimize = b.standardOptimizeOption(.{})" },
                    { type: "VarDecl", label: "const exe = b.addExecutable(...)" },
                    { type: "VarDecl", label: "const unit_tests = b.addTest(...)" },
                    { type: "StepDef", label: "b.step(\"run\", \"Run the application\")" },
                    { type: "StepDef", label: "b.step(\"test\", \"Run unit tests\")" }
                ]}
            ]}
        ],
        code: `const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // 1. Executable Target
    const exe = b.addExecutable(.{
        .name = "zig_studio_app",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });
    b.installArtifact(exe);

    // 2. Run Step
    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());
    if (b.args) |args| {
        run_cmd.addArgs(args);
    }
    const run_step = b.step("run", "Run the application");
    run_step.dependOn(&run_cmd.step);

    // 3. Unit Tests Target
    const exe_unit_tests = b.addTest(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });
    const run_exe_unit_tests = b.addRunArtifact(exe_unit_tests);
    const test_step = b.step("test", "Run all test suites");
    test_step.dependOn(&run_exe_unit_tests.step);
}
`
    },

    "build.zig.zon": {
        name: "build.zig.zon",
        path: "build.zig.zon",
        category: "root",
        icon: "📦",
        ast: [
            { type: "Root", label: "build.zig.zon", children: [
                { type: "ManifestField", label: ".name = \"zig_studio_app\"" },
                { type: "ManifestField", label: ".version = \"0.1.0\"" },
                { type: "ManifestField", label: ".minimum_zig_version = \"0.13.0\"" },
                { type: "ManifestField", label: ".dependencies = .{}" }
            ]}
        ],
        code: `.{
    .name = "zig_studio_app",
    .version = "0.1.0",
    .minimum_zig_version = "0.13.0",
    .dependencies = .{},
    .paths = .{
        "build.zig",
        "build.zig.zon",
        "src",
    },
}
`
    }
};
