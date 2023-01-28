import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import waitForBalances from '../../helpers/waitForBalances';

describe('Delegate', () => {
  it('Should let you do a delegation', () => {
    cy.visit('http://localhost:8080/stake');
    mockConnection(cy, '0184f6d260f4ee6869ddb36affe15456de6ae045278fa2f467bb677561ce0dad55');
    cy.get('[data-cy=validator]').parent().click();
    cy.get('[data-cy=validator]').type('01fed662dc7f1f7af43ad785ba07a8cc05b7a96f9ee69613cfde43bc56bec1140b');
    cy.get('.v-list-item__title').contains('01fed662dc7f1f7af43ad785ba07a8cc05b7a96f9ee69613cfde43bc56bec1140b', { matchCase: false }).click();
    waitForBalances(cy);
    sendTransaction(cy);
  });
});
