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
}

describe('Deploy and test cep47', () => {
  it('Deploy cep47', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy="download-NFT CEP47"]').should('be.visible').click();
    cy.get('[data-cy="setArgs-NFT CEP47"]').should('be.visible').click();
    cy.readFile('tests/e2e/fixtures/downloads/cep47_token.wasm', { encoding: null }, {timeout: 2000}).as('cep47_token');
    cy.get('#smartContractFile').selectFile('@cep47_token', { force: true });
    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    setArgs(cy, args);
    cy.get('[data-cy=amount]').type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });
});
