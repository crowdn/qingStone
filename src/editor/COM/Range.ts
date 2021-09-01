// @ts-nocheck
class Range {
  constructor(range) {
    const {
      startContainer,
      startOffset = 0,
      endContainer = startContainer,
      endOffset = 0,
      collapsed = true,
    } = range;
    if (!range) throw 'undefined range';
    this.startPoint = new Point(startContainer, startOffset);
    this.endPoint = new Point(endContainer, endOffset);
    this.collapsed = collapsed;
  }
}
export default Range;
