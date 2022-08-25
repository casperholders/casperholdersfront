import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import { Erc20Transfer, TransferDeployParameters } from '@casperholders/core';

/**
 * The available groups of tokens usable for different operations on app.
 */
export default {
  native: {
    id: 'native',
    name: 'Native',
    features: {
      balance: {
        fetchBalance: () => balanceService.fetchBalance(),
      },
      transfer: {
        minimumAmount: () => 2.5,
        transferID: true,
        makeDeployParameters: (
          { activeKey, amount, address, transferID },
        ) => new TransferDeployParameters(
          activeKey,
          NETWORK,
          amount,
          address,
          transferID,
        ),
      },
    },
  },
  erc20: {
    id: 'erc20',
    name: 'ERC20',
    features: {
      balance: {
        fetchBalance: (token) => balanceService.fetchBalanceOfErc20(token.id),
      },
      transfer: {
        minimumAmount: (token) => (1 / (token.decimals ? (10 ** token.decimals) : 1)),
        transferID: false,
        makeDeployParameters: (
          { activeKey, amount, address, token },
        ) => new Erc20Transfer(
          activeKey,
          amount,
          address,
          NETWORK,
          token.id,
        ),
      },
    },
  },
};
