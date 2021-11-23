import { ClientCasper } from '@casperholders/core/dist/services/clients/clientCasper';

const RPC = process.env.VUE_APP_RPC;
export default new ClientCasper(RPC);
