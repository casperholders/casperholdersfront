import clientCasper from '@/helpers/clientCasper';
import { DeployManager } from '@casperholders/core';

/**
 * Make the DeployManager available in the whole app
 */
export default new DeployManager(clientCasper);
