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
        fetchBalance: (token) => balanceService.fetchBalanceOfErc20(token.id.replace('hash-', '')),
      },
      transfer: {
        transferID: false,
        makeDeployParameters: (
          { activeKey, amount, address, token },
        ) => new Erc20Transfer(
          activeKey,
          NETWORK,
          amount,
          address,
          token.id,
        ),
      },
    },
  },
};
