import TextFeature from './TextFeature';
import * as utils from '../utils';
import RuleDriver from './RuleDriver';
import Tokenizer from './Tokenizer';

class Editor {
  private editorEl: HTMLDivElement;
  private textFeature: TextFeature = new TextFeature();
  private ruleDriver: RuleDriver = new RuleDriver();
  private tokenizer: Tokenizer = new Tokenizer();
  private isComposing = false;

  private model: TokenType[];
  constructor(editorEL: HTMLDivElement) {
    this.editorEl = editorEL;
    this.editorEl.addEventListener(
      'beforeinput',
      this.onBeforeInput.bind(this)
    );

    this.editorEl.addEventListener(
      'compositionend',
      this.onCompositionEnd.bind(this)
    );
    this.editorEl.addEventListener(
      'compositionupdate',
      this.onCompositionUpdate.bind(this)
    );
    this.editorEl.setAttribute('contentEditable', 'true');

    this.model = [utils.createParagraphToken('')];
    this.render();
  }
  onBeforeInput(event: InputEvent) {
    if (
      event.inputType === 'insertCompositionText' ||
      event.inputType === 'deleteCompositionText'
    ) {
      return;
    }
    event.preventDefault();
    console.log(event);
    switch (event.inputType) {
      case 'insertFromComposition':
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
  onCompositionEnd(event: CompositionEvent) {
    console.log('onCompositionEnd', event);
    this.updateModelWhenCompositionEnd(event);
    this.isComposing = false;
  }
  onCompositionUpdate(event: CompositionEvent) {
    // console.log('onCompositionUpdate', event);
    this.isComposing = true;
  }
  updateModelWhenCompositionEnd(event: CompositionEvent) {
    const location = this.textFeature.getCurLocation();
    if (!this.textFeature.isCollapsed || !location) return;
    location.token.text = location.node.textContent || '';

    // this.render();
  }
  insertText(text: string | null) {
    console.log('insertText', text);
    if (!text) text = '';
    const location = this.textFeature.getCurLocation();
    if (!this.textFeature.isCollapsed || !location) return;
    let { token: curToken, offset } = location;

    // find block
    const curBlock = curToken.parent;
    const curBlockToken = curBlock?._token;
    if (!curBlock || !utils.isMountedToken(curBlockToken)) return;

    let curBlockParentTokens;
    if (curBlockToken.parent === this.editorEl) {
      curBlockParentTokens = this.model;
    } else {
      curBlockParentTokens = curBlockToken.parent._token.tokens || [];
    }
    let curBlockIdxInParent =
      curBlockParentTokens?.findIndex((i) => i === curBlockToken) || 0;

    let caretPostion = offset;
    let newBlockToken = this.tokenizer.exec(curToken.text.splice(offset, text));
    if (newBlockToken) {
      curBlockParentTokens[curBlockIdxInParent] = newBlockToken;
      caretPostion += newBlockToken.text.length - curToken.text.length;
      curToken = newBlockToken as any;
    } else {
      curToken.text = curToken.text.splice(offset, text);
      caretPostion = offset + text.length;
    }

    // marked.lexer(token.text)
    this.render();

    this.textFeature.selection?.setPosition(
      curToken.node,
      Math.min(caretPostion, curToken.node?.nodeValue?.length || caretPostion)
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
        const curBlockToken = curBlock?._token;
        if (!curBlock || !utils.isMountedToken(curBlockToken)) return;

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
          curBlockParentTokens[oldIndex - 1].tokens || []
        );
        this.render();
        this.textFeature.selection.setPosition(
          frontNodeLastChildToken.node || null,
          frontNodeLastChildTokenOffset
        );
      } else {
        curToken.text = curToken.text.delete(offset);
        this.render();
        this.textFeature.selection.setPosition(
          curToken.node || null,
          offset - 1
        );
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
    if (curBlock && utils.isMountedToken(curBlockToken)) {
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

      const newP = utils.createParagraphToken(rightTxt);
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
