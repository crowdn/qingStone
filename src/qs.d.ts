declare interface TokenType {
  text: string;
  type: string;
  raw: string;
  tokens?: TokenType[];
  // 指向对应的token对应node
  node: Node;
  // 指向父节点
  parent: Node;
}

declare interface LocationType {
  /** leaf节点对应的token*/
  token: TokenType;
  /** leaf节点对应的node */
  node: Node;
  /** Caret在当前node中的偏移 量*/
  offset: number;
}

declare interface RangeLocationType {
  start: LocationType;
  end: LocationType;
}
interface Node {
  _token: TokenType;
}
interface String {
  splice: (start: number, newStr: string) => string;
  delete: (index: number, len?: number) => string;
}
