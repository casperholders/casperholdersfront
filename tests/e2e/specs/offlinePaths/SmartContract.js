import mockConnection from '../../helpers/mockConnection';

describe('Smart Contract', () => {
  it('Should not let send smart contract', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=errorBalance]').should('contain', ' Not connected. ');
    mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a');
    cy.get('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=errorBalance]').should('contain', ' Insufficient funds. You must have more than 1 CSPR on your wallet. ');
    mockConnection(cy, '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');
    cy.get('.v-alert').should('have.length', 0);
    cy.get('[data-cy=submitOperation]').click();
    cy.get('[data-cy=amount]').type('9999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('[data-cy=amount]').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
  });
});
