import NodeType from '@src/editor/constant/nodeType';
class TextFeature {
  constructor() {
    document.addEventListener(
      'selectionchange',
      this.selectionChange.bind(this)
    );
  }
  get selection(): Selection {
    let selection = window.getSelection();
    if (!selection) {
      throw new Error('no selection');
    }
    return selection;
  }
  get isCollapsed() {
    return !!this.selection.isCollapsed;
  }
  /**
   * 当前光标位置的token，如果是选区，会返回选区的第一个token。
   * @return TokenType
   */
  get curLeafToken() {
    return this.curLeafNode?._token || null;
  }
  /**
   * 当前光标位置的Node，如果是选区，会返回选区起点所在的node。
   * @return Node
   */
  get curLeafNode() {
    if (!this.selection.anchorNode) return null;
    let curNode =
      this.selection.anchorNode.nodeType === NodeType.TEXT_NODE
        ? this.selection.anchorNode
        : this.selection.anchorNode.firstChild;

    return curNode;
  }

  /**
   * 获取当前光标所在location。！location.node 在某些情况下会过期（比如重新render后），不再代表当前node，只代表方法调用时。
   * 如果是选区，返回起点location
   * @returns Location
   */
  public getCurLocation(): LocationType | null {
    let token = this.curLeafToken;
    if (!token) return null;
    return {
      node: token.node,
      token,
      offset: this.selection.anchorOffset,
    };
  }
  /**
   * 获取当前选区范围location，如果是caret无选区，起点和终点一致
   */
  getRangeLocation(): RangeLocationType | null {
    let start = this.getCurLocation();

    let endNode =
      this.selection.focusNode?.nodeType === NodeType.TEXT_NODE
        ? this.selection.focusNode
        : this.selection.focusNode?.firstChild;
    if (endNode?._token && start) {
      return {
        start,
        end: {
          node: endNode._token.node,
          token: endNode._token,
          offset: this.selection.focusOffset,
        },
      };
    }
    return null;
  }

  selectionChange() {
    const { selection } = this;
    if (!selection || selection.type === 'None') return;

    // console.log(selection.type, selection);
    // this.updateRange(selection.getRangeAt(0));

    if (selection.type === 'Caret') {
      // anchor
      // focus
    }
    if (selection.type === 'Range') {
    }
    //   const range = selection.getRangeAt(0);
  }
}
export default TextFeature;
