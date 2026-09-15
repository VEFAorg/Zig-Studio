// Monaco Monarch Grammar & Custom Theme for the Zig Programming Language

export function registerZigLanguage(monaco) {
    // 1. Register Language Definition ID
    monaco.languages.register({ id: 'zig' });

    // 2. Language Configuration (Brackets, Comments, Auto-closing pairs)
    monaco.languages.setLanguageConfiguration('zig', {
        comments: {
            lineComment: '//',
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
            { open: '\'', close: '\'', notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' }
        ],
        indentationRules: {
            increaseIndentPattern: /^.*\{[^}"']*$/,
            decreaseIndentPattern: /^(.*\*\/)?\s*\}[;\s]*$/
        }
    });

    // 3. Monarch Lexer Tokenizer
    monaco.languages.setMonarchTokensProvider('zig', {
        defaultToken: '',
        tokenPostfix: '.zig',

        keywords: [
            'addrspace', 'align', 'and', 'asm', 'async', 'await', 'break', 'catch',
            'comptime', 'const', 'continue', 'defer', 'else', 'enum', 'errdefer',
            'error', 'export', 'extern', 'fn', 'for', 'if', 'inline', 'noalias',
            'nosuspend', 'noinline', 'opaque', 'or', 'orelse', 'packed', 'pub',
            'resume', 'return', 'linksection', 'struct', 'suspend', 'switch',
            'test', 'threadlocal', 'try', 'union', 'unreachable', 'usingnamespace',
            'var', 'volatile', 'while'
        ],

        typeKeywords: [
            'bool', 'f16', 'f32', 'f64', 'f80', 'f128',
            'i8', 'i16', 'i32', 'i64', 'i128', 'isize',
            'u8', 'u16', 'u32', 'u64', 'u128', 'usize',
            'c_char', 'c_short', 'c_ushort', 'c_int', 'c_uint', 'c_long', 'c_ulong',
            'c_longlong', 'c_ulonglong', 'c_longdouble',
            'void', 'noreturn', 'type', 'anyerror', 'anyopaque'
        ],

        operators: [
            '=', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++',
            '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '+=', '-=',
            '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>=', '=>', '.*', '.?'
        ],

        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        tokenizer: {
            root: [
                // Identifiers & Keywords
                [/[a-zA-Z_]\w*/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@typeKeywords': 'type',
                        '@default': 'identifier'
                    }
                }],

                // Builtin functions (@import, @as, @intCast, etc.)
                [/@[a-zA-Z_]\w*/, 'keyword.builtin'],

                // Doc comments
                [/\/\/\/.*$/, 'comment.doc'],
                // Regular line comments
                [/\/\/.*$/, 'comment'],

                // Delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }],

                // Numbers (hex, binary, octal, float, decimal)
                [/0x[0-9a-fA-F_]+/, 'number.hex'],
                [/0b[01_]+/, 'number.binary'],
                [/0o[0-7_]+/, 'number.octal'],
                [/\d+[eE]([\-+]?\d+)?/, 'number.float'],
                [/\d+\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/\d+/, 'number'],

                // Delimiter punctuation
                [/[;,.]/, 'delimiter'],

                // Strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

                // Multiline line strings \\
                [/\\\\.*$/, 'string'],

                // Characters
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ]
        }
    });

    // 4. Register Bespoke "Zig Studio Dark" Theme
    monaco.editor.defineTheme('zig-studio-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: 'F7A41D', fontStyle: 'bold' },       // Zig Orange
            { token: 'keyword.builtin', foreground: 'E9C46A', fontStyle: 'bold' }, // Builtin Gold (@import)
            { token: 'type', foreground: '4EA8DE' },                              // Type Cyan
            { token: 'identifier', foreground: 'E2E8F0' },                        // Text Slate
            { token: 'string', foreground: '06D6A0' },                            // String Mint
            { token: 'string.escape', foreground: 'F3C68F' },                     // Escape Apricot
            { token: 'number', foreground: 'FF7096' },                            // Number Coral
            { token: 'comment', foreground: '64748B', fontStyle: 'italic' },      // Comment Slate
            { token: 'comment.doc', foreground: '94A3B8', fontStyle: 'italic' },  // Doc Comment
            { token: 'operator', foreground: 'F7A41D' },                          // Operator Orange
            { token: 'delimiter', foreground: '94A3B8' }
        ],
        colors: {
            'editor.background': '#0F1115',
            'editor.foreground': '#E2E8F0',
            'editor.lineHighlightBackground': '#161920',
            'editorCursor.foreground': '#F7A41D',
            'editorLineNumber.foreground': '#475569',
            'editorLineNumber.activeForeground': '#F7A41D',
            'editor.selectionBackground': '#F7A41D33',
            'editor.inactiveSelectionBackground': '#F7A41D1A',
            'editorIndentGuide.background': '#242936',
            'editorIndentGuide.activeBackground': '#374151',
            'scrollbarSlider.background': '#2D334366',
            'scrollbarSlider.hoverBackground': '#F7A41D88',
            'scrollbarSlider.activeBackground': '#F7A41D'
        }
    });
}
