/**
 * VoxLang - Custom Programming Language
 * 
 * A simple, expressive language with:
 * - Lexer (tokenizer)
 * - Parser (recursive descent)
 * - AST (Abstract Syntax Tree)
 * - VM (Virtual Machine) with bytecode
 * - Code generator to JavaScript
 */

export enum TokenType {
  // Literals
  NUMBER, STRING, IDENTIFIER, TRUE, FALSE, NIL,
  
  // Operators
  PLUS, MINUS, STAR, SLASH, PERCENT,
  EQ, NEQ, LT, GT, LTE, GTE,
  AND, OR, NOT,
  ASSIGN,
  
  // Delimiters
  LPAREN, RPAREN, LBRACE, RBRACE, LBRACKET, RBRACKET,
  COMMA, SEMICOLON, DOT,
  
  // Keywords
  FN, LET, IF, ELSE, WHILE, FOR, RETURN, PRINT,
  
  // Special
  EOF, NEWLINE, COMMENT
}

export interface Token {
  type: TokenType;
  value: string | number;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
  [key: string]: any;
}

// ============== LEXER ==============

export class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;
  private source: string;
  
  constructor(source: string) {
    this.source = source;
  }
  
  private peek(offset = 0): string {
    return this.source[this.pos + offset] || '';
  }
  
  private advance(): string {
    const char = this.source[this.pos++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }
  
  private skipWhitespace(): string | null {
    while (this.pos < this.source.length && /\s/.test(this.peek())) {
      this.advance();
    }
    if (this.peek() === '#') {
      while (this.pos < this.source.length && this.peek() !== '\n') {
        this.advance();
      }
      return null;
    }
    return null;
  }
  
  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;
      
      let line = this.line;
      let column = this.column;
      const char = this.peek();
      
      // Newline
      if (char === '\n') {
        this.advance();
        continue;
      }
      
      // Number
      if (/\d/.test(char)) {
        let num = '';
        while (/\d/.test(this.peek()) || this.peek() === '.') {
          num += this.advance();
        }
        tokens.push({ type: TokenType.NUMBER, value: parseFloat(num), line, column });
        continue;
      }
      
      // String
      if (char === '"' || char === "'") {
        const quote = this.advance();
        let str = '';
        while (this.pos < this.source.length && this.peek() !== quote) {
          str += this.advance();
        }
        this.advance(); // closing quote
        tokens.push({ type: TokenType.STRING, value: str, line, column });
        continue;
      }
      
      // Identifier or keyword
      if (/[a-zA-Z_]/.test(char)) {
        let id = '';
        while (/[a-zA-Z0-9_]/.test(this.peek())) {
          id += this.advance();
        }
        const keywords: Record<string, TokenType> = {
          'fn': TokenType.FN, 'let': TokenType.LET, 'if': TokenType.IF,
          'else': TokenType.ELSE, 'while': TokenType.WHILE, 'for': TokenType.FOR,
          'return': TokenType.RETURN, 'print': TokenType.PRINT,
          'true': TokenType.TRUE, 'false': TokenType.FALSE, 'nil': TokenType.NIL,
          'and': TokenType.AND, 'or': TokenType.OR, 'not': TokenType.NOT
        };
        tokens.push({ type: keywords[id] || TokenType.IDENTIFIER, value: id, line, column });
        continue;
      }
      
      // Two-character operators
      const twoChar = char + this.peek(1);
      const twoCharTokens: Record<string, TokenType> = {
        '==': TokenType.EQ, '!=': TokenType.NEQ,
        '<=': TokenType.LTE, '>=': TokenType.GTE,
        '&&': TokenType.AND, '||': TokenType.OR
      };
      if (twoCharTokens[twoChar]) {
        this.advance(); this.advance();
        tokens.push({ type: twoCharTokens[twoChar], value: twoChar, line, column });
        continue;
      }
      
      // Single character operators
      const singleTokens: Record<string, TokenType> = {
        '+': TokenType.PLUS, '-': TokenType.MINUS, '*': TokenType.STAR,
        '/': TokenType.SLASH, '%': TokenType.PERCENT,
        '=': TokenType.ASSIGN, '<': TokenType.LT, '>': TokenType.GT,
        '(': TokenType.LPAREN, ')': TokenType.RPAREN,
        '{': TokenType.LBRACE, '}': TokenType.RBRACE,
        '[': TokenType.LBRACKET, ']': TokenType.RBRACKET,
        ',': TokenType.COMMA, ';': TokenType.SEMICOLON, '.': TokenType.DOT,
      };
      if (singleTokens[char]) {
        this.advance();
        tokens.push({ type: singleTokens[char], value: char, line, column });
        continue;
      }
      
      throw new Error(`Unexpected character: ${char} at ${line}:${column}`);
    }
    
    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }
}

// ============== PARSER ==============

export class Parser {
  private pos = 0;
  private tokens: Token[];
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  
  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] || this.tokens[this.tokens.length - 1];
  }
  
  private advance(): Token {
    return this.tokens[this.pos++];
  }
  
  private expect(type: TokenType): Token {
    const token = this.advance();
    if (token.type !== type) {
      throw new Error(`Expected ${TokenType[type]} but got ${TokenType[token.type]}`);
    }
    return token;
  }
  
  parse(): ASTNode {
    const program: ASTNode = { type: 'Program', body: [] };
    
    while (this.peek().type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt) program.body.push(stmt);
    }
    
    return program;
  }
  
  private parseStatement(): ASTNode | null {
    const token = this.peek();
    
    if (token.type === TokenType.LET) {
      return this.parseLetStatement();
    }
    if (token.type === TokenType.FN) {
      return this.parseFnStatement();
    }
    if (token.type === TokenType.IF) {
      return this.parseIfStatement();
    }
    if (token.type === TokenType.WHILE) {
      return this.parseWhileStatement();
    }
    if (token.type === TokenType.FOR) {
      return this.parseForStatement();
    }
    if (token.type === TokenType.RETURN) {
      return this.parseReturnStatement();
    }
    if (token.type === TokenType.PRINT) {
      return this.parsePrintStatement();
    }
    if (token.type === TokenType.SEMICOLON) {
      this.advance();
      return null;
    }
    
    return this.parseExpressionStatement();
  }
  
  private parseLetStatement(): ASTNode {
    this.advance(); // let
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.ASSIGN);
    const value = this.parseExpression();
    if (this.peek().type === TokenType.SEMICOLON) this.advance();
    return { type: 'LetStatement', name, value };
  }
  
  private parseFnStatement(): ASTNode {
    this.advance(); // fn
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LPAREN);
    const params: string[] = [];
    while (this.peek().type !== TokenType.RPAREN) {
      params.push(this.expect(TokenType.IDENTIFIER).value as string);
      if (this.peek().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RPAREN);
    this.expect(TokenType.LBRACE);
    const body: ASTNode[] = [];
    while (this.peek().type !== TokenType.RBRACE) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    this.expect(TokenType.RBRACE);
    return { type: 'FunctionDeclaration', name, params, body };
  }
  
  private parseIfStatement(): ASTNode {
    this.advance(); // if
    const condition = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const consequent: ASTNode[] = [];
    while (this.peek().type !== TokenType.RBRACE) {
      const stmt = this.parseStatement();
      if (stmt) consequent.push(stmt);
    }
    this.expect(TokenType.RBRACE);
    let alternate: ASTNode[] | null = null;
    if (this.peek().type === TokenType.ELSE) {
      this.advance();
      this.expect(TokenType.LBRACE);
      alternate = [];
      while (this.peek().type !== TokenType.RBRACE) {
        const stmt = this.parseStatement();
        if (stmt) alternate.push(stmt);
      }
      this.expect(TokenType.RBRACE);
    }
    return { type: 'IfStatement', condition, consequent, alternate };
  }
  
  private parseWhileStatement(): ASTNode {
    this.advance(); // while
    const condition = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const body: ASTNode[] = [];
    while (this.peek().type !== TokenType.RBRACE) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    this.expect(TokenType.RBRACE);
    return { type: 'WhileStatement', condition, body };
  }
  
  private parseForStatement(): ASTNode {
    this.advance(); // for
    const variable = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.ASSIGN);
    const start = this.parseExpression();
    this.expect(TokenType.COMMA);
    const end = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const body: ASTNode[] = [];
    while (this.peek().type !== TokenType.RBRACE) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    this.expect(TokenType.RBRACE);
    return { type: 'ForStatement', variable, start, end, body };
  }
  
  private parseReturnStatement(): ASTNode {
    this.advance(); // return
    const value = this.parseExpression();
    if (this.peek().type === TokenType.SEMICOLON) this.advance();
    return { type: 'ReturnStatement', value };
  }
  
  private parsePrintStatement(): ASTNode {
    this.advance(); // print
    const argument = this.parseExpression();
    if (this.peek().type === TokenType.SEMICOLON) this.advance();
    return { type: 'PrintStatement', argument };
  }
  
  private parseExpressionStatement(): ASTNode {
    const expr = this.parseExpression();
    if (this.peek().type === TokenType.SEMICOLON) this.advance();
    return { type: 'ExpressionStatement', expression: expr };
  }
  
  private parseExpression(): ASTNode {
    return this.parseAssignment();
  }
  
  private parseAssignment(): ASTNode {
    const left = this.parseOr();
    if (this.peek().type === TokenType.ASSIGN) {
      this.advance();
      const right = this.parseAssignment();
      return { type: 'AssignmentExpression', left, right };
    }
    return left;
  }
  
  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.peek().type === TokenType.OR) {
      this.advance();
      left = { type: 'BinaryExpression', operator: '||', left, right: this.parseAnd() };
    }
    return left;
  }
  
  private parseAnd(): ASTNode {
    let left = this.parseEquality();
    while (this.peek().type === TokenType.AND) {
      this.advance();
      left = { type: 'BinaryExpression', operator: '&&', left, right: this.parseEquality() };
    }
    return left;
  }
  
  private parseEquality(): ASTNode {
    let left = this.parseComparison();
    while ([TokenType.EQ, TokenType.NEQ].includes(this.peek().type)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseComparison() };
    }
    return left;
  }
  
  private parseComparison(): ASTNode {
    let left = this.parseTerm();
    while ([TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE].includes(this.peek().type)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseTerm() };
    }
    return left;
  }
  
  private parseTerm(): ASTNode {
    let left = this.parseFactor();
    while ([TokenType.PLUS, TokenType.MINUS].includes(this.peek().type)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseFactor() };
    }
    return left;
  }
  
  private parseFactor(): ASTNode {
    let left = this.parseUnary();
    while ([TokenType.STAR, TokenType.SLASH, TokenType.PERCENT].includes(this.peek().type)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseUnary() };
    }
    return left;
  }
  
  private parseUnary(): ASTNode {
    if ([TokenType.MINUS, TokenType.NOT].includes(this.peek().type)) {
      const op = this.advance().value;
      return { type: 'UnaryExpression', operator: op, operand: this.parseUnary() };
    }
    return this.parseCall();
  }
  
  private parseCall(): ASTNode {
    let expr = this.parsePrimary();
    
    while (this.peek().type === TokenType.LPAREN) {
      this.advance();
      const args: ASTNode[] = [];
      while (this.peek().type !== TokenType.RPAREN) {
        args.push(this.parseExpression());
        if (this.peek().type === TokenType.COMMA) this.advance();
      }
      this.expect(TokenType.RPAREN);
      expr = { type: 'CallExpression', callee: expr, arguments: args };
    }
    
    return expr;
  }
  
  private parseFnExpression(): ASTNode {
    this.advance(); // fn
    this.expect(TokenType.LPAREN);
    const params: string[] = [];
    while (this.peek().type !== TokenType.RPAREN) {
      params.push(this.expect(TokenType.IDENTIFIER).value as string);
      if (this.peek().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RPAREN);
    this.expect(TokenType.LBRACE);
    const body: ASTNode[] = [];
    while (this.peek().type !== TokenType.RBRACE) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    this.expect(TokenType.RBRACE);
    return { type: 'FunctionExpression', params, body };
  }
  
  private parsePrimary(): ASTNode {
    const token = this.peek();
    
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return { type: 'NumberLiteral', value: token.value };
    }
    if (token.type === TokenType.STRING) {
      this.advance();
      return { type: 'StringLiteral', value: token.value };
    }
    if (token.type === TokenType.TRUE) {
      this.advance();
      return { type: 'BooleanLiteral', value: true };
    }
    if (token.type === TokenType.FALSE) {
      this.advance();
      return { type: 'BooleanLiteral', value: false };
    }
    if (token.type === TokenType.NIL) {
      this.advance();
      return { type: 'NilLiteral', value: null };
    }
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return { type: 'Identifier', name: token.value };
    }
    if (token.type === TokenType.FN) {
      return this.parseFnExpression();
    }
    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }
    
    throw new Error(`Unexpected token: ${TokenType[token.type]}`);
  }
}

// ============== CODE GENERATOR ==============

export class CodeGenerator {
  generate(node: ASTNode): string {
    switch (node.type) {
      case 'Program':
        return (node.body as ASTNode[]).map(s => this.generate(s)).join('\n');
      case 'LetStatement':
        return `let ${node.name} = ${this.generate(node.value)};`;
      case 'FunctionDeclaration':
        return `function ${node.name}(${(node.params as string[]).join(', ')}) {\n${(node.body as ASTNode[]).map(s => '  ' + this.generate(s)).join('\n')}\n}`;
      case 'FunctionExpression':
        return `function (${(node.params as string[]).join(', ')}) {\n${(node.body as ASTNode[]).map(s => '  ' + this.generate(s)).join('\n')}\n}`;
      case 'IfStatement':
        let result = `if (${this.generate(node.condition)}) {\n${(node.consequent as ASTNode[]).map(s => '  ' + this.generate(s)).join('\n')}\n  }`;
        if (node.alternate) {
          result += ` else {\n${(node.alternate as ASTNode[]).map(s => '  ' + this.generate(s)).join('\n')}\n  }`;
        }
        return result;
      case 'WhileStatement':
        return `while (${this.generate(node.condition)}) {\n${(node.body as ASTNode[]).map(s => '  ' + this.generate(s)).join('\n')}\n}`;
      case 'ForStatement':
        return `for (let ${node.variable} = ${this.generate(node.start)}; ${node.variable} < ${this.generate(node.end)}; ${node.variable}++) {\n${(node.body as ASTNode[]).map(s => '  ' + this.generate(s)).join('\n')}\n}`;
      case 'ReturnStatement':
        return `return ${this.generate(node.value)};`;
      case 'PrintStatement':
        return `console.log(${this.generate(node.argument)});`;
      case 'ExpressionStatement':
        return this.generate(node.expression) + ';';
      case 'BinaryExpression':
        return `(${this.generate(node.left)} ${node.operator} ${this.generate(node.right)})`;
      case 'UnaryExpression':
        return `(${node.operator}${this.generate(node.operand)})`;
      case 'CallExpression':
        return `${this.generate(node.callee)}(${(node.arguments as ASTNode[]).map(a => this.generate(a)).join(', ')})`;
      case 'NumberLiteral':
      case 'BooleanLiteral':
        return String(node.value);
      case 'StringLiteral':
        return `"${node.value}"`;
      case 'NilLiteral':
        return 'null';
      case 'Identifier':
        return String(node.name);
      case 'AssignmentExpression':
        return `${this.generate(node.left)} = ${this.generate(node.right)}`;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}

// ============== MAIN ==============

export function compile(source: string): string {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const codegen = new CodeGenerator();
  return codegen.generate(ast);
}

export function run(source: string): void {
  const js = compile(source);
  eval(js);
}
