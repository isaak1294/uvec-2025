/*---------------------------------------------------------
  Beginner-Friendly SVG Language Interpreter (TypeScript)
  ---------------------------------------------------------
  Features:
  - Variables: let/set
  - Loops: "repeat N times", "repeat <update> until <cond>"
  - Drawing primitives + style
  - Expressions: numbers, strings, booleans, + - * / %, comparisons, and/or/not
  - Returns SVG string
---------------------------------------------------------*/

type Num = number;
type Str = string;
type Bool = boolean;
type Value = number | string | boolean | null | { __fn: FnDef }; // ← add function
type FnParam = { name: string; default?: Expr };
type FnDef = { params: FnParam[]; body: Stmt[]; closure: Env };

function isNumber(v: Value): v is number { return typeof v === "number"; }
function isString(v: Value): v is string { return typeof v === "string"; }
function isBool(v: Value): v is boolean { return typeof v === "boolean"; }

class RuntimeError extends Error { }
class ReturnSignal extends Error {
    constructor(public value: Value) {
        super("return");
    }
}

enum TokType {
    Number, String, Ident,
    Newline, Colon,
    LParen, RParen, Comma,
    Eq, Ne, Lt, Le, Gt, Ge,
    Plus, Minus, Star, Slash, Percent,
    Assign, // '=' only used internally if needed
    End, EOF
}

interface Token {
    t: TokType;
    v?: string;
    line: number;
    col: number;
}

/** Keywords are matched case-insensitively, but identifiers keep case. */
const KW = {
    LET: "let",
    BE: "be",
    SET: "set",
    TO: "to",
    IF: "if",
    GIVE: "give",
    BACK: "back",
    OTHERWISE: "otherwise",
    END: "end",
    REPEAT: "repeat",
    TIMES: "times",
    AS: "as",
    UNTIL: "until",
    TRUE: "true",
    FALSE: "false",
    AND: "and",
    OR: "or",
    NOT: "not",
    START: "start",
    FINISH: "finish",
    SVG: "svg",
    WIDTH: "width",
    HEIGHT: "height",
    USE: "use",
    NO: "no",
    FILL: "fill",
    STROKE: "stroke",
    LINE: "line",
    FROM: "from",
    TO_DIR: "to", // directional 'to' in "line from ... to ..."
    AT: "at",
    RADIUS: "radius",
    RECT: "rect",
    CIRCLE: "circle",
    TEXT: "text",
    SIZE: "size",
    PRINT: "print",
    RETURN: "return",
};

type Kw = keyof typeof KW;

function isAlpha(ch: string) {
    return /[A-Za-z_]/.test(ch);
}
function isDigit(ch: string) {
    return /[0-9]/.test(ch);
}
function isAlnum(ch: string) {
    return /[A-Za-z0-9_]/.test(ch);
}

class Lexer {
    private i = 0;
    private line = 1;
    private col = 1;

    constructor(private src: string) { }

    private peek(): string { return this.src[this.i] ?? ""; }
    private next(): string {
        const ch = this.src[this.i++] ?? "";
        if (ch === "\n") { this.line++; this.col = 1; } else { this.col++; }
        return ch;
    }
    private makeToken(t: TokType, v?: string): Token {
        return { t, v, line: this.line, col: this.col };
    }

    tokenize(): Token[] {
        const toks: Token[] = [];
        while (true) {
            const ch = this.peek();

            if (!ch) { toks.push({ t: TokType.EOF, line: this.line, col: this.col }); break; }

            // Whitespace
            if (ch === ' ' || ch === '\t' || ch === '\r') { this.next(); continue; }

            // Newline
            if (ch === '\n') { this.next(); toks.push({ t: TokType.Newline, line: this.line - 1, col: 1 }); continue; }

            // Comments: start with '#'
            if (ch === '#') {
                while (this.peek() && this.peek() !== '\n') this.next();
                continue;
            }

            // Numbers
            if (isDigit(ch) || (ch === '.' && isDigit(this.src[this.i + 1] ?? ''))) {
                let s = "";
                let dot = false;
                while (isDigit(this.peek()) || (this.peek() === '.' && !dot)) {
                    if (this.peek() === '.') dot = true;
                    s += this.next();
                }
                toks.push({ t: TokType.Number, v: s, line: this.line, col: this.col });
                continue;
            }

            // Strings: "..."
            if (ch === '"') {
                this.next();
                let s = "";
                while (this.peek() && this.peek() !== '"') {
                    if (this.peek() === '\\') { // simple escapes
                        this.next();
                        const esc = this.next();
                        const map: Record<string, string> = { 'n': '\n', 't': '\t', '"': '"', '\\': '\\' };
                        s += map[esc] ?? esc;
                    } else {
                        s += this.next();
                    }
                }
                if (this.peek() !== '"') throw new RuntimeError(`Unclosed string at ${this.line}:${this.col}`);
                this.next(); // consume closing "
                toks.push({ t: TokType.String, v: s, line: this.line, col: this.col });
                continue;
            }

            // Ident / Keyword (case-insensitive match to keywords)
            if (isAlpha(ch)) {
                let s = "";
                while (isAlnum(this.peek())) s += this.next();
                const lower = s.toLowerCase();

                // multi-word lookahead for phrases like "no fill", "use fill", "line from", etc.
                // We keep them as idents/keywords but parsing will check sequences in order.

                // Operators / punctuation
                if (lower === KW.END) { toks.push({ t: TokType.End, v: s, line: this.line, col: this.col }); continue; }

                toks.push({ t: TokType.Ident, v: s, line: this.line, col: this.col });
                continue;
            }

            // Operators & punctuation
            switch (ch) {
                case ':': this.next(); toks.push({ t: TokType.Colon, line: this.line, col: this.col }); break;
                case '(': this.next(); toks.push({ t: TokType.LParen, line: this.line, col: this.col }); break;
                case ')': this.next(); toks.push({ t: TokType.RParen, line: this.line, col: this.col }); break;
                case ',': this.next(); toks.push({ t: TokType.Comma, line: this.line, col: this.col }); break;
                case '+': this.next(); toks.push({ t: TokType.Plus, line: this.line, col: this.col }); break;
                case '-': this.next(); toks.push({ t: TokType.Minus, line: this.line, col: this.col }); break;
                case '*': this.next(); toks.push({ t: TokType.Star, line: this.line, col: this.col }); break;
                case '/': this.next(); toks.push({ t: TokType.Slash, line: this.line, col: this.col }); break;
                case '%': this.next(); toks.push({ t: TokType.Percent, line: this.line, col: this.col }); break;
                case '=':
                    this.next();
                    if (this.peek() === '=') { this.next(); toks.push({ t: TokType.Eq, line: this.line, col: this.col }); }
                    else { toks.push({ t: TokType.Assign, line: this.line, col: this.col }); }
                    break;
                case '!':
                    this.next();
                    if (this.peek() === '=') { this.next(); toks.push({ t: TokType.Ne, line: this.line, col: this.col }); }
                    else throw new RuntimeError(`Unexpected '!' at ${this.line}:${this.col}`);
                    break;
                case '<':
                    this.next();
                    if (this.peek() === '=') { this.next(); toks.push({ t: TokType.Le, line: this.line, col: this.col }); }
                    else { toks.push({ t: TokType.Lt, line: this.line, col: this.col }); }
                    break;
                case '>':
                    this.next();
                    if (this.peek() === '=') { this.next(); toks.push({ t: TokType.Ge, line: this.line, col: this.col }); }
                    else { toks.push({ t: TokType.Gt, line: this.line, col: this.col }); }
                    break;
                default:
                    throw new RuntimeError(`Unexpected character '${ch}' at ${this.line}:${this.col}`);
            }
        }
        return toks;
    }
}

/* =======================
   AST Nodes (minimal set)
======================= */

function isFn(v: Value): v is { __fn: FnDef } {
    return typeof v === "object" && v !== null && "__fn" in v;
}

// Stmt additions
type Stmt =
    | { k: "VarDecl", name: string, expr: Expr }
    | { k: "Assign", name: string, expr: Expr }
    | { k: "Print", expr: Expr }
    | { k: "RepeatTimes", count: Expr, asVar?: string, body: Stmt[] }
    | { k: "RepeatUntil", update: Stmt, cond: Expr, body: Stmt[] }
    | { k: "If", branches: { cond: Expr, body: Stmt[] }[], elseBody?: Stmt[] }
    | { k: "FnDef", name: string, params: FnParam[], body: Stmt[] }
    | { k: "Return", expr?: Expr }
    | { k: "DrawCircle", x: Expr, y: Expr, r: Expr }
    | { k: "DrawRect", x: Expr, y: Expr, w: Expr, h: Expr }
    | { k: "DrawLine", x1: Expr, y1: Expr, x2: Expr, y2: Expr }
    | { k: "DrawText", text: Expr, x: Expr, y: Expr, size?: Expr }
    | { k: "UseFill", color: Expr }
    | { k: "UseStroke", color: Expr, width: Expr }
    | { k: "NoFill" }
    | { k: "NoStroke" }
    | { k: "StartSvg", width: Expr, height: Expr }
    | { k: "FinishSvg" };

// Expr additions
type Expr =
    | { k: "Num", v: number }
    | { k: "Str", v: string }
    | { k: "Bool", v: boolean }
    | { k: "Var", name: string }
    | { k: "Call", callee: string, args: { name?: string, expr: Expr }[] } // ← new
    | { k: "Unary", op: "neg" | "not", right: Expr }
    | { k: "Binary", op: string, left: Expr, right: Expr }
    | { k: "Group", inner: Expr };


/* =======================
   Parser (recursive descent)
======================= */

class Parser {
    private i = 0;
    constructor(private toks: Token[]) { }

    private peek(): Token { return this.toks[this.i] ?? this.toks[this.toks.length - 1]; }
    private match(...types: TokType[]): boolean {
        if (types.includes(this.peek().t)) { this.i++; return true; }
        return false;
    }
    private expect(t: TokType, msg: string): Token {
        if (this.peek().t === t) return this.toks[this.i++];
        throw new RuntimeError(`Parse error: ${msg} at ${this.peek().line}:${this.peek().col}`);
    }

    private isKW(tok: Token, kw: string): boolean {
        return tok.t === TokType.Ident && tok.v?.toLowerCase() === kw;
    }
    private eatKW(kw: string): boolean {
        if (this.isKW(this.peek(), kw)) { this.i++; return true; }
        return false;
    }
    private expectKW(kw: string, msg: string) {
        if (!this.eatKW(kw)) throw new RuntimeError(`Parse error: expected '${kw}' ${msg} at ${this.peek().line}:${this.peek().col}`);
    }
    private parseParamList(): FnParam[] {
        this.expect(TokType.LParen, "after function name");
        const params: FnParam[] = [];
        if (this.peek().t !== TokType.RParen) {
            while (true) {
                const nameTok = this.expect(TokType.Ident, "parameter name");
                let def: Expr | undefined;
                if (this.match(TokType.Assign)) {          // support default: a = 0
                    def = this.expression();
                }
                params.push({ name: nameTok.v!, default: def });
                if (!this.match(TokType.Comma)) break;
            }
        }
        this.expect(TokType.RParen, "closing ')'");
        return params;
    }
    private parseArgList(): { name?: string, expr: Expr }[] {
        this.expect(TokType.LParen, "after function name");
        const args: { name?: string, expr: Expr }[] = [];
        if (this.peek().t !== TokType.RParen) {
            while (true) {
                // named arg?  name = expr
                if (this.peek().t === TokType.Ident && this.toks[this.i + 1]?.t === TokType.Assign) {
                    const nameTok = this.toks[this.i++]; // ident
                    this.i++; // '='
                    const expr = this.expression();
                    args.push({ name: nameTok.v!, expr });
                } else {
                    args.push({ expr: this.expression() });
                }
                if (!this.match(TokType.Comma)) break;
            }
        }
        this.expect(TokType.RParen, "closing ')'");
        return args;
    }



    parseProgram(): Stmt[] {
        const stmts: Stmt[] = [];
        while (this.peek().t !== TokType.EOF) {
            if (this.peek().t === TokType.Newline) { this.i++; continue; }
            stmts.push(this.statement());
            // optional newline(s)
            while (this.peek().t === TokType.Newline) this.i++;
        }
        return stmts;
    }

    private statement(): Stmt {
        const tok = this.peek();

        // let <name> be <expr>
        if (this.isKW(tok, KW.LET)) {
            this.i++;
            const nameTok = this.expect(TokType.Ident, "variable name after 'let'");
            this.expectKW(KW.BE, "after variable name in 'let'");
            const expr = this.expression();
            return { k: "VarDecl", name: nameTok.v!, expr };
        }

        // set <name> to <expr>
        if (this.isKW(tok, KW.SET)) {
            this.i++;
            const nameTok = this.expect(TokType.Ident, "variable name after 'set'");
            this.expectKW(KW.TO, "after variable name in 'set'");
            const expr = this.expression();
            return { k: "Assign", name: nameTok.v!, expr };
        }

        // print <expr>
        if (this.isKW(tok, KW.PRINT)) {
            this.i++;
            const expr = this.expression();
            return { k: "Print", expr };
        }

        // start svg width W height H
        if (this.isKW(tok, KW.START)) {
            this.i++;
            this.expectKW(KW.SVG, "after 'start'");
            this.expectKW(KW.WIDTH, "after 'start svg'");
            const w = this.expression();
            this.expectKW(KW.HEIGHT, "after width value");
            const h = this.expression();
            return { k: "StartSvg", width: w, height: h };
        }

        // finish svg
        if (this.isKW(tok, KW.FINISH)) {
            this.i++;
            this.expectKW(KW.SVG, "after 'finish'");
            return { k: "FinishSvg" };
        }

        // use fill "color"
        if (this.isKW(tok, KW.USE)) {
            this.i++;
            if (this.eatKW(KW.FILL)) {
                const color = this.expression();
                return { k: "UseFill", color };
            }
            if (this.eatKW(KW.STROKE)) {
                const color = this.expression();
                this.expectKW(KW.WIDTH, "after 'use stroke <color>'");
                const width = this.expression();
                return { k: "UseStroke", color, width };
            }
            throw new RuntimeError(`Expected 'fill' or 'stroke' after 'use' at ${this.peek().line}:${this.peek().col}`);
        }

        // no fill / no stroke
        if (this.isKW(tok, KW.NO)) {
            this.i++;
            if (this.eatKW(KW.FILL)) return { k: "NoFill" };
            if (this.eatKW(KW.STROKE)) return { k: "NoStroke" };
            throw new RuntimeError(`Expected 'fill' or 'stroke' after 'no' at ${this.peek().line}:${this.peek().col}`);
        }

        // circle at (x, y) radius r
        if (this.isKW(tok, KW.CIRCLE)) {
            this.i++;
            this.expectKW(KW.AT, "after 'circle'");
            this.expect(TokType.LParen, "after 'at'");
            const x = this.expression();
            this.expect(TokType.Comma, "between x and y");
            const y = this.expression();
            this.expect(TokType.RParen, "after (x, y)");
            this.expectKW(KW.RADIUS, "after circle position");
            const r = this.expression();
            return { k: "DrawCircle", x, y, r };
        }

        // rect at (x, y) width w height h
        if (this.isKW(tok, KW.RECT)) {
            this.i++;
            this.expectKW(KW.AT, "after 'rect'");
            this.expect(TokType.LParen, "after 'at'");
            const x = this.expression();
            this.expect(TokType.Comma, "between x and y");
            const y = this.expression();
            this.expect(TokType.RParen, "after (x, y)");
            this.expectKW(KW.WIDTH, "after rect position");
            const w = this.expression();
            this.expectKW(KW.HEIGHT, "after width value");
            const h = this.expression();
            return { k: "DrawRect", x, y, w, h };
        }

        // line from (x1, y1) to (x2, y2)
        if (this.isKW(tok, KW.LINE)) {
            this.i++;
            this.expectKW(KW.FROM, "after 'line'");
            this.expect(TokType.LParen, "after 'from'");
            const x1 = this.expression();
            this.expect(TokType.Comma, "between x1 and y1");
            const y1 = this.expression();
            this.expect(TokType.RParen, "after (x1, y1)");
            this.expectKW(KW.TO_DIR, "after line start");
            this.expect(TokType.LParen, "before destination");
            const x2 = this.expression();
            this.expect(TokType.Comma, "between x2 and y2");
            const y2 = this.expression();
            this.expect(TokType.RParen, "after (x2, y2)");
            return { k: "DrawLine", x1, y1, x2, y2 };
        }

        // text "hello" at (x, y) size 14   (size optional)
        if (this.isKW(tok, KW.TEXT)) {
            this.i++;
            const content = this.expression(); // string or expr
            this.expectKW(KW.AT, "after text content");
            this.expect(TokType.LParen, "after 'at'");
            const x = this.expression();
            this.expect(TokType.Comma, "between x and y");
            const y = this.expression();
            this.expect(TokType.RParen, "after (x, y)");
            let size: Expr | undefined;
            if (this.eatKW(KW.SIZE)) {
                size = this.expression();
            }
            return { k: "DrawText", text: content, x, y, size };
        }

        // to <name>(params): block end
        if (this.isKW(this.peek(), KW.TO)) {
            // disambiguate from 'set x to ...': here 'to' must be at statement start and followed by IDENT '('
            this.i++;
            const nameTok = this.expect(TokType.Ident, "function name after 'to'");
            // require '(' next to ensure it's a function def
            const params = this.parseParamList();
            this.expect(TokType.Colon, "':' after function header");
            const body = this.block();
            this.expect(TokType.End, "to close function");
            return { k: "FnDef", name: nameTok.v!, params, body };
        }

        // give back [expr]
        if (this.isKW(this.peek(), "give")) { // support two-word keyword "give back"
            this.i++;
            this.expectKW("back", "after 'give'");
            let expr: Expr | undefined;
            if (this.peek().t !== TokType.Newline && this.peek().t !== TokType.End) {
                expr = this.expression();
            }
            return { k: "Return", expr };
        }


        // if <cond> : block [ otherwise if <cond> : block ]* [ otherwise : block ] end
        if (this.isKW(tok, KW.IF)) {
            this.i++;
            const branches: { cond: Expr, body: Stmt[] }[] = [];

            // first branch
            const firstCond = this.expression();
            this.expect(TokType.Colon, "':' after if condition");
            const firstBody = this.block();
            branches.push({ cond: firstCond, body: firstBody });

            // zero or more "otherwise if"
            while (this.eatKW(KW.OTHERWISE)) {
                if (this.eatKW(KW.IF)) {
                    const cond = this.expression();
                    this.expect(TokType.Colon, "':' after otherwise if condition");
                    const body = this.block();
                    branches.push({ cond, body });
                } else {
                    // plain "otherwise"
                    this.expect(TokType.Colon, "':' after otherwise");
                    const elseBody = this.block();
                    this.expect(TokType.End, "to close 'if' block");
                    return { k: "If", branches, elseBody };
                }
            }

            this.expect(TokType.End, "to close 'if' block");
            return { k: "If", branches };
        }


        // repeat N times [as i]: ... end
        if (this.isKW(tok, KW.REPEAT)) {
            this.i++;
            // form A: repeat <count> times [as <ident>]: block end
            // form B: repeat <update> until <cond>: block end
            // Decide by peeking for keyword 'times' or 'until'
            const saveI = this.i;

            try {
                const count = this.expression();
                // try "times"
                if (this.eatKW(KW.TIMES)) {
                    let asVar: string | undefined;
                    if (this.eatKW(KW.AS)) {
                        const nameTok = this.expect(TokType.Ident, "loop index after 'as'");
                        asVar = nameTok.v!;
                    }
                    this.expect(TokType.Colon, "':' to start loop body");
                    const body = this.block();
                    this.expect(TokType.End, "to close 'repeat ... times'");
                    return { k: "RepeatTimes", count, asVar, body };
                }
                // else maybe "until" (rollback)
                this.i = saveI;
            } catch {
                // rollback for until parse
                this.i = saveI;
            }

            // parse "repeat <update> until <cond>: body end"
            const update = this.simpleUpdateStmt();
            this.expectKW(KW.UNTIL, "in 'repeat ... until ...'");
            const cond = this.expression();
            this.expect(TokType.Colon, "':' to start loop body");
            const body = this.block();
            this.expect(TokType.End, "to close 'repeat ... until'");
            return { k: "RepeatUntil", update, cond, body };
        }

        throw new RuntimeError(`Unexpected token '${tok.v ?? TokType[tok.t]}' at ${tok.line}:${tok.col}`);
    }

    private block(): Stmt[] {
        const out: Stmt[] = [];
        while (true) {
            const tok = this.peek();
            if (tok.t === TokType.EOF) break;
            if (tok.t === TokType.Newline) { this.i++; continue; }

            // IMPORTANT: stop the block when we reach "end" or "otherwise"
            if (tok.t === TokType.End) break;
            if (this.isKW(tok, KW.OTHERWISE)) break;

            out.push(this.statement());
            while (this.peek().t === TokType.Newline) this.i++;
        }
        return out;
    }


    private simpleUpdateStmt(): Stmt {
        // Only allow:
        //   set <name> to <expr>
        //   <name> be <expr>   (as shorthand inside repeat-until)
        //   let <name> be <expr>
        // We’ll parse a subset to keep it unambiguous.
        const tok = this.peek();
        if (this.isKW(tok, KW.LET)) {
            this.i++;
            const nameTok = this.expect(TokType.Ident, "variable name after 'let'");
            this.expectKW(KW.BE, "after variable name");
            const expr = this.expression();
            return { k: "VarDecl", name: nameTok.v!, expr };
        }
        if (this.isKW(tok, KW.SET)) {
            this.i++;
            const nameTok = this.expect(TokType.Ident, "variable name after 'set'");
            this.expectKW(KW.TO, "after variable name");
            const expr = this.expression();
            return { k: "Assign", name: nameTok.v!, expr };
        }
        // shorthand: "<ident> be <expr>"
        if (tok.t === TokType.Ident) {
            const nameTok = this.toks[this.i++]; // consume ident
            this.expectKW(KW.BE, "after variable name");
            const expr = this.expression();
            return { k: "Assign", name: nameTok.v!, expr };
        }
        throw new RuntimeError(`Expected update statement before 'until' at ${tok.line}:${tok.col}`);
    }

    /* ===== Expressions =====
       Precedence (low→high):
       or
       and
       equality (== !=)
       comparison (< <= > >=)
       term (+ -)
       factor (* / %)
       unary (- not)
       primary
    ========================= */

    private expression(): Expr { return this.parseOr(); }

    private parseOr(): Expr {
        let left = this.parseAnd();
        while (this.eatKW(KW.OR)) {
            const right = this.parseAnd();
            left = { k: "Binary", op: "or", left, right };
        }
        return left;
    }
    private parseAnd(): Expr {
        let left = this.parseEquality();
        while (this.eatKW(KW.AND)) {
            const right = this.parseEquality();
            left = { k: "Binary", op: "and", left, right };
        }
        return left;
    }
    private parseEquality(): Expr {
        let left = this.parseComparison();
        while (true) {
            if (this.match(TokType.Eq)) {
                const right = this.parseComparison();
                left = { k: "Binary", op: "==", left, right };
            } else if (this.match(TokType.Ne)) {
                const right = this.parseComparison();
                left = { k: "Binary", op: "!=", left, right };
            } else break;
        }
        return left;
    }
    private parseComparison(): Expr {
        let left = this.parseTerm();
        while (true) {
            if (this.match(TokType.Lt)) {
                const right = this.parseTerm(); left = { k: "Binary", op: "<", left, right };
            } else if (this.match(TokType.Le)) {
                const right = this.parseTerm(); left = { k: "Binary", op: "<=", left, right };
            } else if (this.match(TokType.Gt)) {
                const right = this.parseTerm(); left = { k: "Binary", op: ">", left, right };
            } else if (this.match(TokType.Ge)) {
                const right = this.parseTerm(); left = { k: "Binary", op: ">=", left, right };
            } else break;
        }
        return left;
    }
    private parseTerm(): Expr {
        let left = this.parseFactor();
        while (true) {
            if (this.match(TokType.Plus)) {
                const right = this.parseFactor(); left = { k: "Binary", op: "+", left, right };
            } else if (this.match(TokType.Minus)) {
                const right = this.parseFactor(); left = { k: "Binary", op: "-", left, right };
            } else break;
        }
        return left;
    }
    private parseFactor(): Expr {
        let left = this.parseUnary();
        while (true) {
            if (this.match(TokType.Star)) {
                const right = this.parseUnary(); left = { k: "Binary", op: "*", left, right };
            } else if (this.match(TokType.Slash)) {
                const right = this.parseUnary(); left = { k: "Binary", op: "/", left, right };
            } else if (this.match(TokType.Percent)) {
                const right = this.parseUnary(); left = { k: "Binary", op: "%", left, right };
            } else break;
        }
        return left;
    }
    private parseUnary(): Expr {
        if (this.match(TokType.Minus)) {
            const right = this.parseUnary(); return { k: "Unary", op: "neg", right };
        }
        if (this.eatKW(KW.NOT)) {
            const right = this.parseUnary(); return { k: "Unary", op: "not", right };
        }
        return this.parsePrimary();
    }
    private parsePrimary(): Expr {
        const tok = this.peek();
        if (tok.t === TokType.Number) { this.i++; return { k: "Num", v: Number(tok.v!) }; }
        if (tok.t === TokType.String) { this.i++; return { k: "Str", v: tok.v ?? "" }; }
        if (this.isKW(tok, KW.TRUE)) { this.i++; return { k: "Bool", v: true }; }
        if (this.isKW(tok, KW.FALSE)) { this.i++; return { k: "Bool", v: false }; }
        if (tok.t === TokType.Ident) {
            this.i++;
            // call?
            if (this.peek().t === TokType.LParen) {
                const args = this.parseArgList();
                return { k: "Call", callee: tok.v!, args };
            }
            return { k: "Var", name: tok.v! };
        }

        if (this.match(TokType.LParen)) {
            const inner = this.expression();
            this.expect(TokType.RParen, "closing ')'");
            return { k: "Group", inner };
        }
        throw new RuntimeError(`Unexpected token in expression at ${tok.line}:${tok.col}`);
    }
}

/* =======================
   Interpreter / SVG builder
======================= */

type Env = Map<string, Value>;
function childEnv(parent: Env): Env {
    const e = new Map<string, Value>();
    // Keep a back-reference to parent via a hidden key
    (e as any).__parent = parent;
    return e;
}
function getEnv(env: Env, name: string): Value | undefined {
    if (env.has(name)) return env.get(name);
    const p = (env as any).__parent as Env | undefined;
    return p ? getEnv(p, name) : undefined;
}
function setEnv(env: Env, name: string, v: Value): void {
    if (env.has(name)) { env.set(name, v); return; }
    const p = (env as any).__parent as Env | undefined;
    if (p) return setEnv(p, name, v);
    env.set(name, v); // define at top if not found (or throw; your call)
}


class SvgState {
    fill: string | null = "black";
    stroke: string | null = null;
    strokeWidth: number = 1;
}

class SvgBuilder {
    width: number = 300;
    height: number = 150;
    started = false;
    body: string[] = [];
    state = new SvgState();

    start(w: number, h: number) {
        this.started = true;
        this.width = w;
        this.height = h;
        this.body = [];
    }
    finish(): string {
        if (!this.started) throw new RuntimeError("You must 'start svg' before 'finish svg'.");
        const header = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">`;
        const content = this.body.join("\n");
        const tail = `</svg>`;
        return `${header}\n${content}\n${tail}`;
    }
    private attrs(extra: Record<string, string | number> = {}): string {
        const a: Record<string, string> = {};
        if (this.state.fill !== null) a.fill = this.state.fill;
        else a.fill = "none";
        if (this.state.stroke !== null) {
            a.stroke = this.state.stroke;
            a["stroke-width"] = String(this.state.strokeWidth);
        }
        for (const [k, v] of Object.entries(extra)) a[k] = String(v);
        return Object.entries(a).map(([k, v]) => `${k}="${escapeXml(String(v))}"`).join(" ");
    }
    circle(cx: number, cy: number, r: number) {
        this.body.push(`<circle ${this.attrs({ cx, cy, r })} />`);
    }
    rect(x: number, y: number, width: number, height: number) {
        this.body.push(`<rect ${this.attrs({ x, y, width, height })} />`);
    }
    line(x1: number, y1: number, x2: number, y2: number) {
        const base = this.attrs({ x1, y1, x2, y2 });
        // if no stroke set, default a stroke so lines are visible
        const enforceStroke = this.state.stroke === null ? ` stroke="black" stroke-width="1"` : ``;
        this.body.push(`<line ${base}${enforceStroke} />`);
    }
    text(x: number, y: number, txt: string, size?: number) {
        const base = this.attrs();
        const font = size ? ` font-size="${size}"` : ``;
        this.body.push(`<text x="${x}" y="${y}"${font} ${base}>${escapeXml(txt)}</text>`);
    }
}

function escapeXml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

class Interpreter {
    private env: Env = new Map<string, Value>();
    private svg = new SvgBuilder();
    private printSink: string[] = []; // for debugging or UI capture

    run(stmts: Stmt[]): string {
        for (const s of stmts) this.exec(s);
        // If user never called finish svg, auto-finish if started
        if (this.svg.started) return this.svg.finish();
        return ""; // or throw if you prefer
    }

    private exec(stmt: Stmt): void {
        switch (stmt.k) {
            case "VarDecl": {
                const v = this.eval(stmt.expr);
                this.env.set(stmt.name, v); // always defines in current env
                return;
            }
            case "Assign": {
                const v = this.eval(stmt.expr);
                setEnv(this.env, stmt.name, v); // assign to nearest ancestor env
                return;
            }
            case "Print": {
                const v = this.eval(stmt.expr);
                this.printSink.push(String(v));
                // eslint-disable-next-line no-console
                console.log(v);
                return;
            }
            case "UseFill": {
                const v = this.eval(stmt.color);
                if (!isString(v)) throw new RuntimeError(`fill color must be a string`);
                this.svg.state.fill = v;
                return;
            }
            case "UseStroke": {
                const c = this.eval(stmt.color);
                const w = this.eval(stmt.width);
                if (!isString(c)) throw new RuntimeError(`stroke color must be a string`);
                if (!isNumber(w)) throw new RuntimeError(`stroke width must be a number`);
                this.svg.state.stroke = c;
                this.svg.state.strokeWidth = w;
                return;
            }
            case "NoFill": this.svg.state.fill = null; return;
            case "NoStroke": this.svg.state.stroke = null; return;

            case "StartSvg": {
                const w = this.asNum(this.eval(stmt.width));
                const h = this.asNum(this.eval(stmt.height));
                this.svg.start(w, h);
                return;
            }
            case "FinishSvg": {
                // Calling finish just returns string at end; here it's no-op
                return;
            }
            case "DrawCircle": {
                this.svg.circle(
                    this.asNum(this.eval(stmt.x)),
                    this.asNum(this.eval(stmt.y)),
                    this.asNum(this.eval(stmt.r))
                );
                return;
            }
            case "DrawRect": {
                this.svg.rect(
                    this.asNum(this.eval(stmt.x)),
                    this.asNum(this.eval(stmt.y)),
                    this.asNum(this.eval(stmt.w)),
                    this.asNum(this.eval(stmt.h))
                );
                return;
            }
            case "DrawLine": {
                this.svg.line(
                    this.asNum(this.eval(stmt.x1)),
                    this.asNum(this.eval(stmt.y1)),
                    this.asNum(this.eval(stmt.x2)),
                    this.asNum(this.eval(stmt.y2))
                );
                return;
            }
            case "DrawText": {
                const txt = this.eval(stmt.text);
                if (!isString(txt)) throw new RuntimeError(`text content must be a string`);
                this.svg.text(
                    this.asNum(this.eval(stmt.x)),
                    this.asNum(this.eval(stmt.y)),
                    txt,
                    stmt.size ? this.asNum(this.eval(stmt.size)) : undefined
                );
                return;
            }
            case "RepeatTimes": {
                const n = Math.max(0, Math.floor(this.asNum(this.eval(stmt.count))));
                for (let k = 1; k <= n; k++) {
                    if (stmt.asVar) this.env.set(stmt.asVar, k);
                    else this.env.set("it", k);
                    for (const inner of stmt.body) this.exec(inner);
                }
                return;
            }
            case "If": {
                for (const br of stmt.branches) {
                    if (this.truthy(this.eval(br.cond))) {
                        for (const inner of br.body) this.exec(inner);
                        return;
                    }
                }
                if (stmt.elseBody) {
                    for (const inner of stmt.elseBody) this.exec(inner);
                }
                return;
            }
            case "FnDef": {
                const def: FnDef = { params: stmt.params, body: stmt.body, closure: this.env };
                // store function as a value in current env
                this.env.set(stmt.name, { __fn: def });
                return;
            }

            case "Return": {
                const val = stmt.expr ? this.eval(stmt.expr) : null;
                throw new ReturnSignal(val);
            }
            case "RepeatUntil": {
                // semantics: do { update; body } while (!cond)
                // Thus update runs BEFORE body on each iteration, and loop stops when condition becomes true
                const guard = () => this.truthy(this.eval(stmt.cond));
                while (true) {
                    // run update
                    this.exec(stmt.update);
                    // check condition — if now true, perform one body iteration and stop?
                    // Spec says: "loop continues while condition is false".
                    if (guard()) break;
                    for (const inner of stmt.body) this.exec(inner);
                }
                return;
            }
        }
    }

    private asNum(v: Value): number {
        if (!isNumber(v)) throw new RuntimeError(`Expected number, got ${typeof v}`);
        return v;
    }
    private truthy(v: Value): boolean {
        if (isBool(v)) return v;
        if (isNumber(v)) return v !== 0;
        if (isString(v)) return v.length > 0;
        return false;
    }

    private eval(expr: Expr): Value {
        switch (expr.k) {
            case "Num": return expr.v;
            case "Str": return expr.v;
            case "Bool": return expr.v;
            case "Var": {
                const v = getEnv(this.env, expr.name);
                if (typeof v === "undefined") throw new RuntimeError(`Undefined variable '${expr.name}'`);
                return v!;
            }

            case "Call": {
                const calleeVal = getEnv(this.env, expr.callee);
                if (typeof calleeVal === "undefined") throw new RuntimeError(`Undefined function '${expr.callee}'`);
                if (!isFn(calleeVal)) throw new RuntimeError(`'${expr.callee}' is not a function`);

                const { params, body, closure } = calleeVal.__fn;

                // Build call env: closure → call frame
                const callEnv = childEnv(closure);

                // Bind positional args
                let pos = 0;
                for (const arg of expr.args) {
                    if (!arg.name) {
                        if (pos >= params.length) throw new RuntimeError(`Too many arguments to ${expr.callee}`);
                        const p = params[pos++];
                        callEnv.set(p.name, this.eval(arg.expr));
                    }
                }

                // Apply defaults for remaining params
                for (let i = pos; i < params.length; i++) {
                    const p = params[i];
                    if (p.default !== undefined) callEnv.set(p.name, this.eval(p.default));
                }

                // Bind named args (override positional/defaults)
                for (const arg of expr.args) {
                    if (arg.name) {
                        const p = params.find(pp => pp.name === arg.name);
                        if (!p) throw new RuntimeError(`Unknown parameter '${arg.name}' for ${expr.callee}`);
                        callEnv.set(p.name, this.eval(arg.expr));
                    }
                }

                // Check all params bound
                for (const p of params) {
                    if (typeof callEnv.get(p.name) === "undefined")
                        throw new RuntimeError(`Missing argument '${p.name}' for ${expr.callee}`);
                }

                // Execute body with new env
                const prevEnv = this.env;
                this.env = callEnv;
                try {
                    for (const s of body) this.exec(s);
                    return null; // no return value
                } catch (r) {
                    if (r instanceof ReturnSignal) return r.value;
                    throw r;
                } finally {
                    this.env = prevEnv;
                }
            }

            case "Group": return this.eval(expr.inner);
            case "Unary": {
                const r = this.eval(expr.right);
                if (expr.op === "neg") {
                    if (!isNumber(r)) throw new RuntimeError(`Unary '-' expects a number`);
                    return -r;
                }
                if (expr.op === "not") return !this.truthy(r);
                throw new RuntimeError(`Unknown unary op ${expr.op}`);
            }
            case "Binary": {
                const a = this.eval(expr.left);
                const b = this.eval(expr.right);
                switch (expr.op) {
                    case "+": {
                        if (isNumber(a) && isNumber(b)) return a + b;
                        return String(a) + String(b);
                    }
                    case "-": { if (isNumber(a) && isNumber(b)) return a - b; break; }
                    case "*": { if (isNumber(a) && isNumber(b)) return a * b; break; }
                    case "/": { if (isNumber(a) && isNumber(b)) return a / b; break; }
                    case "%": { if (isNumber(a) && isNumber(b)) return a % b; break; }
                    case "==": return this.eq(a, b);
                    case "!=": return !this.eq(a, b);
                    case "<": case "<=": case ">": case ">=": {
                        if (isNumber(a) && isNumber(b)) {
                            if (expr.op === "<") return a < b;
                            if (expr.op === "<=") return a <= b;
                            if (expr.op === ">") return a > b;
                            if (expr.op === ">=") return a >= b;
                        }
                        throw new RuntimeError(`Comparison expects numbers`);
                    }
                    case "and": return this.truthy(a) && this.truthy(b);
                    case "or": return this.truthy(a) || this.truthy(b);
                }
                throw new RuntimeError(`Invalid operands for '${expr.op}'`);
            }
        }
    }

    private eq(a: Value, b: Value): boolean {
        if (typeof a !== typeof b) return false;
        return a === b;
    }
}

/* =======================
   Public API
======================= */

export function compileAndRenderSVG(source: string): string {
    const lex = new Lexer(source);
    const toks = lex.tokenize();
    const parser = new Parser(toks);
    const program = parser.parseProgram();
    const interp = new Interpreter();
    return interp.run(program);
}