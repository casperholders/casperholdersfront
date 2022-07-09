import tokensGroups from '@/services/tokens/tokensGroups';

/**
 * Retrieve a tokens group information.
 *
 * @param {string} id
 *
 * @returns {Object}
 */
export default (id) => tokensGroups[id];
