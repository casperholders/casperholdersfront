import computeTokenValue from '@/services/tokens/computeTokenValue';
import nativeToken from '@/services/tokens/nativeToken';

/**
 Compute a formatted token amount value from a mixed value.
 *
 * @param {undefined|string|number|object} value
 * @param {object} token
 *
 * @returns {{ value: string, isAmount: boolean }}
 */
export default function computeFormattedTokenValue(value, token) {
  const data = computeTokenValue(value);
  if (data.isAmount) {
    const valueWithUnit = token
      ? `${data.value} ${token.shortName}`
      : `${data.value} ${nativeToken.shortName}`;

    return {
      value: valueWithUnit, isAmount: data.isAmount,
    };
  }

  return data;
}
