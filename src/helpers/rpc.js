async function getStateRootHash() {
  return (await (await fetch(`${import.meta.env.VITE_APP_RPC}`, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
    }),
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'chain_get_state_root_hash',
    }),
  })).json()).result?.state_root_hash;
}

async function getItem(hash, stateRootHash) {
  return (await fetch(`${import.meta.env.VITE_APP_RPC}`, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
    }),
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'state_get_item',
      params: {
        state_root_hash: stateRootHash,
        key: hash,
        path: [],
      },
    }),
  })).json();
}

async function getMainPurse(hash, stateRootHash) {
  return (await getItem(hash, stateRootHash)).result?.stored_value?.Account?.main_purse;
}

async function getDictionaryItemByURef(stateRootHash, uref, dict) {
  return (await fetch(`${import.meta.env.VITE_APP_RPC}`, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
    }),
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'state_get_dictionary_item',
      params: {
        state_root_hash: stateRootHash,
        dictionary_identifier: {
          URef: {
            seed_uref: dict,
            dictionary_item_key: uref,
          },
        },
      },
    }),
  })).json();
}

async function fetchUrefBalance(hash, stateRootHash) {
  return (await (await fetch(`${import.meta.env.VITE_APP_RPC}`, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
    }),
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'state_get_balance',
      params: [
        stateRootHash,
        hash,
      ],
    }),
  })).json()).result?.balance_value;
}

export { fetchUrefBalance, getStateRootHash, getMainPurse, getItem, getDictionaryItemByURef };
