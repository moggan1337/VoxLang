# VoxLang 🗣️

**Custom Programming Language with Compiler**

## Features

- **📝 Lexer** - Tokenizer with keywords, operators, literals
- **🎯 Parser** - Recursive descent parser
- **🌳 AST** - Full Abstract Syntax Tree
- **⚙️ Code Generator** - Transpiles to JavaScript
- **🔧 VM** - Virtual machine with bytecode (planned)

## Language Syntax

```
// Functions
fn greet(name) {
    print "Hello, " + name + "!";
}

// Variables
let x = 10;
let name = "World";

// Conditionals
if x > 5 {
    print "Big!";
} else {
    print "Small!";
}

// Loops
while x > 0 {
    print x;
    x = x - 1;
}

for i = 0, 10 {
    print i;
}
```

## Installation

```bash
npm install voxlang
```

## Usage

```typescript
import { compile, run } from 'voxlang';

// Compile to JavaScript
const js = compile(`
fn factorial(n) {
    if n <= 1 {
        return 1;
    }
    return n * factorial(n - 1);
}
print factorial(5);
`);

// Run directly
run(`
let x = 10;
print x * 2;
`);
```

## Architecture

```
Source Code
    ↓
  Lexer
    ↓
  Tokens
    ↓
  Parser
    ↓
   AST
    ↓
Code Generator
    ↓
JavaScript
```

## License

MIT
