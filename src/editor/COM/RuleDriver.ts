import * as rules from '@src/editor/rules';
import { isNil } from '@src/lib/tLodash';

class RuleDriver {
  constructor() {}

  exec(text: string): MdType | null {
    let res = this.blockquote(text) || this.heading(text);
    return res;
  }

  blockquote(src: string): MdType | null {
    let res = rules.block.blockquote.exec(src);
    const symbol = res?.groups?.symbol;
    const text = res?.groups?.text;
    if (isNil(symbol) || !res || isNil(text)) return null;

    return {
      type: 'blockquote',
      symbolIndex: res.index,
      symbolOffset: symbol.length,
      symbol,
      isBlock: true,
      text: text,
      raw: src,
    };
  }
  heading(src: string): MdType | null {
    let res = rules.block.heading.exec(src);
    const symbol = res?.groups?.symbol;
    const text = res?.groups?.text;
    if (isNil(symbol) || !res || isNil(text)) return null;

    return {
      type: 'heading',
      symbolIndex: res.index,
      symbolOffset: symbol.length,
      symbol: symbol,
      level: symbol.trim().length,
      isBlock: true,
      text: text,
      raw: src,
    };
  }
}

export default RuleDriver;
