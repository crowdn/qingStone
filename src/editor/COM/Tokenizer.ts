import RuleDriver from './RuleDriver';
import * as utils from '@src/editor/utils';

class Tokenizer {
  private ruleDriver: RuleDriver;

  constructor() {
    this.ruleDriver = new RuleDriver();
  }
  exec(text: string): TokenType | null {
    let res = this.blockquote(text) || this.heading(text);
    return res;
  }
  blockquote(src: string): TokenType | null {
    const mdType = this.ruleDriver.blockquote(src);
    if (mdType) {
      const type = 'blockquote';
      return utils.createBlockToken(type, mdType.text);
    }
    return null;
  }
  heading(src: string): TokenType | null {
    const mdType = this.ruleDriver.heading(src);

    if (mdType) {
      const type = 'heading' + mdType.level;
      return utils.createBlockToken(type, mdType.text);
    }
    return null;
  }
}

export default Tokenizer;
