import Big from 'big.js';

/**
 * Convert token motes to real amount using token decimals.
 *
 * @param {object} token
 * @param {string} amount
 *
 * @returns {string}
 */
export default function convertErc20MotesToAmount(token, amount) {
  return token.decimals
    ? Big(amount).div(Big(10).pow(Big(token.decimals).toNumber())).toString()
    : amount;
}
