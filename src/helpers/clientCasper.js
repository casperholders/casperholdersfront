import { ClientCasper } from '@casperholders/core';

const RPC = import.meta.env.VITE_APP_RPC;
/**
 * Make the ClientCasper available in the whole app
 */
export default new ClientCasper(RPC);
