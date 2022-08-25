import { DATA_API } from '@/helpers/env';
import parseContentRange from '@/helpers/parseContentRange';
import sortBy from 'lodash.sortby';

/**
 * Map the data API tokens to unified token object.
 *
 * @param {Array} dataTokens
 *
 * @returns {Array}
 */
const mapTokens = (dataTokens) => dataTokens.map((dataToken) => ({
  groupId: dataToken.metadata_type,
  id: dataToken.metadata.contract_hash.replace(/^hash-/, ''),
  name: dataToken.metadata.name,
  shortName: dataToken.metadata.symbol,
  decimals: dataToken.metadata.decimals || 0,
}));

/**
 * Sort the tokens by group and logo/name/short name availability.
 *
 * @param {Array} tokens
 *
 * @returns {Array}
 */
const sortTokens = (tokens) => sortBy(tokens, [
  ({ groupId }) => groupId,
  ({ logo }) => !logo,
  ({ name }) => !name,
  ({ shortName }) => !shortName,
]);

/**
 * Fetch the available tokens.
 *
 * @param {object} options Optional options to query tokens.
 * @param {string|undefined} [options.search] Textual search on tokens names.
 *
 * @returns {Promise<Array>}
 */
export default async (options = {}) => {
  const query = new URLSearchParams();

  // Currently, we only retrieve the ERC20 tokens.
  query.set('result', 'is.true');
  query.set('metadata_type', 'eq.erc20');
  query.set('metadata->>contract_hash', 'not.is.null');
  query.set('limit', '10');
  query.set('order', 'timestamp.desc');

  if (options.search) {
    query.set('or', `(${[
      `metadata->>contract_hash.ilike.*${options.search}*`,
    ].join(',')})`);
  }

  const response = await fetch(`${DATA_API}/deploys?${query.toString()}`, {
    headers: new Headers({
      Prefer: 'count=exact',
      'Range-Unit': 'items',
    }),
  });

  const contentRange = parseContentRange(response.headers.get('Content-Range'));

  return {
    contentRange,
    data: sortTokens(mapTokens(await response.json())),
  };
};
