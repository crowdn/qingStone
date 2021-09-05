const typeToElement = {
  paragraph: 'p',
  text: 'text',
  blockquote: 'blockquote',
  heading: 'h1',
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  heading4: 'h4',
  heading5: 'h5',
  heading6: 'h6',
  hr: 'hr',
};

export function creatNodeFromToken(token: TokenType) {
  if (token.type === 'text') {
    const node = document.createTextNode(token.text);
    node.data = token.text;
    return node;
  }
  // @ts-ignore
  return document.createElement(typeToElement[token.type]);
}

// 合并token
export function normalizeTokens(tokens: TokenType[]): TokenType[] {
  if (tokens.length === 0) return tokens;
  let list = [tokens.shift() as TokenType];
  for (const token of tokens) {
    let lastToken = list[list.length - 1];
    if (lastToken?.type === 'text' && token.type === 'text') {
      lastToken.text += token.text;
      continue;
    }
    list.push(token);
  }
  return list;
}
export function createTextToken(text = '') {
  return {
    text,
    type: 'text',
    raw: text,
  };
}

export function isBlock(token: TokenType) {
  return (
    token.type === 'paragraph' ||
    token.type === 'blockquote' ||
    token.type.startsWith('heading')
  );
}
export function createParagraphToken(text = ''): TokenType {
  let node = document.createElement('p');
  return {
    text: '',
    type: 'paragraph',
    raw: '',
    tokens: [createTextToken(text)],
  };
}
export function createBlockToken(type: string, text = ''): TokenType {
  return {
    text: '',
    type,
    raw: text,
    tokens: [createTextToken(text)],
  };
}
export function isMountedToken(
  token?: TokenType | null
): token is TokenMountedType {
  return !!token && !!token.node && !!token.parent;
}
