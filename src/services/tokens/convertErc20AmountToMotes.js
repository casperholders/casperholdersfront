import Big from 'big.js';

/**
 * Convert a human readable token amount to real amount using token decimals.
 *
 * @param {object} token
 * @param {string} amount
 *
 * @returns {string}
 */
export default function convertErc20AmountToMotes(token, amount) {
  return token.decimals
    ? Big(amount).times(Big(10).pow(Big(token.decimals).toNumber())).toString()
    : amount;
}
