// 4-Way Build & Optimization Target Matrix (Debug, ReleaseSafe, ReleaseFast, ReleaseSmall)

export const buildModes = {
    Debug: {
        mode: 'Debug',
        name: 'Debug (Default)',
        binarySize: '142 KB',
        speed: '1x (Baseline)',
        safetyChecks: true,
        boundsChecking: true,
        integerOverflowChecks: true,
        gpaCanaries: true,
        stripSymbols: false,
        optimizations: '-O0 (No inlining, full stack traces)',
        asmSnippet: `; Zig Studio Disassembly preview: [Debug mode]
; Full safety checks, bounds verification, panic handlers active
main:
    push    %rbp
    mov     %rsp, %rbp
    sub     $0x60, %rsp
    ; GPA Allocator prologue
    lea     -0x40(%rbp), %rdi
    call    std.heap.GeneralPurposeAllocator.init
    ; Array bounds safety check probe
    mov     $0x4, %eax
    cmp     $0x10, %rax
    jae     zig_panic_bounds_check   ; Bounds check trap active
    mov     $0x80800, %esi          ; SOCK_STREAM | SOCK_NONBLOCK
    mov     $0x2, %edi              ; AF_INET
    call    socket
    test    %eax, %eax
    js      handle_system_error
    leave
    ret`
    },

    ReleaseSafe: {
        mode: 'ReleaseSafe',
        name: 'Release Safe',
        binarySize: '78 KB',
        speed: '3.8x',
        safetyChecks: true,
        boundsChecking: true,
        integerOverflowChecks: true,
        gpaCanaries: false,
        stripSymbols: false,
        optimizations: '-O3 with Safety Invariants Preserved',
        asmSnippet: `; Zig Studio Disassembly preview: [ReleaseSafe mode]
; Aggressive vectorization & loop unrolling, safety panics retained
main:
    sub     $0x28, %rsp
    ; Vectorized AVX2 matrix identity initialization
    vpxor   %xmm0, %xmm0, %xmm0
    vmovups %ymm0, (%rdi)
    vmovups %ymm0, 0x20(%rdi)
    ; Direct zero-cost socket syscall
    mov     $0x80800, %esi
    mov     $0x2, %edi
    call    socket
    test    %eax, %eax
    js      handle_system_error
    add     $0x28, %rsp
    ret`
    },

    ReleaseFast: {
        mode: 'ReleaseFast',
        name: 'Release Fast',
        binarySize: '45 KB',
        speed: '4.6x (Max Throughput)',
        safetyChecks: false,
        boundsChecking: false,
        integerOverflowChecks: false,
        gpaCanaries: false,
        stripSymbols: true,
        optimizations: '-O3 (Max Aggressive Inlining, Safety Disabled)',
        asmSnippet: `; Zig Studio Disassembly preview: [ReleaseFast mode]
; All panic handlers & bounds branches eliminated, pure raw throughput
main:
    ; AVX2 broadcast store directly inlined
    vmovaps %ymm0, (%rdi)
    vmovaps %ymm0, 0x20(%rdi)
    mov     $0x80800, %esi
    mov     $0x2, %edi
    jmp     socket                  ; Direct tail call, zero stack frame overhead`
    },

    ReleaseSmall: {
        mode: 'ReleaseSmall',
        name: 'Release Small',
        binarySize: '22 KB',
        speed: '3.4x',
        safetyChecks: false,
        boundsChecking: false,
        integerOverflowChecks: false,
        gpaCanaries: false,
        stripSymbols: true,
        optimizations: '-Oz (Ultra-lean binary footprint, Andrew Kelley special)',
        asmSnippet: `; Zig Studio Disassembly preview: [ReleaseSmall mode - 22 KB Target]
; Stripped symbols, dead code elimination, compact opcode selection
main:
    xor     %edx, %edx
    mov     $0x80800, %esi
    push    $0x2
    pop     %rdi
    jmp     socket                  ; Minimal byte footprint binary`
    }
};

export class BuildMatrix {
    constructor(currentMode = 'Debug', onChangeCallback) {
        this.currentMode = currentMode;
        this.onChange = onChangeCallback || (() => {});
    }

    setMode(mode) {
        if (!buildModes[mode]) return;
        this.currentMode = mode;
        this.onChange(buildModes[mode]);
        return buildModes[mode];
    }

    getConfig() {
        return buildModes[this.currentMode];
    }
}
