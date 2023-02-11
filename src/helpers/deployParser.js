/* eslint-disable no-case-declarations */
import { CurrencyUtils } from '@casperholders/core';
import { CLAccountHash, CLPublicKey, CLTypeTag, CLValue, encodeBase16 } from 'casper-js-sdk';

export default class DeployParser {
  sanitiseNestedLists(value) {
    const parsedValue = this.parseDeployArg(value);
    if (Array.isArray(parsedValue)) {
      const parsedType = (value).vectorType;
      return `<${parsedType}>[...]`;
    }
    return parsedValue;
  }

  parseDeployArg(arg) {
    if (!(arg instanceof CLValue)) {
      throw new Error(`Argument should be a CLValue, received: ${typeof arg}`);
    }
    const { tag } = arg.clType();
    switch (tag) {
      case CLTypeTag.Unit:
        return String('CLValue Unit');

      case CLTypeTag.Key:
        const key = arg;
        if (key.isAccount()) {
          return this.parseDeployArg(key.value());
        }
        if (key.isURef()) {
          return this.parseDeployArg(key.value());
        }
        if (key.isHash()) {
          return this.parseDeployArg(key.value());
        }
        throw new Error('Failed to parse key argument');

      case CLTypeTag.URef:
        return (arg).toFormattedStr();

      case CLTypeTag.Option:
        const option = arg;
        if (option.isSome()) {
          return this.parseDeployArg(option.value().unwrap());
        }
        // This will be None due to the above logic
        const optionValue = option.value().toString();
        // This will be the inner CLType of the CLOption e.g. '(bool)'
        const optionCLType = option.clType().toString().split(' ')[1];
        // The format ends up looking like `None (bool)`
        return `${optionValue} ${optionCLType}`;

      case CLTypeTag.List:
        return arg.value().map((member) => this.sanitiseNestedLists(member));

      case CLTypeTag.ByteArray:
        const bytes = (arg).value();
        return encodeBase16(bytes);

      case CLTypeTag.Result:
        const result = arg;
        const status = result.isOk() ? 'OK:' : 'ERR:';
        const parsed = this.parseDeployArg(result.value().val);
        return `${status} ${parsed}`;

      case CLTypeTag.Map:
        return arg.value().toString();

      case CLTypeTag.Tuple1:
        return this.parseDeployArg(arg.value()[0]);

      case CLTypeTag.Tuple2:
        return arg.value().map((member) => this.sanitiseNestedLists(member));

      case CLTypeTag.Tuple3:
        return arg.value().map((member) => this.sanitiseNestedLists(member));

      case CLTypeTag.PublicKey:
        return (arg).toHex();

      default:
        // Special handling as there is no CLTypeTag for CLAccountHash
        if (arg instanceof CLAccountHash) return encodeBase16(arg.value());
        return arg.value().toString();
    }
  }

  verifyTargetAccountMatch(
    publicKeyHex,
    targetAccountHash,
  ) {
    const providedTargetKeyHash = encodeBase16(
      CLPublicKey.fromHex(publicKeyHex).toAccountHash(),
    );

    if (providedTargetKeyHash !== targetAccountHash) {
      throw new Error(
        'Provided target public key doesn\'t match the one in deploy',
      );
    }
  }

  parseTransferData(
    transferDeploy,
    providedTarget,
  ) {
    const transferArgs = {};

    // Target can either be a hex formatted public key or an account hash
    const targetFromDeploy = transferDeploy?.getArgByName('target');
    let targetFromDeployHex;

    switch (targetFromDeploy.clType().tag) {
      // If deploy is created using older version of SDK
      // confirm hash of provided public key matches target account hash from deploy
      case CLTypeTag.ByteArray: {
        targetFromDeployHex = encodeBase16(targetFromDeploy.value());
        // Requester has provided a public key to compare against the target in the deploy
        if (providedTarget) {
          const providedTargetLower = providedTarget.toLowerCase();
          this.verifyTargetAccountMatch(
            providedTargetLower,
            targetFromDeployHex,
          );
        }
        transferArgs['Recipient (Hash)'] = targetFromDeployHex;
        break;
      }
      // If deploy is created using version of SDK gte than 2.7.0
      // In fact this logic can be removed in future as well as pkHex param
      case CLTypeTag.PublicKey: {
        targetFromDeployHex = (targetFromDeploy).toHex();
        // Requester has provided a public key to compare against the target in the deploy
        if (providedTarget) {
          if (targetFromDeployHex !== providedTarget) {
            throw new Error(
              'Provided target public key doesn\'t match the one in the deploy',
            );
          }
        }
        transferArgs['Recipient (Key)'] = targetFromDeployHex;
        break;
      }
      default: {
        throw new Error(
          'Target from deploy was neither AccountHash or PublicKey',
        );
      }
    }

    const amount = transferDeploy?.getArgByName('amount').value().toString();
    const id = transferDeploy
      ?.getArgByName('id')
      .value()
      .unwrap()
      .value()
      .toString();

    transferArgs.Amount = `${CurrencyUtils.convertMotesToCasper(amount)} CSPR`;
    transferArgs['Transfer ID'] = id;

    return transferArgs;
  }

  /**
   * @typedef { import('casper-js-sdk').DeployUtil.Deploy } Deploy
   */

  /**
   * Parse a deploy into an object
   *
   * @param deploy {Deploy}
   * @param signingKey {String}
   * @returns {Object}
   */
  deployToObject(deploy, signingKey) {
    const { header } = deploy;
    const deployAccount = header.account.toHex();
    if (!deploy.isStandardPayment()) throw new Error('Signer does not yet support non-standard payment');

    const payment = `${CurrencyUtils.convertMotesToCasper(deploy.payment.moduleBytes
      ?.getArgByName('amount')?.value()?.toString())} CSPR`;

    let type;

    if (deploy.isTransfer()) {
      type = 'Transfer';
    } else if (deploy.session.isModuleBytes()) {
      type = 'WASM-Based Deploy';
    } else if (deploy.session.isStoredContractByHash() || deploy.session.isStoredContractByName()) {
      type = 'Contract Call';
    } else {
      type = 'Contract Package Call';
    }

    let deployArgs = {};
    if (deploy.session.transfer) {
      deployArgs = this.parseTransferData(
        deploy.session.transfer,
        deploy.targetKey,
      );
    } else if (deploy.session.moduleBytes) {
      deploy.session.moduleBytes.args.args.forEach(
        (argument, key) => {
          deployArgs[key] = this.parseDeployArg(argument);
        },
      );
    } else {
      let storedContract;
      if (deploy.session.storedContractByHash) {
        storedContract = deploy.session.storedContractByHash;
      } else if (deploy.session.storedContractByName) {
        storedContract = deploy.session.storedContractByName;
      } else if (deploy.session.storedVersionedContractByHash) {
        storedContract = deploy.session.storedVersionedContractByHash;
      } else if (deploy.session.storedVersionedContractByName) {
        storedContract = deploy.session.storedVersionedContractByName;
      } else {
        throw new Error(`Stored Contract could not be parsed.\n\
          Provided session code: ${deploy.session}`);
      }
      storedContract.args.args.forEach((argument, key) => {
        deployArgs[key] = this.parseDeployArg(argument);
      });
      deployArgs['Entry Point'] = storedContract.entryPoint;
    }
    return {
      deployHash: encodeBase16(deploy.hash),
      signingKey,
      account: deployAccount,
      bodyHash: encodeBase16(header.bodyHash),
      chainName: header.chainName,
      timestamp: new Date(header.timestamp).toLocaleString(),
      gasPrice: header.gasPrice.toString(),
      payment,
      deployType: type,
      deployArgs,
    };
  }
}
