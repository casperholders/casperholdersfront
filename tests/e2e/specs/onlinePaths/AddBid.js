import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import waitForBalances from '../../helpers/waitForBalances';

describe('Add bid', () => {
  it('Should let you add bid', () => {
    cy.visit('http://localhost:8080/addbid');
    mockConnection(cy, '01Fed662DC7F1f7Af43Ad785Ba07a8cc05b7a96F9EE69613CfdE43BC56bEC1140B');
    waitForBalances(cy);
    sendTransaction(cy);
  });
});
