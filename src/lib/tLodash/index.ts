import _isNill from 'lodash/isNil';

export function isNil(value: any): value is null | undefined {
  return _isNill(value);
}
