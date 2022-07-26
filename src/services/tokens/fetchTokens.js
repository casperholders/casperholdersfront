import sortBy from 'lodash.sortby';

// TODO Remove those hardcoded debug lines.
const TOKENS = [
  {
    groupId: 'erc20',
    id: 'abc',
    name: 'Wrapped Casper',
    shortName: 'WCSPR',
  },
  {
    groupId: 'other',
    id: 'foobar',
    shortName: 'FOOBAR',
  },
  {
    groupId: 'erc20',
    id: 'foo',
    name: 'Foo ERC20',
    shortName: 'FCSPR',
    logo: 'https://node.casperholders.com/.well-known/casper/logo.svg',
  },
  {
    groupId: 'erc20',
    id: 'bar',
    name: 'Bar ERC20',
    shortName: 'BCSPR',
    logo: 'https://www.emergingte.ch/wp-content/uploads/2021/02/cropped-ETA-Logo-20-2-1-32x32.png',
  },
  {
    groupId: 'erc20',
    id: 'baz',
    shortName: 'BCSPR',
  },
];

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
 * Already fetched tokens, will avoid fetching multiple times during a session.
 */
let tokens;

/**
 * Fetch the available tokens.
 *
 * @returns {Promise<Array>}
 */
export default async () => {
  if (tokens === undefined) {
    // TODO Fetch tokens from CasperData API.
    tokens = sortTokens(TOKENS);
  }

  return tokens;
};
