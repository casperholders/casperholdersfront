import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import waitForBalances from '../../helpers/waitForBalances';

describe('Smart Contract', () => {
  it('Should let send smart contract', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, '0184f6d260f4ee6869ddb36affe15456de6ae045278fa2f467bb677561ce0dad55');
    cy.fixture('counter.wasm', { encoding: null }).as('counter');
    cy.get('#smartContractFile').selectFile('@counter', { force: true });
    cy.get('[data-cy=amount]').type('{selectall}{del}50');
    waitForBalances(cy);
    sendTransaction(cy);
  });
});
