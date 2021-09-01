// @ts-nocheck

import Editor from './COM/Editor';

String.prototype.splice = function (start, newStr) {
  return this.slice(0, start) + newStr + this.slice(start);
};

String.prototype.delete = function (index, len = 1) {
  return this.slice(0, index - len) + this.slice(index);
};

function createTextToken(text) {
  return { text, type: 'text', raw: text };
}
function isBlock(token) {
  if (token.text === 'paragraph') return true;
  //   if(token.text === 'paragraph') return true
  return false;
}
function createParagraphToken(text = '') {
  return {
    text: '',
    type: 'paragraph',
    raw: '',
    tokens: [createTextToken(text)],
  };
}

const typeToElement = {
  paragraph: 'p',
  text: 'text',
  blockquote: 'blockquote',
  heading: 'h1',
  hr: 'hr',
};

function renderToken(token) {
  // if (token.type === "text") return document.createTextNode(token.text.replaceAll(" ", "&nbsp;"));
  if (token.type === 'text') {
    const node = document.createTextNode(token.text);
    node.data = token.text;
    return node;
  }
  return document.createElement(typeToElement[token.type]);
}

function normalizeTokens(tokens) {
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
let model = [createParagraphToken()];
let editor = null;

function render() {
  editor.innerHTML = '';
  const fragment = document.createDocumentFragment();
  function renderModel(token, parent) {
    const el = renderToken(token);
    // token
    token.node = el;
    token.parent = fragment === parent ? editor : parent;
    el._token = token;

    if (token.tokens && token.tokens.length) {
      token.tokens.forEach((t) => renderModel(t, el));
    }

    if (token.type !== 'text') {
      el.classList.add(`md-${token.type}`);
    }

    parent.appendChild(el);
  }
  model.forEach((token) => renderModel(token, fragment));
  editor.appendChild(fragment);
  //   renderModel(fragment)
}

export function getSelectedText(obj) {
  // document.querySelector('.left').innerHTML = marked(md)
  return userSelection;
}

export function load() {
  editor = document.getElementById('editor');
  new Editor(editor);
  render();
}
