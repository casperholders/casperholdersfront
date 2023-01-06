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
    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    setArgs(cy, args);
    cy.get('[data-cy=amount]')
      .type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });
});
