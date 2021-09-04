import TextFeature from './TextFeature';
import * as utils from '../utils';
class Editor {
  private editorEl: HTMLDivElement;
  private textFeature: TextFeature;

  private model: TokenType[];
  constructor(editorEL: HTMLDivElement) {
    this.editorEl = editorEL;
    this.editorEl.addEventListener('beforeinput', this.beforeInput.bind(this));
    this.editorEl.setAttribute('contentEditable', 'true');

    this.textFeature = new TextFeature();
    this.model = [utils.createParagraphToken('', this.editorEl)];
    this.render();
  }
  beforeInput(event: InputEvent) {
    event.preventDefault();
    console.log(event);
    switch (event.inputType) {
      case 'insertText':
        this.insertText(event.data);
        break;
      case 'deleteContentBackward':
        this.deleteContentBackward();
        break;
      case 'insertParagraph':
        this.insertParagraph();
        break;
    }
  }

  insertText(text: string | null) {
    console.log('insertText', text);
    if (!text) text = '';
    const location = this.textFeature.getCurLocation();
    if (!this.textFeature.isCollapsed || !location) return;
    const { token: curToken, offset } = location;

    curToken.text = curToken.text.splice(offset, text);

    // find block
    const curBlock = curToken.parent;
    const curBlockToken = curBlock._token;
    let curBlockParentTokens;
    if (curBlockToken.parent === this.editorEl) {
      curBlockParentTokens = this.model;
    } else {
      curBlockParentTokens = curBlockToken.parent._token.tokens;
    }

    if (curToken.text.indexOf('# ') > -1) {
      const i = curToken.text.indexOf('# ') + 2;
      curToken.text = curToken.text.slice(i);
      const newOffset = offset - i + 1;
      curBlockToken.type = 'heading';
      this.render();
      this.textFeature.selection?.setPosition(curToken.node, newOffset);
      return;
    }

    if (curToken.text.indexOf('> ') > -1) {
      const i = curToken.text.indexOf('> ') + 2;
      curToken.text = curToken.text.slice(i);
      const newOffset = offset - i + 1;
      curBlockToken.type = 'blockquote';
      this.render();
      this.textFeature.selection?.setPosition(curToken.node, newOffset);
      return;
    }

    // marked.lexer(token.text)
    this.render();
    // render后，curToken.node.
    this.textFeature.selection?.setPosition(
      curToken.node,
      offset + text.length
    );
  }
  deleteContentBackward() {
    if (this.textFeature.isCollapsed) {
      // delete in Caret
      const location = this.textFeature.getCurLocation();
      if (!this.textFeature.isCollapsed || !location) return;
      const { token: curToken, offset } = location;

      // removeBlock
      if (offset === 0) {
        // find parent block , Need to be function
        const curBlock = curToken.parent;
        const curBlockToken = curBlock._token;

        if (curBlockToken.type !== 'paragraph') {
          curBlockToken.type = 'paragraph';
          this.render();
          this.textFeature.selection.setPosition(curBlockToken.node, 0);
          return;
        }

        let curBlockParentTokens;
        if (curBlockToken.parent === this.editorEl) {
          curBlockParentTokens = this.model;
        } else {
          curBlockParentTokens = curBlockToken.parent._token.tokens || [];
        }

        // remove old block
        const oldIndex = curBlockParentTokens.indexOf(curBlockToken);

        if (oldIndex <= 0 && curBlockParentTokens === this.model) {
          // there are one block at least
          return;
        }
        const frontNodeTokens = curBlockParentTokens[oldIndex - 1].tokens || [];

        // IMP: 有可能 []
        const frontNodeLastChildToken =
          frontNodeTokens[frontNodeTokens.length - 1];
        const frontNodeLastChildTokenOffset =
          frontNodeLastChildToken?.text.length;

        curBlockParentTokens.splice(oldIndex, 1);
        // megre right tokens
        if (curBlockParentTokens[oldIndex - 1].tokens) {
          curBlockParentTokens[oldIndex - 1].tokens = curBlockParentTokens[
            oldIndex - 1
          ].tokens?.concat(curBlockToken.tokens || []);
        } else {
          curBlockParentTokens[oldIndex - 1].tokens = (
            curBlockToken.tokens || []
          ).slice();
        }

        // normalize tokens
        curBlockParentTokens[oldIndex - 1].tokens = utils.normalizeTokens(
          curBlockParentTokens[oldIndex - 1].tokens
        );
        this.render();
        this.textFeature.selection.setPosition(
          frontNodeLastChildToken.node,
          frontNodeLastChildTokenOffset
        );
      } else {
        curToken.text = curToken.text.delete(offset);
        this.render();
        this.textFeature.selection.setPosition(curToken.node, offset - 1);
      }
    } else {
      // delete with Range
      const { start: startLocation, end: endLocation } =
        this.textFeature.getRangeLocation() || {};
      if (!startLocation || !endLocation) return;
    }
  }
  insertParagraph() {
    const {
      token: curToken,
      node: curNode,
      offset,
    } = this.textFeature.getCurLocation() || {};

    if (!this.textFeature.isCollapsed || !curToken || !curNode) return;
    // find parent block
    const curBlock = curToken.parent;
    const curBlockToken = curBlock?._token;
    if (curBlock && curBlockToken) {
      let curBlockParentTokens;
      if (curBlockToken.parent === this.editorEl) {
        curBlockParentTokens = this.model;
      } else {
        curBlockParentTokens = curBlockToken.parent._token.tokens || [];
      }

      const rightTxt = curToken.text.slice(offset);
      curToken.text = curToken.text.slice(0, offset);

      if (curToken.text.indexOf('---') > -1) {
        curBlockToken.tokens = [];
        curBlockToken.type = 'hr';
        this.render();
      }

      const newP = utils.createParagraphToken(rightTxt, this.editorEl);
      curBlockParentTokens.splice(
        curBlockParentTokens.indexOf(curBlockToken) + 1,
        0,
        newP
      );
      this.render();
      newP.node && this.textFeature.selection?.setPosition(newP.node, 0);
    }
  }
  private render() {
    this.editorEl.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const renderModel = (
      token: TokenType,
      parent: HTMLElement | DocumentFragment
    ) => {
      const textNode = utils.creatNodeFromToken(token);
      // token
      token.node = textNode;
      // isFragment?
      token.parent = parent.nodeType == 11 ? this.editorEl : parent;
      textNode._token = token;

      if (token.tokens && token.tokens.length) {
        token.tokens.forEach((t) => renderModel(t, textNode));
      }

      if (token.type !== 'text') {
        textNode.classList.add(`md-${token.type}`);
      }

      parent.appendChild(textNode);
    };
    this.model.forEach((token) => renderModel(token, fragment));
    this.editorEl.appendChild(fragment);
  }
}

export default Editor;
