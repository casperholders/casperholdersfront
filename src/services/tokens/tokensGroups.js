import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import convertErc20AmountToMotes from '@/services/tokens/convertErc20AmountToMotes';
import {
  Erc20Transfer,
  Erc20Approve,
  UniswapErc20Transfer,
  UniswapErc20Approve,
  Erc20TransferResult,
  Erc20ApproveResult,
  TransferDeployParameters,
  TransferResult,
} from '@casperholders/core';

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
        transferFee: 0.1,
        transferResult: TransferResult,
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
        transferFee: 0.5,
        transferResult: Erc20TransferResult,
        minimumAmount: (token) => (1 / (token.decimals ? (10 ** token.decimals) : 1)),
        transferID: false,
        makeDeployParameters: (
          { activeKey, amount, address, token },
        ) => new Erc20Transfer(
          activeKey,
          convertErc20AmountToMotes(token, amount),
          address,
          NETWORK,
          token.id,
        ),
      },
      approve: {
        approveFee: 0.4,
        approveResult: Erc20ApproveResult,
        makeDeployParameters: (
          { activeKey, amount, address, token },
        ) => new Erc20Approve(
          activeKey,
          convertErc20AmountToMotes(token, amount),
          address,
          NETWORK,
          token.id,
        ),
      },
    },
  },
  uniswaperc20: {
    id: 'uniswaperc20',
    name: 'Uniswap ERC20',
    features: {
      balance: {
        fetchBalance: (token) => balanceService.fetchBalanceOfErc20(token.id),
      },
      transfer: {
        transferFee: 4,
        transferResult: Erc20TransferResult,
        minimumAmount: (token) => (1 / (token.decimals ? (10 ** token.decimals) : 1)),
        transferID: false,
        makeDeployParameters: (
          { activeKey, amount, address, token },
        ) => new UniswapErc20Transfer(
          activeKey,
          convertErc20AmountToMotes(token, amount),
          address,
          NETWORK,
          token.id,
        ),
      },
      approve: {
        approveFee: 4,
        approveResult: Erc20ApproveResult,
        makeDeployParameters: (
          { activeKey, amount, address, token },
        ) => new UniswapErc20Approve(
          activeKey,
          convertErc20AmountToMotes(token, amount),
          address,
          NETWORK,
          token.id,
        ),
      },
    },
  },
  nftcep47: {
    id: 'nftcep47',
    name: 'Casper Standard NFT',
    features: {
    },
  },
  nftcep78: {
    id: 'nftcep78',
    name: 'Casper Enhanced Standard NFT',
    features: {
    },
  },
};
