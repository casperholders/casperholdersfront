/* eslint-disable */
import DeployParser from '@/helpers/deployParser';
import { AbstractSigner, SignError } from '@casperholders/core';
import { Buffer } from 'buffer/';
import { CLPublicKey, DeployUtil, Keys } from 'casper-js-sdk';

const SNAP_ID = 'npm:@casperholders/casper-snap';

async function installSnap(snapID = SNAP_ID) {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapID]: {},
    },
  });
}

async function getSnap(snapID = SNAP_ID) {
  const snaps = (await window.ethereum.request({
    method: 'wallet_getSnaps',
  }));
  return Object.values(snaps).find(
    (snap) => snap.id === snapID,
  );
}

async function getAccount(addressIndex = 0, snapId = SNAP_ID) {
  const response = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'casper_getAccount',
        params: {
          addressIndex,
        },
      },
    },
  });
  const publicKeyBytes = Buffer.from(response.publicKey, 'hex');
  if (response.curve === Keys.SignatureAlgorithm.Ed25519) {
    return new CLPublicKey(publicKeyBytes, Keys.SignatureAlgorithm.Ed25519).toHex();
  }
  if (response.curve === Keys.SignatureAlgorithm.Secp256K1) {
    return new CLPublicKey(publicKeyBytes, Keys.SignatureAlgorithm.Secp256K1).toHex();
  }
  throw new Error(`Unsupported curve. Received ${response.curve}. Only Secp256K1 && Ed25519 are supported.`);
}

class MetaMaskSigner extends AbstractSigner {
  /**
   * Sign a given Deploy Object with the corresponding public key.
   * You must pass the active public key from the user and the public key
   * where the deploy is going to be used.
   *
   * @param {DeployUtil.Deploy} deploy - Deploy object
   * @param {Object} options - Options object
   * @param {string} options.snapID - ID of the MetaMask Casper Snap.
   * @param {string} options.addressIndex - Index of the address.
   * @param {string} options.publicKey - Public key that sign the deploy.
   * @param {string} options.signingTxnText - Message explanation for the user displayed in MetaMask
   * @returns {Promise<DeployUtil.Deploy>} - Signed deploy object
   */
  static async sign(deploy, options = {}) {
    try {
      console.log(new DeployParser().deployToObject(deploy, options.publicKey));
      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: options.snapID ?? SNAP_ID,
          request: {
            method: 'casper_sign',
            params: {
              addressIndex: options.addressIndex,
              deployInfo: new DeployParser().deployToObject(deploy, options.publicKey),
              message: Buffer.from(deploy.hash).toString('hex'),
            },
          },
        },
      });
      if (response) {
        let signedDeploy = DeployUtil.setSignature(deploy, Buffer.from(response.signature, 'hex'), CLPublicKey.fromHex(options.publicKey));
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        if (signedDeploy.ok) {
          return signedDeploy.val;
        }
        throw signedDeploy.val;
      }
      throw new Error('Rejected transaction.');
    } catch (e) {
      console.log(e);
      throw new SignError();
    }
  }
}

export { installSnap, getSnap, getAccount, MetaMaskSigner };
