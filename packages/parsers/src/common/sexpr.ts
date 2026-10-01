export type SExprAtom = {
  type: "atom";
  value: string;
};

export type SExprList = {
  type: "list";
  children: SExpr[];
};

export type SExpr = SExprAtom | SExprList;

export class SExprError extends Error {}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    const c = input[i];
    if (c === undefined) {
      break;
    }
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if (c === "(" || c === ")") {
      tokens.push(c);
      i += 1;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let value = "";
      let closed = false;
      while (j < input.length) {
        const ch = input[j];
        if (ch === '"') {
          closed = true;
          j += 1;
          break;
        }
        if (ch === "\\" && j + 1 < input.length) {
          value += input[j + 1];
          j += 2;
          continue;
        }
        value += ch;
        j += 1;
      }
      if (!closed) {
        throw new SExprError(`unterminated string at index ${i}`);
      }
      tokens.push(`"${value}"`);
      i = j;
      continue;
    }

    let j = i;
    while (j < input.length && !/\s/.test(input[j] ?? "") && input[j] !== "(" && input[j] !== ")") {
      j += 1;
    }
    tokens.push(input.slice(i, j));
    i = j;
  }

  return tokens;
}

function parseTokens(tokens: string[], position: { index: number }, depth = 0): SExpr {
  if (position.index >= tokens.length) {
    throw new SExprError("unexpected end of input");
  }

  const token = tokens[position.index];

  if (token === "(") {
    position.index += 1;
    const children: SExpr[] = [];
    while (true) {
      if (position.index >= tokens.length) {
        throw new SExprError("unbalanced parens: missing ')'");
      }
      if (tokens[position.index] === ")") {
        position.index += 1;
        break;
      }
      children.push(parseTokens(tokens, position, depth + 1));
    }
    return { type: "list", children };
  }

  position.index += 1;
  if (token === ")") {
    throw new SExprError("unexpected ')'");
  }
  if (token === undefined) {
    throw new SExprError("unexpected end of input");
  }
  const value = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
  return { type: "atom", value };
}

export function parseSExpr(input: string): SExpr {
  const tokens = tokenize(input);
  const position = { index: 0 };
  const sexpr = parseTokens(tokens, position);
  if (position.index < tokens.length) {
    throw new SExprError("trailing tokens after top-level expression");
  }
  return sexpr;
}

export function isList(node: SExpr | undefined): node is SExprList {
  return node !== undefined && node.type === "list";
}

export function asList(node: SExpr | undefined): SExprList {
  if (!isList(node)) {
    throw new SExprError("expected a list");
  }
  return node;
}

export function childrenOf(node: SExpr | undefined): SExprList {
  return asList(node);
}

export function headAtom(list: SExprList, name: string): string | undefined {
  for (const child of list.children) {
    if (child.type === "atom" && child.value === name) {
      return child.value;
    }
  }
  return undefined;
}

export function findChild(list: SExprList, name: string): SExprList | undefined {
  return list.children.find((child) => child.type === "list" && (child.children[0]?.type === "atom" ? child.children[0].value === name : false)) as
    | SExprList
    | undefined;
}

export function findChildren(list: SExprList, name: string): SExprList[] {
  return list.children.filter(
    (child) => child.type === "list" && child.children[0]?.type === "atom" && child.children[0].value === name
  ) as SExprList[];
}

export function atomValue(node: SExpr | undefined, index = 0): string | undefined {
  if (node?.type === "list") {
    const item = node.children[index];
    return item?.type === "atom" ? item.value : undefined;
  }
  return node?.type === "atom" ? node.value : undefined;
}

export function toNumber(node: SExpr | undefined, index = 0): number | null {
  const value = atomValue(node, index);
  if (value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}