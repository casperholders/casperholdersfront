import { DATA_API } from '@/helpers/env';
import isNone from '@/helpers/isNone';
import parseContentRange from '@/helpers/parseContentRange';
import sortBy from 'lodash.sortby';

const findNamedKey = (namedKeys, name, value) => namedKeys.find(
  (namedKey) => namedKey[name] === value,
);

const filterTokens = (dataTokens) => dataTokens.filter((token) => {
  const name = findNamedKey(token.named_keys, 'name', 'name')?.initial_value || findNamedKey(token.named_keys, 'name', 'collection_name')?.initial_value;
  const shortName = findNamedKey(token.named_keys, 'name', 'symbol')?.initial_value || findNamedKey(token.named_keys, 'name', 'collection_symbol')?.initial_value;
  return !(name === undefined || shortName === undefined);
});

/**
 * Map the data API tokens to unified token object.
 *
 * @param {Array} dataTokens
 *
 * @returns {Array}
 */
const mapTokens = (dataTokens) => dataTokens.map((dataToken) => {
  const token = {
    groupId: dataToken.type,
    id: dataToken.hash,
    name: findNamedKey(dataToken.named_keys, 'name', 'name')?.initial_value || findNamedKey(dataToken.named_keys, 'name', 'collection_name')?.initial_value,
    shortName: findNamedKey(dataToken.named_keys, 'name', 'symbol')?.initial_value || findNamedKey(dataToken.named_keys, 'name', 'collection_symbol')?.initial_value,
  };
  if (token.groupId.includes('erc')) {
    token.decimals = findNamedKey(dataToken.named_keys, 'name', 'decimals')?.initial_value || 0;
  }
  if (token.groupId.includes('nft')) {
    token.namedKeys = dataToken.named_keys;
    if (token.groupId.includes('nftcep47')) {
      token.metadata = 'metadata';
    }
    if (token.groupId.includes('nftcep78')) {
      const metadataKind = findNamedKey(dataToken.named_keys, 'name', 'nft_metadata_kind')?.initial_value;
      let metadataNamedKey = '';
      switch (metadataKind) {
        case 0:
          metadataNamedKey = 'metadata_cep78';
          break;
        case 1:
          metadataNamedKey = 'metadata_nft721';
          break;
        case 2:
          metadataNamedKey = 'metadata_raw';
          break;
        case 3:
          metadataNamedKey = 'metadata_custom_validated';
          break;
        default:
          break;
      }
      token.metadata = metadataNamedKey;
    }
  }
  return token;
});

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
 * @param {string[]|undefined} [options.tokenTypes] Id's of the token types.
 * @param {number|undefined} [options.limit] Limit the number of results.
 * @param {string[]|undefined} [options.ids] Filter the results to a set of ids.
 * @param {string[]|undefined} [options.notIds] Filter the results to avoid a set of ids.
 *
 * @returns {Promise<Object>}
 */
export default async (options = {}) => {
  const query = new URLSearchParams();

  if (options.tokenTypes) {
    const tokenTypes = options.tokenTypes.map((t) => `type.eq.${t}`);
    query.set('or', `(${tokenTypes.join(',')})`);
  }

  query.set('order', 'score.desc');
  query.set('select', '*,named_keys(*)');

  if (options.limit) {
    query.set('limit', `${options.limit}`);
  }

  const hashClauses = [];
  if (options.search) {
    hashClauses.push(`hash.ilike.*${options.search}*`);
  }

  if (!isNone(options.ids)) {
    hashClauses.push(`hash.in.(${options.ids.map((id) => `"${id}"`).join(',')})`);
  }

  if (!isNone(options.notIds)) {
    hashClauses.push(`hash.not.in.(${options.notIds.map((id) => `"${id}"`).join(',')})`);
  }

  if (hashClauses.length) {
    query.set('and', `(${hashClauses.join(',')})`);
  }

  const response = await fetch(`${DATA_API}/contracts?${query.toString()}`, {
    headers: new Headers({
      Prefer: 'count=exact',
      'Range-Unit': 'items',
    }),
  });

  const contentRange = parseContentRange(response.headers.get('Content-Range'));

  return {
    contentRange,
    data: sortTokens(mapTokens(filterTokens(await response.json()))),
  };
};
