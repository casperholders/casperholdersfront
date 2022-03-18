import { ClientCasper } from '@casperholders/core';

const RPC = process.env.VUE_APP_RPC;
/**
 * Make the ClientCasper available in the whole app
 */
export default new ClientCasper(RPC);
