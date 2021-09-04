const NodeType = {
  ELEMENT_NODE: 1, // 一个 元素 节点，例如 <p> 和 <div>。
  TEXT_NODE: 3, //element 或者 Attr 中实际的  文字
  CDATA_SECTION_NODE: 4, //一个 CDATASection，例如 <!CDATA[[ … ]]>
  PROCESSING_INSTRUCTION_NODE: 7, //一个用于XML文档的 ProcessingInstruction (en-US) ，例如 <?xml-stylesheet ... ?> 声明。
  COMMENT_NODE: 8, //一个 Comment 节点。
  DOCUMENT_NODE: 9, //一个 Document 节点。
  DOCUMENT_TYPE_NODE: 10, //	描述文档类型的 DocumentType 节点。例如 <!DOCTYPE html>  就是用于 HTML5 的。
  DOCUMENT_FRAGMENT_NODE: 11, //	一个 DocumentFragment 节点
};
export default NodeType;
