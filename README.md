# VoxLang 🗣️

**A Custom Programming Language with Full Compiler Pipeline**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## Overview

VoxLang is a custom programming language with a complete compiler implementation:

1. **Lexer** - Tokenizes source code
2. **Parser** - Recursive descent parser building an AST
3. **AST** - Rich abstract syntax tree representation
4. **Code Generator** - Transpiles to JavaScript

### Example Program

```vox
// Functions
fn factorial(n) {
    if n <= 1 {
        return 1;
    }
    return n * factorial(n - 1);
}

// Variables and expressions
let x = 10;
let name = "World";

// Higher-order functions
fn apply(fn, value) {
    return fn(value);
}

// Classes (future)
fn Counter(initial) {
    return {
        count: initial,
        increment: fn(self) {
            self.count = self.count + 1;
        }
    };
}

print "Hello, " + name + "!";
print "Factorial of " + x + " is " + factorial(x);
```

## Why VoxLang?

- **Learn Compiler Design** - See how real compilers work
- **Simple Syntax** - Clean, expressive language design
- **Extensible** - Easy to add new features
- **JavaScript Interop** - Generates clean JS code

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VoxLang Compiler                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Source Code                                                 │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    LEXER                              │   │
│  │  - Tokenize source                                    │   │
│  │  - Handle keywords, operators, literals               │   │
│  │  - Track line/column positions                       │   │
│  └──────────────────────────┬────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    PARSER                             │   │
│  │  - Recursive descent parsing                          │   │
│  │  - Build AST nodes                                     │   │
│  │  - Handle precedence correctly                         │   │
│  └──────────────────────────┬────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                       AST                              │   │
│  │  - Program, FunctionDeclaration, IfStatement          │   │
│  │  - BinaryExpression, CallExpression, etc.            │   │
│  └──────────────────────────┬────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 CODE GENERATOR                        │   │
│  │  - Walk AST                                           │   │
│  │  - Generate JavaScript                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Language Specification

### Data Types

| Type | Example | Description |
|------|---------|-------------|
| Number | `42`, `3.14` | Integers and floats |
| String | `"hello"` | UTF-8 strings |
| Boolean | `true`, `false` | Boolean values |
| Nil | `nil` | Null value |
| Function | `fn(x) { ... }` | First-class functions |

### Operators

#### Arithmetic
```vox
let a = 10 + 5;   // Addition
let b = 10 - 5;   // Subtraction  
let c = 10 * 5;   // Multiplication
let d = 10 / 5;   // Division
let e = 10 % 3;   // Modulo
```

#### Comparison
```vox
10 == 10   // Equality
10 != 5    // Not equal
10 > 5     // Greater than
10 < 5     // Less than
10 >= 10   // Greater or equal
10 <= 5    // Less or equal
```

#### Logical
```vox
true and false   // Logical AND
true or false    // Logical OR
not true         // Logical NOT
```

### Control Flow

#### If/Else
```vox
if x > 10 {
    print "big";
} else if x > 5 {
    print "medium";
} else {
    print "small";
}
```

#### While Loop
```vox
let i = 0;
while i < 10 {
    print i;
    i = i + 1;
}
```

#### For Loop
```vox
for i = 0, 10 {
    print i;
}
```

### Functions

```vox
// Simple function
fn greet(name) {
    return "Hello, " + name + "!";
}

// Recursive function
fn factorial(n) {
    if n <= 1 {
        return 1;
    }
    return n * factorial(n - 1);
}

// Higher-order function
fn apply(fn, value) {
    return fn(value);
}

// Closures
fn makeAdder(x) {
    return fn(y) {
        return x + y;
    };
}

let add5 = makeAdder(5);
print add5(10);  // 15
```

## Installation

```bash
npm install voxlang
```

Or from source:

```bash
git clone https://github.com/moggan1337/VoxLang.git
cd VoxLang
npm install
npm run build
```

## Quick Start

### Compile to JavaScript

```typescript
import { compile } from 'voxlang';

const source = `
fn factorial(n) {
    if n <= 1 {
        return 1;
    }
    return n * factorial(n - 1);
}

print factorial(5);
`;

const js = compile(source);
console.log(js);
```

Output:
```javascript
function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
console.log(factorial(5));
```

### Run Directly

```typescript
import { run } from 'voxlang';

run(`
let x = 10;
print x * 2;
`);

// Output: 20
```

## API Reference

### Lexer

```typescript
import { Lexer, TokenType } from 'voxlang';

const lexer = new Lexer(source);
const tokens = lexer.tokenize();

tokens.forEach(token => {
    console.log(TokenType[token.type], token.value);
});
```

### Parser

```typescript
import { Parser } from 'voxlang';

const parser = new Parser(tokens);
const ast = parser.parse();

console.log(JSON.stringify(ast, null, 2));
```

### Code Generator

```typescript
import { CodeGenerator } from 'voxlang';

const codegen = new CodeGenerator();
const js = codegen.generate(ast);

console.log(js);
```

## AST Node Types

| Node Type | Properties | Description |
|-----------|------------|-------------|
| `Program` | `body: Statement[]` | Root node |
| `FunctionDeclaration` | `name, params, body` | Function definition |
| `LetStatement` | `name, value` | Variable declaration |
| `IfStatement` | `condition, consequent, alternate` | Conditional |
| `WhileStatement` | `condition, body` | While loop |
| `ForStatement` | `variable, start, end, body` | For loop |
| `ReturnStatement` | `value` | Return statement |
| `PrintStatement` | `argument` | Print expression |
| `BinaryExpression` | `operator, left, right` | Binary operation |
| `UnaryExpression` | `operator, operand` | Unary operation |
| `CallExpression` | `callee, arguments` | Function call |
| `NumberLiteral` | `value` | Number literal |
| `StringLiteral` | `value` | String literal |
| `BooleanLiteral` | `value` | Boolean literal |
| `Identifier` | `name` | Variable reference |

## Example Programs

### Fibonacci

```vox
fn fibonacci(n) {
    if n <= 1 {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

for i = 0, 10 {
    print fibonacci(i);
}
```

### Map/Filter/Reduce

```vox
fn double(x) {
    return x * 2;
}

fn isEven(x) {
    return x % 2 == 0;
}

let numbers = [1, 2, 3, 4, 5];

// Map
let doubled = [];
for i = 0, len(numbers) {
    doubled = doubled + [double(numbers[i])];
}

// Filter
let evens = [];
for i = 0, len(numbers) {
    if isEven(numbers[i]) {
        evens = evens + [numbers[i]];
    }
}

print doubled;  // [2, 4, 6, 8, 10]
print evens;    // [2, 4]
```

### Quicksort

```vox
fn partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    let j = low;
    while j < high {
        if arr[j] < pivot {
            i = i + 1;
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        j = j + 1;
    }
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}

fn quicksort(arr, low, high) {
    if low < high {
        let pi = partition(arr, low, high);
        quicksort(arr, low, pi - 1);
        quicksort(arr, pi + 1, high);
    }
}

let arr = [64, 34, 25, 12, 22, 11, 90];
quicksort(arr, 0, len(arr) - 1);
print arr;
```

## Development

### Project Structure

```
voxlang/
├── src/
│   └── index.ts    # All compiler stages
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build    # Compile TypeScript
npm run test     # Run tests
```

### Extending the Language

#### Adding a New Operator

1. Add token type in `TokenType` enum
2. Add lexer recognition in `Lexer.tokenize()`
3. Add parser rule in `Parser`
4. Add code generation in `CodeGenerator.generate()`

#### Adding a New Statement Type

1. Create AST node interface in `ASTNode`
2. Add parser rule in `Parser.parseStatement()`
3. Add code generation in `CodeGenerator`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License

## Resources

- [Crafting Interpreters](https://craftinginterpreters.com/) - Excellent book on language design
- [Writing an Interpreter in Go](https://interpreterbook.com/) - Thorsten Ball's excellent book
- [LLVM Tutorial](https://llvm.org/docs/tutorial/) - Building a language with LLVM
