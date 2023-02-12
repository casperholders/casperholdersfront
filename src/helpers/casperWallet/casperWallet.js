import { AbstractSigner, SignError } from '@casperholders/core';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';

export default class CasperWalletSigner extends AbstractSigner {
  /**
   * Sign a given Deploy Object with the corresponding public key.
   * You must pass the active public key from the user and the public key
   * where the deploy is going to be used.
   *
   * @param {DeployUtil.Deploy} deploy - Deploy object
   * @param {Object} options - Options object
   * @param {string} options.publicKey - Public key that sign the deploy.
   * @returns {Promise<DeployUtil.Deploy>} - Signed deploy object
   */
  static async sign(deploy, options = {}) {
    try {
      const casperWallet = window.CasperWalletInstance;
      const response = await casperWallet.sign(
        JSON.stringify(DeployUtil.deployToJson(deploy)),
        options.publicKey,
      );
      if (response.cancelled) {
        throw new Error('Rejected transaction');
      } else {
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          response.signature,
          CLPublicKey.fromHex(options.publicKey),
        );
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        if (signedDeploy.ok) {
          return signedDeploy.val;
        }
        throw signedDeploy.val;
      }
    } catch (e) {
      console.log(e);
      throw new SignError();
    }
  }
}
