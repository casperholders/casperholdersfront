import clientCasper from '@/helpers/clientCasper';
import VuexKeyManager from '@/services/keys/vuexKeyManager';
import { Balance } from '@casperholders/core/dist/services/balance/balance';

export default new Balance(VuexKeyManager, clientCasper);
