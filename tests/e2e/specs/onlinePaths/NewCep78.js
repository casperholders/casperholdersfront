import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  collection_name: 'testCEP78',
  collection_symbol: 'TESTCEP78',
  total_token_supply: '100000',
  ownership_mode: '2',
  nft_kind: '1',
  nft_metadata_kind: '0',
  identifier_mode: '0',
  metadata_mutability: '1',
  json_schema: ' ',
};

const ACTIVE_KEY = '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55';

const mintArgs = {
  token_owner: ACTIVE_KEY,
  token_meta_data: '{{} "name": "John Dodqzadqde", "token_uri": "https://www.barfoo.com", "checksum": "940bffb3f2bba35f84313aa26da09ece3ad47045c6a1292c2bbd2df4ab1a55fb" }',
};

let cep78contract = '';

describe('Deploy & test cep78', () => {
  it('Deploy cep78', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy="download-Enhanced NFT CEP78"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="setArgs-Enhanced NFT CEP78"]')
      .should('be.visible')
      .click();
    cy.readFile('tests/e2e/fixtures/downloads/cep78_token.wasm', { encoding: null }, { timeout: 2000 })
      .as('cep78_token');
    cy.get('#smartContractFile')
      .selectFile('@cep78_token', { force: true });
    mockConnection(cy, ACTIVE_KEY);
    setArgs(cy, args);
    cy.get('[data-cy=amount]')
      .type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Get cep78 contract hash', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();

    cy.get(`.v-list-item__title`)
      .contains(args.collection_name)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Mint"]`)
      .should('be.visible')
      .click();
    cy.get('[data-cy=contractHash]')
      .invoke('val')
      .then(val => {
        cep78contract = val;
        console.log(cep78contract);
        cy.log(cep78contract);
      });
  });

  it('Add cep78 collection', () => {
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy=token-input]')
      .parent()
      .click();
    cy.get('[data-cy=token-input]')
      .type(cep78contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep78contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep78contract}"]`)
      .should('be.visible')
      .find('[data-cy="noNft"]')
      .should('be.visible');
  });

  it('Mint cep78 nft', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`.v-list-item__title`)
      .contains(args.collection_name)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Mint"]`)
      .should('be.visible')
      .click();
    setArgs(cy, mintArgs);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Check cep78 collection', () => {
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click();

    cy.get('[data-cy=token-input]')
      .parent()
      .click();
    cy.get('[data-cy=token-input]')
      .type(cep78contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep78contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep78contract}"]`)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep78contract}-nft-0"]`)
      .should('be.visible');
  });
});
