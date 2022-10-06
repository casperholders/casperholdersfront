import { DATA_API } from '@/helpers/env';
import parseContentRange from '@/helpers/parseContentRange';
import sortBy from 'lodash.sortby';

const findNamedKey = (namedKeys, name, value) => namedKeys.find(
  (namedKey) => namedKey[name] === value,
);

const filterTokens = (dataTokens) => dataTokens.filter((token) => {
  const name = findNamedKey(token.data.Contract.named_keys, 'name', 'name')?.initial_value;
  const shortName = findNamedKey(token.data.Contract.named_keys, 'name', 'symbol')?.initial_value;
  if (name === undefined || shortName === undefined) {
    return false;
  }
  const transferEntrypoint = token.data.Contract.entry_points.find((entryPoint) => entryPoint.name === 'transfer');
  if (transferEntrypoint !== undefined) {
    if (transferEntrypoint.args.length === 2) {
      const amountArg = transferEntrypoint.args.find((arg) => arg.name === 'amount');
      const recipientArg = transferEntrypoint.args.find((arg) => arg.name === 'recipient');
      if (amountArg.cl_type === 'U256' && recipientArg.cl_type === 'Key') {
        return true;
      }
    }
  }
  return false;
});

/**
 * Map the data API tokens to unified token object.
 *
 * @param {Array} dataTokens
 *
 * @returns {Array}
 */
const mapTokens = (dataTokens) => dataTokens.map((dataToken) => ({
  groupId: dataToken.type,
  id: dataToken.hash,
  name: findNamedKey(dataToken.data.Contract.named_keys, 'name', 'name')?.initial_value,
  shortName: findNamedKey(dataToken.data.Contract.named_keys, 'name', 'symbol')?.initial_value,
  decimals: findNamedKey(dataToken.data.Contract.named_keys, 'name', 'decimals')?.initial_value || 0,
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
  query.set('type', 'eq.erc20');

  if (options.limit) {
    query.set('limit', options.limit);
  }

  if (options.search) {
    query.set('hash', `ilike.*${options.search}*`);
  }

  if (options.ids) {
    query.set('hash', `in.(${options.ids.map((id) => `"${id}"`).join(',')})`);
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
