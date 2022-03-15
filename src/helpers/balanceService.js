import clientCasper from '@/helpers/clientCasper';
import VuexKeyManager from '@/services/keys/vuexKeyManager';
import Balance from '@casperholders/core/dist/services/balance/balance';

/**
 * Make the balance service available in the whole app
 */
export default new Balance(VuexKeyManager, clientCasper);
