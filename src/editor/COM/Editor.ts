// @ts-nocheck
import Selection from './Selection';
import Range from './Range';
import Point from './Point';

class Editor {
  constructor(editor) {
    if (!editor) throw 'undefined edtior';
    editor.addEventListener('beforeinput', this.beforeInput.bind(this));
  }
  beforeInput(event) {
    event.preventDefault();

    if (event.inputType === 'insertText') {
      this.insertText(event.data);
    }
    if (event.inputType === 'deleteContentBackward') {
      this.deleteContentBackward();
    }
    if (event.inputType === 'insertParagraph') {
      this.insertParagraph();
    }
    console.log(event.inputType, event.data);
  }

  insertText(text) {
    const { startPoint, endPoint, collapsed } = selection.range;
    if (!collapsed) return; // remove
    const token = startPoint.node._token;
    token.text = token.text.splice(startPoint.offset, text);

    // transform blocktoken
    // blocktoken.transform() or transformToken(blocktoken)

    // find block
    const curBlock = token.parent;
    const curBlockToken = curBlock._token;
    let curBlockParentTokens;
    if (curBlockToken.parent === editor) {
      curBlockParentTokens = model;
    } else {
      curBlockParentTokens = curBlockToken.parent._token.tokens;
    }

    if (token.text.indexOf('# ') > -1) {
      const i = token.text.indexOf('# ') + 2;
      token.text = token.text.slice(i);
      const offset = startPoint.offset - i + 1;
      curBlockToken.type = 'heading';
      render();
      selection.selection.setPosition(token.node, offset);
      return;
    }

    if (token.text.indexOf('> ') > -1) {
      const i = token.text.indexOf('> ') + 2;
      token.text = token.text.slice(i);
      const offset = startPoint.offset - i + 1;
      curBlockToken.type = 'blockquote';
      render();
      selection.selection.setPosition(token.node, offset);
      return;
    }

    // marked.lexer(token.text)

    render();
    selection.selection.setPosition(token.node, startPoint.offset + 1);
  }
  deleteContentBackward() {
    const { startPoint, endPoint, collapsed } = selection.range;
    if (!collapsed) return; // remove
    const token = startPoint.node._token;

    // removeBlock
    if (startPoint.offset === 0) {
      // find parent block , Need to be function
      const curBlock = token.parent;
      const curBlockToken = curBlock._token;

      if (curBlockToken.type !== 'paragraph') {
        curBlockToken.type = 'paragraph';
        render();
        selection.selection.setPosition(curBlockToken.node, 0);
        return;
      }

      let curBlockParentTokens;
      if (curBlockToken.parent === editor) {
        curBlockParentTokens = model;
      } else {
        curBlockParentTokens = curBlockToken.parent._token.tokens;
      }

      // remove old block
      const oldIndex = curBlockParentTokens.indexOf(curBlockToken);
      if (oldIndex === 0 && curBlockParentTokens === model) return; // only one no remove
      const beforeLastChildToken =
        curBlockParentTokens[oldIndex - 1].tokens[
          curBlockParentTokens[oldIndex - 1].tokens.length - 1
        ];
      const beforeLastChildTokenOffset = beforeLastChildToken.text.length;
      curBlockParentTokens.splice(oldIndex, 1);
      // megre right tokens
      curBlockParentTokens[oldIndex - 1].tokens = curBlockParentTokens[
        oldIndex - 1
      ].tokens.concat(curBlockToken.tokens);
      // normalize tokens
      curBlockParentTokens[oldIndex - 1].tokens = normalizeTokens(
        curBlockParentTokens[oldIndex - 1].tokens
      );
      render();
      selection.selection.setPosition(
        beforeLastChildToken.node,
        beforeLastChildTokenOffset
      );
    } else {
      token.text = token.text.delete(startPoint.offset);
      render();
      selection.selection.setPosition(token.node, startPoint.offset - 1);
    }
  }
  insertParagraph() {
    const { startPoint, endPoint, collapsed } = selection.range;
    if (!collapsed) return; // remove
    const token = startPoint.node._token;
    // find parent block
    const curBlock = token.parent;
    const curBlockToken = curBlock._token;
    let curBlockParentTokens;
    if (curBlockToken.parent === editor) {
      curBlockParentTokens = model;
    } else {
      curBlockParentTokens = curBlockToken.parent._token.tokens;
    }

    const righttxt = token.text.slice(startPoint.offset);
    token.text = token.text.slice(0, startPoint.offset);

    if (token.text.indexOf('---') > -1) {
      const i = token.text.indexOf('> ') + 2;
      curBlockToken.tokens = [];
      curBlockToken.type = 'hr';
      render();
    }

    const newP = createParagraphToken(righttxt);
    curBlockParentTokens.splice(
      curBlockParentTokens.indexOf(curBlockToken) + 1,
      0,
      newP
    );
    render();
    selection.selection.setPosition(newP.node, 0);
  }
}
export default Editor;
