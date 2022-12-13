import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import {
  Erc20Transfer,
  Erc20TransferResult,
  TransferDeployParameters,
  TransferResult,
} from '@casperholders/core';
import Big from 'big.js';

/**
 * Convert a human readable token amount to real amount using token decimals.
 *
 * @param {object} token
 * @param {string} amount
 *
 * @returns {string}
 */
const convertErc20AmountToMotes = (token, amount) => (
  token.decimals
    ? Big(amount).times(Big(10).pow(Big(token.decimals).toNumber())).toString()
    : amount
);

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
