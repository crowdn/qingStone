// @ts-nocheck

import Editor from './COM/Editor';

String.prototype.splice = function (start, newStr) {
  return this.slice(0, start) + newStr + this.slice(start);
};

String.prototype.delete = function (index, len = 1) {
  return this.slice(0, index - len) + this.slice(index);
};

export function getSelectedText(obj) {
  // document.querySelector('.left').innerHTML = marked(md)
  return userSelection;
}

export function load() {
  const rootDom = document.getElementById('editor');
  window['editor'] = new Editor(rootDom);
}
