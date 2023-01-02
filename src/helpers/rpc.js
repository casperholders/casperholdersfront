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

async function getDictionaryItemByURef(stateRootHash, contractKey, uref, dict) {
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
          ContractNamedKey: {
            key: `hash-${contractKey}`,
            dictionary_name: dict,
            dictionary_item_key: uref,
          },
        },
      },
    }),
  })).json();
}

export { getStateRootHash, getItem, getDictionaryItemByURef };
