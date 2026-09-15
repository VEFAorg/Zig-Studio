// Zig Cross-Compilation Target Triple Matrix
// Zig's signature superpower: cross-compilation out-of-the-box without extra toolchains

export const targetTriples = {
    "x86_64-linux-gnu": {
        triple: "x86_64-linux-gnu",
        arch: "x86_64 (AMD64)",
        os: "Linux 6.x",
        abi: "GNU libc (glibc 2.38)",
        ptrWidth: "64-bit (8 bytes)",
        endian: "Little Endian",
        binarySizeDebug: "142 KB",
        binarySizeReleaseSmall: "22 KB",
        features: ["avx2", "fma", "sse4.2"],
        defaultSyscall: "syscall (e.g. rax=39 getpid)",
        notes: "Standard native target for Linux workstations and container runtimes."
    },
    "x86_64-windows-gnu": {
        triple: "x86_64-windows-gnu",
        arch: "x86_64 (AMD64)",
        os: "Windows 10/11",
        abi: "MinGW / MSVCRT",
        ptrWidth: "64-bit (8 bytes)",
        endian: "Little Endian",
        binarySizeDebug: "168 KB",
        binarySizeReleaseSmall: "28 KB",
        features: ["avx2", "fma", "sse4.2"],
        defaultSyscall: "ntdll.dll / kernel32.dll Win32 ABI",
        notes: "Direct PE/COFF executable generation without requiring MSVC build tools."
    },
    "aarch64-macos.none": {
        triple: "aarch64-macos.none",
        arch: "AArch64 (ARM64 Apple Silicon)",
        os: "macOS Sonoma/Sequoia",
        abi: "Darwin ABI / Mach-O",
        ptrWidth: "64-bit (8 bytes)",
        endian: "Little Endian",
        binarySizeDebug: "154 KB",
        binarySizeReleaseSmall: "24 KB",
        features: ["neon", "fp-armv8", "aes"],
        defaultSyscall: "svc #0x80 / libSystem.B.dylib",
        notes: "Native Mach-O binary for M1/M2/M3/M4 chips with Apple code signing compliance."
    },
    "riscv64-linux-musl": {
        triple: "riscv64-linux-musl",
        arch: "RISC-V 64-bit",
        os: "Linux (Static Embedded)",
        abi: "musl libc (Fully Static)",
        ptrWidth: "64-bit (8 bytes)",
        endian: "Little Endian",
        binarySizeDebug: "112 KB",
        binarySizeReleaseSmall: "18 KB",
        features: ["rv64gc", "zicsr", "zifencei"],
        defaultSyscall: "ecall (RISC-V ABI)",
        notes: "Ultra-lean static binary for RISC-V edge devices with zero dynamic linker dependencies."
    },
    "wasm32-freestanding": {
        triple: "wasm32-freestanding",
        arch: "WebAssembly 32-bit",
        os: "Freestanding (No OS)",
        abi: "WASM ABI (Linear Memory)",
        ptrWidth: "32-bit (4 bytes)",
        endian: "Little Endian",
        binarySizeDebug: "64 KB",
        binarySizeReleaseSmall: "11 KB",
        features: ["simd128", "bulk-memory"],
        defaultSyscall: "Wasm Imported Host Calls",
        notes: "Direct compilation to .wasm module for browser or Wasmtime runtime with zero runtime overhead."
    }
};

export class TargetMatrix {
    constructor(defaultTriple = "x86_64-linux-gnu", onTripleChange) {
        this.currentTriple = defaultTriple;
        this.onChange = onTripleChange || (() => {});
    }

    setTriple(tripleKey) {
        if (!targetTriples[tripleKey]) return;
        this.currentTriple = tripleKey;
        this.onChange(targetTriples[tripleKey]);
        return targetTriples[tripleKey];
    }

    getCurrent() {
        return targetTriples[this.currentTriple];
    }
}
