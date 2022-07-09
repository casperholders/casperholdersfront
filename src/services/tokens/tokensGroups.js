/**
 * The available groups of tokens usable for different operations on app.
 */
export default {
  erc20: {
    id: 'erc20',
    name: 'ERC20',
    // TODO Features.
    features: {
      transfer: {
        transferID: false,
      },
    },
  },
  // TODO Remove this useless group.
  other: {
    id: 'other',
    name: 'Other',
    features: {
      transfer: {
        transferID: true,
      },
    },
  },
};
