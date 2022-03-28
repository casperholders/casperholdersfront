import clientCasper from '@/helpers/clientCasper';
import deployManager from '@/helpers/deployManager';
import Big from 'big.js';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';

async function getActiveKeyInfo(activeKey) {
  const latestBlock = await clientCasper.casperRPC.getLatestBlockInfo();
  const stateRootHash = await clientCasper.casperRPC.getStateRootHash(
    latestBlock.block.hash,
  );
  return clientCasper.casperRPC.getBlockState(
    stateRootHash,
    CLPublicKey.fromHex(activeKey).toAccountHashStr(),
    [],
  );
}

export default async function genericSendDeploy(
  internet,
  activeKey,
  signerActiveKey,
  signerObject,
  deployParameter,
  options,
  fee = 0,
  amount = 0,
  isKeyManagementDeploy = false,
) {
  try {
    if (internet) {
      try {
        const activeKeyInfo = await getActiveKeyInfo(activeKey);
        const threshold = isKeyManagementDeploy
          ? activeKeyInfo.Account.actionThresholds.keyManagement
          : activeKeyInfo.Account.actionThresholds.deployment;
        const account = activeKeyInfo.Account.associatedKeys.find(
          (v) => v.accountHash
            === CLPublicKey.fromHex(signerActiveKey).toAccountHashStr(),
        );
        if (account.weight >= threshold) {
          const deployResult = await deployManager.prepareSignAndSendDeploy(
            deployParameter,
            signerObject,
            options,
          );
          return { event: 'addDeployResult', data: deployResult };
        }
        const signedDeploy = await signerObject
          .sign(deployParameter.makeDeploy, options);
        const { deployResult } = deployParameter;
        const weightDeploy = {
          deploy: signedDeploy,
          // eslint-disable-next-line new-cap
          deployResult: new deployResult(
            DeployUtil.deployToJson(signedDeploy).deploy.hash,
            Big(fee).toString(),
            Big(amount).toString(),
          ),
          deployResultType: deployResult,
        };
        return { event: 'addWeightDeploy', data: weightDeploy };
      } catch (e) {
        console.log(e);
        return { error: e };
      }
    } else {
      const signedDeploy = await signerObject.sign(deployParameter.makeDeploy, options);
      const { deployResult } = deployParameter;
      const pendingDeploy = {
        deploy: signedDeploy,
        // eslint-disable-next-line new-cap
        deployResult: new deployResult(
          DeployUtil.deployToJson(signedDeploy).deploy.hash,
          Big(fee).toString(),
          Big(amount).toString(),
        ),
        deployResultType: deployResult,
      };
      return { event: 'addOfflineDeploy', data: pendingDeploy };
    }
  } catch (e) {
    console.log(e);
    return { error: e };
  }
}
