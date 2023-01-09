import 'cypress-real-events/support';
import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  name: 'testCEP47',
  symbol: 'TESTCEP47',
  meta: {
    clType: 'map',
    keyType: 'String',
    valueType: 'String',
  },
  contract_name: 'testCep47Contract',
};

const ACTIVE_KEY = '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55';
const TRANSFER_TO_KEY = '01a5A5B7328118681638BE3e06c8749609280Dba4c9DAF9AeB3D3464b8839B018a';

const mintArgs = {
  recipient: ACTIVE_KEY,
};

const approveArgs = {
  spender: TRANSFER_TO_KEY,
};

const updateTokenMetaArgs = {
  token_id: '1',
};

const mintCopiesArgs = {
  recipient: ACTIVE_KEY,
  count: 1,
};

let cep47contract = '';

describe('Deploy and test cep47', () => {
  it('Deploy cep47', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy="download-NFT CEP47"]').should('be.visible').click();
    cy.get('[data-cy="setArgs-NFT CEP47"]').should('be.visible').click();
    cy.readFile('tests/e2e/fixtures/downloads/cep47_token.wasm', { encoding: null }, { timeout: 2000 }).as('cep47_token');
    cy.get('#smartContractFile').selectFile('@cep47_token', { force: true });
    mockConnection(cy, ACTIVE_KEY);
    setArgs(cy, args);
    cy.get('[data-cy=amount]').type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Get cep47 contract hash', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Mint"]`)
      .should('be.visible')
      .click();
    cy.get('[data-cy=contractHash]')
      .invoke('val')
      .then(val => {
        cep47contract = val;
        console.log(cep47contract);
        cy.log(cep47contract);
      });
  });

  it('Add cep47 collection', () => {
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy=token-input]')
      .parent()
      .click();
    cy.get('[data-cy=token-input]')
      .type(cep47contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep47contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep47contract}"]`)
      .should('be.visible')
      .find('[data-cy="noNft"]')
      .should('be.visible');
  });


  it('Mint cep47 nft', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Mint"]`)
      .should('be.visible')
      .click();
    setArgs(cy, mintArgs);
    cy.get(`[data-cy=arg-panel-token_ids]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueListInput]')
      .find('[data-cy="listType"]')
      .type('U256');
    cy.get('.v-list-item__title').contains('U256').click();
    cy.get('[data-cy="listNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}1`);
    cy.get(`[data-cy=arg-panel-token_metas]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=CLValueListInput]')
      .find('[data-cy="listType"]')
      .type('Map');
    cy.get('.v-list-item__title').contains('Map').click();
    cy.get('[data-cy="listNewValue"]:visible').click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapKeyType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapValueType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get('[data-cy="mapNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestKey`);
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestValue`);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
    cy.get(`[data-cy=arg-panel-token_ids]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}2`);
    sendTransaction(cy);
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}3`);
    sendTransaction(cy);
  });

  it('Approve cep47 nft', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Approve"]`)
      .should('be.visible')
      .click();
    setArgs(cy, approveArgs);
    cy.get(`[data-cy=arg-panel-token_ids]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueListInput]')
      .find('[data-cy="listType"]')
      .type('U256');
    cy.get('.v-list-item__title').contains('U256').click();
    cy.get('[data-cy="listNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}1`);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Set meta cep47 nft', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Update token meta"]`)
      .should('be.visible')
      .click();
    setArgs(cy, updateTokenMetaArgs);
    cy.get(`[data-cy=arg-panel-token_meta]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapKeyType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapValueType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get('[data-cy="mapNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestKey`);
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestValue`);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Mint copies cep47 nft', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Mint copies"]`)
      .should('be.visible')
      .click();
    setArgs(cy, mintCopiesArgs);
    cy.get(`[data-cy=arg-panel-token_ids]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueListInput]')
      .find('[data-cy="listType"]')
      .type('U256');
    cy.get('.v-list-item__title').contains('U256').click();
    cy.get('[data-cy="listNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}4`);
    cy.get(`[data-cy=arg-panel-token_meta]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapKeyType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapValueType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get('[data-cy="mapNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestKey`);
    cy.get(`[data-cy=arg-panel-content-token_meta]`)
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestValue`);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Check cep47 collection', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy=token-input]')
      .parent()
      .click({ force: true });
    cy.get('[data-cy=token-input]')
      .type(cep47contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep47contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep47contract}"]`)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=openNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=closeNFTDetails]')
      .should('be.visible')
      .click({ force: true });


    cy.get(`[data-cy="collection-${cep47contract}-nft-2"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy="transferNFT"]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=cancelOperation]')
      .should('be.visible')
      .click({ force: true });

    cy.get(`[data-cy="collection-${cep47contract}-nft-3"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy="burnNFT"]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=cancelOperation]')
      .should('be.visible')
      .click({ force: true });

    cy.get(`[data-cy="collection-${cep47contract}-nft-2"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy="transferNFT"]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=address]').type(TRANSFER_TO_KEY);

    waitForBalances(cy);
    sendTransaction(cy);

    cy.get('[data-cy=cancelOperation]')
      .should('be.visible')
      .click({ force: true });

    cy.get(`[data-cy="collection-${cep47contract}-nft-3"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy="burnNFT"]')
      .should('have.length', 1)
      .should('be.visible')
      .click({ force: true });

    waitForBalances(cy);
    sendTransaction(cy);
  });


  it('Check cep47 collection', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy=token-input]')
      .parent()
      .click({ force: true });
    cy.get('[data-cy=token-input]')
      .type(cep47contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep47contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep47contract}"]`)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('have.length', 1)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-2"]`)
      .should('not.exist');
    cy.get(`[data-cy="collection-${cep47contract}-nft-3"]`)
      .should('not.exist');
    mockConnection(cy, TRANSFER_TO_KEY, 'firstKey');
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy=token-input]')
      .parent()
      .click({ force: true });
    cy.get('[data-cy=token-input]')
      .type(cep47contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep47contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep47contract}"]`)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('not.exist');
    cy.get(`[data-cy="collection-${cep47contract}-nft-2"]`)
      .should('have.length', 1)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-3"]`)
      .should('not.exist');
  });
});
