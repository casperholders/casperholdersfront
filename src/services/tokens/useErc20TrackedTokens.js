import makeJsonStorage from '@/helpers/makeJsonStorage';

/**
 * A storage for ERC20 tracked tokens.
 *
 * @param {string} activeKey
 */
export default (activeKey) => makeJsonStorage(`casperholders.erc20.tokens.tracked.${activeKey}`);
