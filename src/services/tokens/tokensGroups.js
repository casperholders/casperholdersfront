import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import convertErc20AmountToMotes from '@/services/tokens/convertErc20AmountToMotes';
import {
  Erc20Approve,
  Erc20ApproveResult,
  Erc20Transfer,
  Erc20TransferResult,
  NftApprove,
  NftApproveResult,
  NftBurn,
  NftBurnResult,
  NftCEP78Approve,
  NftCEP78Burn,
  NftCEP78Transfer,
  NftTransfer,
  NftTransferResult,
  TransferDeployParameters,
  TransferResult,
  UniswapErc20Approve,
  UniswapErc20Transfer,
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
        transferFee: 2,
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
        approveFee: 2,
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
        approveFee: 5,
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
      transfer: {
        transferFee: 1,
        transferResult: NftTransferResult,
        makeDeployParameters: (
          { activeKey, tokenId, recipient, token },
        ) => new NftTransfer(
          activeKey,
          tokenId,
          recipient,
          NETWORK,
          token.id,
        ),
      },
      burn: {
        burnFee: 1,
        burnResult: NftBurnResult,
        makeDeployParameters: (
          { activeKey, tokenId, token },
        ) => new NftBurn(
          activeKey,
          tokenId,
          NETWORK,
          token.id,
        ),
      },
      approve: {
        approveFee: 1,
        approveResult: NftApproveResult,
        makeDeployParameters: (
          { activeKey, tokenId, spender, token },
        ) => new NftApprove(
          activeKey,
          tokenId,
          spender,
          NETWORK,
          token.id,
        ),
      },
    },
  },
  nftcep78: {
    id: 'nftcep78',
    name: 'Casper Enhanced Standard NFT',
    features: {
      transfer: {
        transferFee: 1,
        transferResult: NftTransferResult,
        makeDeployParameters: (
          { activeKey, tokenId, recipient, token },
        ) => new NftCEP78Transfer(
          activeKey,
          tokenId,
          recipient,
          NETWORK,
          token.id,
        ),
      },
      burn: {
        burnFee: 1,
        burnResult: NftBurnResult,
        makeDeployParameters: (
          { activeKey, tokenId, token },
        ) => new NftCEP78Burn(
          activeKey,
          tokenId,
          NETWORK,
          token.id,
        ),
      },
      approve: {
        approveFee: 1,
        approveResult: NftApproveResult,
        makeDeployParameters: (
          { activeKey, tokenId, spender, token },
        ) => new NftCEP78Approve(
          activeKey,
          tokenId,
          spender,
          NETWORK,
          token.id,
        ),
      },
    },
  },
};
