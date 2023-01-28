import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import waitForBalances from '../../helpers/waitForBalances';

describe('Transfer', () => {
  it('Should let you do a transfer', () => {
    cy.visit('http://localhost:8080/transfer');
    mockConnection(cy, '0184f6d260f4ee6869ddb36affe15456de6ae045278fa2f467bb677561ce0dad55');
    cy.get('[data-cy=address]').type('0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');
    waitForBalances(cy);
    sendTransaction(cy);
  });
});
