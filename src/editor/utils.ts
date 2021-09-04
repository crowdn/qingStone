const typeToElement = {
  paragraph: 'p',
  text: 'text',
  blockquote: 'blockquote',
  heading: 'h1',
  hr: 'hr',
};

// @ts-ignore
export function creatNodeFromToken(token) {
  // if (token.type === "text") return document.createTextNode(token.text.replaceAll(" ", "&nbsp;"));
  if (token.type === 'text') {
    const node = document.createTextNode(token.text);
    node.data = token.text;
    return node;
  }
  // @ts-ignore
  return document.createElement(typeToElement[token.type]);
}
// @ts-ignore
export function normalizeTokens(tokens) {
  if (tokens.length === 0) return tokens;
  let list = [tokens.shift()];
  for (const token of tokens) {
    let lastToken = list[list.length - 1];
    if (lastToken.type === 'text' && token.type === 'text') {
      lastToken.text += token.text;
      continue;
    }
    list.push(token);
  }
  return list;
}
export function createTextToken(text = '', parent: Node) {
  return {
    text,
    type: 'text',
    raw: text,
    parent: parent,
    node: document.createTextNode(text),
  };
}
// @ts-ignore
export function isBlock(token) {
  if (token.text === 'paragraph') return true;
  //   if(token.text === 'paragraph') return true
  return false;
}
export function createParagraphToken(
  text = '',
  parent: HTMLElement
): TokenType {
  let node = document.createElement('p');
  return {
    text: '',
    type: 'paragraph',
    raw: '',
    parent,
    node,
    tokens: [createTextToken(text, node)],
  };
}
