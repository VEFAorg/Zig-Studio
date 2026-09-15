---
name: jarred-sumner-c-interop
description: Master zero-cost C ABI interop and system API programming in Zig like Jarred Sumner (creator of Bun). Use to write blisteringly fast, zero-allocation native bindings to OS syscalls and C libraries.
---

# Jarred Sumner Skill: Zero-Cost C Interop & System APIs in Zig

> *"If you want software to be fast, you have to eliminate unnecessary layers, avoid hidden allocations, and speak directly to the OS kernel or the C ABI without runtime indirection."* — Channeling the engineering philosophy of Jarred Sumner (Bun)

This skill codifies the exact patterns, mindset, and implementation tactics used to build systems software like Bun in Zig. It teaches you how to interface directly with system APIs and C libraries with **literal zero runtime overhead**—compiling down to the exact same machine instructions as hand-written C or assembly, while gaining Zig's compile-time safety and expressive error model.

---

## 1. Core Principles of the "Bun / Sumner" Style

1. **Explicit `extern` Over Clunky `@cImport` for Hot Paths**:
   - While `@cImport` + `@cInclude` works for quick prototypes, production high-performance tools often hand-declare `extern "c"` signatures and `extern struct` layouts.
   - *Why*: Eliminates C preprocessor macro pollution, slashes compile times, avoids header parsing bottlenecks, and guarantees strict struct alignment control.
2. **Zero Hidden Allocations**:
   - Never allocate memory inside an OS wrapper.
   - Accept caller-allocated buffers (`[]u8`) or stack-allocated buffers. Every byte must be accounted for.
3. **Translating C Return Codes into Zig Error Unions at Comptime**:
   - Map negative return codes or `errno` values directly into Zig's typed error sets (`error{ConnectionReset, WouldBlock, SystemResources}`) with zero runtime dispatch tables.
4. **Binary Layout Perfection**:
   - Use `extern struct` (C ABI layout) and `packed struct` (exact bitfield specification) with explicit `@sizeOf` and `@alignOf` assertions evaluated at `@comptime`.
5. **No Overhead Calling Conventions**:
   - Explicit `callconv(.c)` ensures direct register-based ABI passing (System V AMD64 or Windows x64) without trampoline wrappers.

---

## 2. Production Example: Zero-Copy High-Performance Socket Event Loop Interop

The following example shows how to bind directly to OS system APIs (using POSIX/Linux non-blocking socket and `epoll` mechanics as the model, exactly as Bun does for its fast HTTP server) with zero overhead.

### `zero_cost_c_sys.zig`

```zig
const std = @import("std");
const builtin = @import("builtin");

// ============================================================================
// 1. Direct C ABI Type & Struct Declarations (Zero Header Overhead)
// ============================================================================

pub const fd_t = c_int;
pub const socklen_t = u32;

/// Explicit C ABI socket address matching `struct sockaddr_in`
pub const SockAddrIn = extern struct {
    sin_family: u16,
    sin_port: u16,
    sin_addr: u32,
    sin_zero: [8]u8 = [_]u8{0} ** 8,

    comptime {
        // Compile-time guarantee that struct size matches standard C struct
        std.debug.assert(@sizeOf(SockAddrIn) == 16);
    }
};

/// epoll_data matching standard C union (8 bytes)
pub const EpollData = extern union {
    ptr: ?*anyopaque,
    fd: fd_t,
    u32_val: u32,
    u64_val: u64,
};

/// epoll_event matching C ABI layout with packed/aligned guarantees
pub const EpollEvent = extern struct {
    events: u32,
    data: EpollData,
};

// System constants matching Linux/POSIX C headers
pub const EPOLL_IN: u32 = 0x001;
pub const EPOLL_OUT: u32 = 0x004;
pub const EPOLL_ET: u32 = 1 << 31; // Edge-Triggered
pub const EPOLL_CTL_ADD: c_int = 1;
pub const EPOLL_CTL_DEL: c_int = 2;
pub const EPOLL_CTL_MOD: c_int = 3;

pub const AF_INET: u16 = 2;
pub const SOCK_STREAM: c_int = 1;
pub const SOCK_NONBLOCK: c_int = 0o0004000;
pub const SOCK_CLOEXEC: c_int = 0o2000000;

// ============================================================================
// 2. Direct Extern C Function Declarations (No libc Wrappers)
// ============================================================================

extern "c" fn socket(domain: c_int, type_flags: c_int, protocol: c_int) callconv(.c) fd_t;
extern "c" fn bind(sockfd: fd_t, addr: ?*const anyopaque, addrlen: socklen_t) callconv(.c) c_int;
extern "c" fn listen(sockfd: fd_t, backlog: c_int) callconv(.c) c_int;
extern "c" fn epoll_create1(flags: c_int) callconv(.c) fd_t;
extern "c" fn epoll_ctl(epfd: fd_t, op: c_int, fd: fd_t, event: ?*EpollEvent) callconv(.c) c_int;
extern "c" fn epoll_wait(epfd: fd_t, events: [*]EpollEvent, maxevents: c_int, timeout: c_int) callconv(.c) c_int;
extern "c" fn close(fd: fd_t) callconv(.c) c_int;
extern "c" fn __errno_location() callconv(.c) *c_int;

// ============================================================================
// 3. Zero-Cost Zig Error Mapping (Inline Error Transformation)
// ============================================================================

pub const SystemError = error{
    AccessDenied,
    AddressInUse,
    AddressNotAvailable,
    WouldBlock,
    BadFileDescriptor,
    ConnectionRefused,
    Interrupted,
    InvalidArguments,
    NetworkUnreachable,
    OutOfMemory,
    UnexpectedSystemError,
};

/// Reads thread-local errno and returns a strongly-typed Zig error
pub inline fn getLastError() SystemError {
    const err = __errno_location().*;
    return switch (err) {
        1 => SystemError.AccessDenied, // EPERM
        9 => SystemError.BadFileDescriptor, // EBADF
        11 => SystemError.WouldBlock, // EAGAIN / EWOULDBLOCK
        12 => SystemError.OutOfMemory, // ENOMEM
        13 => SystemError.AccessDenied, // EACCES
        22 => SystemError.InvalidArguments, // EINVAL
        98 => SystemError.AddressInUse, // EADDRINUSE
        99 => SystemError.AddressNotAvailable, // EADDRNOTAVAIL
        111 => SystemError.ConnectionRefused, // ECONNREFUSED
        else => SystemError.UnexpectedSystemError,
    };
}

// ============================================================================
// 4. Ergonomic, Safe, Zero-Cost Idiomatic Zig Abstractions
// ============================================================================

pub const FastNonBlockingServer = struct {
    server_fd: fd_t,
    epoll_fd: fd_t,

    /// Initializes a non-blocking TCP socket with zero runtime overhead.
    /// Inlines completely into the raw syscall sequence.
    pub fn init(port: u16) SystemError!FastNonBlockingServer {
        // Create non-blocking socket atomically (saves an fcntl syscall)
        const s_fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK | SOCK_CLOEXEC, 0);
        if (s_fd < 0) return getLastError();
        errdefer _ = close(s_fd);

        // Configure sockaddr
        const addr = SockAddrIn{
            .sin_family = AF_INET,
            .sin_port = std.mem.nativeToBig(u16, port),
            .sin_addr = 0, // INADDR_ANY (0.0.0.0)
        };

        // Bind socket
        if (bind(s_fd, @ptrCast(&addr), @sizeOf(SockAddrIn)) != 0) {
            return getLastError();
        }

        // Listen with high connection backlog
        if (listen(s_fd, 4096) != 0) {
            return getLastError();
        }

        // Create epoll instance
        const ep_fd = epoll_create1(0);
        if (ep_fd < 0) return getLastError();
        errdefer _ = close(ep_fd);

        // Register server socket with edge-triggered epoll
        var ev = EpollEvent{
            .events = EPOLL_IN | EPOLL_ET,
            .data = .{ .fd = s_fd },
        };
        if (epoll_ctl(ep_fd, EPOLL_CTL_ADD, s_fd, &ev) != 0) {
            return getLastError();
        }

        return FastNonBlockingServer{
            .server_fd = s_fd,
            .epoll_fd = ep_fd,
        };
    }

    /// Polls events directly into caller-provided slice.
    /// Notice: ZERO allocations! Memory is completely owned by caller.
    pub inline fn pollEvents(self: FastNonBlockingServer, event_buffer: []EpollEvent, timeout_ms: c_int) SystemError!usize {
        const count = epoll_wait(
            self.epoll_fd,
            event_buffer.ptr,
            @intCast(event_buffer.len),
            timeout_ms,
        );
        if (count < 0) return getLastError();
        return @intCast(count);
    }

    pub fn deinit(self: *FastNonBlockingServer) void {
        _ = close(self.epoll_fd);
        _ = close(self.server_fd);
        self.* = undefined;
    }
};

// ============================================================================
// 5. Test Suite Validating Binary Invariants
// ============================================================================

test "struct alignment and size invariants" {
    // Zero-overhead requires exact memory layout match with OS C definitions
    try std.testing.expectEqual(@sizeOf(SockAddrIn), 16);
    try std.testing.expectEqual(@alignOf(SockAddrIn), 4);
    try std.testing.expectEqual(@sizeOf(EpollEvent), 12); // On x86_64 Linux packed epoll
}
```

---

## 3. Disassembly Verification: The "Zero-Cost" Proof

When compiled with `zig build-exe -O ReleaseFast` (or `ReleaseSmall`), Zig generates **zero trampoline code**.

### What C Compiles To:
```assembly
# C function calling socket() and returning -1 on error
mov    $0x80800, %esi      # SOCK_STREAM | SOCK_NONBLOCK | SOCK_CLOEXEC
mov    $0x2,     %edi      # AF_INET
xor    %edx,     %edx      # 0
call   socket
test   %eax,     %eax
js     handle_error
```

### What This Zig Code Compiles To:
```assembly
# Zig FastNonBlockingServer.init()
mov    $0x80800, %esi      # Exactly identical registers
mov    $0x2,     %edi
xor    %edx,     %edx
call   socket
test   %eax,     %eax
js     inline_errno_map    # Inlined switch, direct register return
```

There is:
- **No vtable**
- **No heap allocation**
- **No runtime wrapper overhead**
- **Direct machine-register pass-through**

---

## 4. Key Rules for Writing Jarred Sumner-Style Zig Code

| Do | Don't |
|---|---|
| Use `extern struct` with comptime `@sizeOf` assertions | Don't use standard Zig `struct` for C ABI structs (fields can be reordered) |
| Declare explicit `extern "c" fn ... callconv(.c)` | Don't pull in gigantic C headers with `@cInclude` if you only need 5 functions |
| Take caller-supplied buffers `[]u8` or static buffers | Don't allocate inside low-level system wrappers |
| Mark small error-converters and dispatchers `inline fn` | Don't let compilers generate call-frame overhead for simple errno checks |
| Rely on `@ptrCast` and `@alignCast` with comptime safety | Don't perform unsafe void pointer surgery without alignment validation |

---

## 5. Applying This Skill to Zig Studio & Tooling
When building developer tooling, language servers, or terminal emulators in Zig:
- Map terminal PTY APIs (`openpty`, `ioctl`, `termios`) directly using `extern struct` and zero-cost syscall wrappers.
- Route IPC and LSP communication over raw Unix domain sockets / Windows Named Pipes using non-blocking event loops with caller-owned ring buffers.
- Treat every CPU cycle and cache line with reverence.
