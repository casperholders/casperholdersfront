import Big from 'big.js';

/**
 * Compute a token amount value from a mixed value.
 *
 * @param {undefined|string|number|object} value
 *
 * @returns {{isAmount: boolean, value: string}}
 */
export default function computeTokenValue(value) {
  if (value === undefined || value === null || value === '') {
    return { value: '-', isAmount: false };
  }

  if (typeof value === 'object') {
    return { value: value.toFormat(5), isAmount: true };
  }

  if (typeof value === 'number') {
    return { value: value.toFixed(5), isAmount: true };
  }

  if (typeof value === 'string' && !Number.isNaN(Number(value))) {
    return { value: Big(value).toFormat(5), isAmount: true };
  }

  return { value, isAmount: false };
}
