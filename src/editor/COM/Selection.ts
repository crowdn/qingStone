// @ts-nocheck
class Selection {
  selection = window.getSelection();
  range = null;
  startPoint = null;
  static instance = new Selection();
  constructor() {
    document.addEventListener(
      'selectionchange',
      this.selectionChange.bind(this)
    );
  }
  selectionChange() {
    const { selection } = this;

    this.isCollapsed = selection.isCollapsed;
    if (selection.type === 'None') {
      this.startPoint = null;
      this.range = null;
      return;
    }
    // console.log(selection.type, selection);
    this.setRange(selection.getRangeAt(0));

    if (selection.type === 'Caret') {
      // anchor
      // focus
    }
    if (selection.type === 'Range') {
    }
    //   const range = selection.getRangeAt(0);
  }
}
export default Selection;
