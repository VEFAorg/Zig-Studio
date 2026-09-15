// Side-by-Side ZIR (Zig Intermediate Representation) & Assembly Explorer
// Exposes the internal compiler representation before machine codegen

export const sampleZirData = {
    "src/main.zig": {
        zirCode: `; Zig Intermediate Representation (ZIR) - Self-Hosted Compiler Dump
; Analysis Pass: Complete | Comptime Invariants Resolved

%0 = import_symbol("std")
%1 = import_symbol("tracker.zig")
%2 = import_symbol("fast_c.zig")

; Function: pub fn main() !void
fn @main() !void {
  %3 = alloc_type(std.heap.GeneralPurposeAllocator(.{}))
  %4 = struct_init(%3, .{})
  %5 = defer_block {
    %6 = call_method(%4, "deinit", [])
    %7 = cmp_eq(%6, .leak)
    cond_br %7, %leak_panic, %clean_exit
  }
  %8 = call_method(%4, "allocator", [])
  ; Comptime specialized generic instantiation
  %9 = comptime_call(@tracker.Matrix, [4, 4, f32])
  %10 = call(@tracker.initMatrix, [%8, 4, 4])
  ; Zero-cost inlined C ABI syscall
  %11 = inline_call(@fast_c.FastNonBlockingServer.init, [8080])
  return void
}

; Function: test "comptime matrix shape validator"
test @"comptime matrix shape validator"() !void {
  %12 = comptime_eval(@tracker.validateShape, [4, 4]) -> bool(true)
  %13 = assert_true(%12)
  return void
}`,
        asmCode: `; Target Architecture: x86_64-linux-gnu (ReleaseFast Mode)
; Inlining: Max | Bounds Checks: Stripped | Safety Checks: Disabled

.globl main
.type main, @function
main:
    .cfi_startproc
    subq    $40, %rsp
    .cfi_def_cfa_offset 48
    ; AVX2 16-byte aligned vector store (Matrix 4x4)
    vpxor   %xmm0, %xmm0, %xmm0
    vmovups %ymm0, (%rsp)
    vmovups %ymm0, 32(%rsp)
    ; Direct syscall: socket(AF_INET, SOCK_STREAM|SOCK_NONBLOCK|SOCK_CLOEXEC, 0)
    movl    $526336, %esi         ; 0x80800 (SOCK_NONBLOCK|SOCK_CLOEXEC)
    movl    $2, %edi              ; AF_INET
    xorl    %edx, %edx            ; protocol = 0
    call    socket@PLT
    testl   %eax, %eax
    js      .Lerror_handler
    ; Direct tail return with 0 heap leaks
    xorl    %eax, %eax
    addq    $40, %rsp
    ret
.Lerror_handler:
    call    __errno_location@PLT
    movl    (%rax), %eax
    addq    $40, %rsp
    ret
    .cfi_endproc`
    }
};

export class ZirViewer {
    constructor(zirContainerId, asmContainerId) {
        this.zirContainer = document.getElementById(zirContainerId);
        this.asmContainer = document.getElementById(asmContainerId);
        this.render("src/main.zig");
    }

    render(fileKey) {
        const data = sampleZirData[fileKey] || sampleZirData["src/main.zig"];
        if (this.zirContainer) {
            this.zirContainer.innerText = data.zirCode;
        }
        if (this.asmContainer) {
            this.asmContainer.innerText = data.asmCode;
        }
    }
}
