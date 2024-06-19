import mockConnection from '../../helpers/mockConnection';

describe('Transfer', () => {
  it('Should not let you do a transfer', () => {
    cy.visit('http://localhost:8080/transfer');
    cy.get('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=errorBalance]').should('contain', ' Not connected. ');
    mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a');
    cy.get('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=errorBalance]').should('contain', ' Insufficient funds. You must have more than 2.6 CSPR on your wallet. ');
    mockConnection(cy, '0184f6d260f4ee6869ddb36affe15456de6ae045278fa2f467bb677561ce0dad55');
    cy.get('[data-cy=errorBalance]').should('have.length', 0);
    cy.get('[data-cy=submitOperation]').click();
    cy.get('[data-cy=address]').parents('.v-input__control').find('.v-messages__message').should('contain', 'Address is required');
    cy.get('[data-cy=address]').type('NotValidAddress').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Error: Invalid public key');
    cy.get('[data-cy=amount]').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
    cy.get('[data-cy=amount]').type('9999999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('[data-cy=amount]').type('{selectall}{del}1').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must be at least');
    cy.get('[data-cy=transferID]').type('NotValidTransferID').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Transfer ID must be a number');
    cy.get('[data-cy=transferID]').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Transfer ID is required');
    cy.get('[data-cy=min]').click();
    cy.get('[data-cy=amount]').invoke('val').should('contain', '2.5');
    cy.get('[data-cy=amount]').parents('.v-input').find('.v-input__append-outer button').click();
    cy.get('[data-cy=amount]').invoke('val').should('contain', '3.5');
    cy.get('[data-cy=amount]').parents('.v-input').find('.v-input__append-outer button').click();
    cy.get('[data-cy=amount]').invoke('val').should('contain', '4.5');
    cy.get('[data-cy=amount]').parents('.v-input').find('.v-input__prepend-outer button').click();
    cy.get('[data-cy=amount]').invoke('val').should('contain', '3.5');
    cy.get('[data-cy=amount]').parents('.v-input').find('.v-input__prepend-outer button').click();
    cy.get('[data-cy=amount]').invoke('val').should('contain', '2.5');
    cy.get('[data-cy=amount]').parents('.v-input').find('.v-input__prepend-outer button').click();
    cy.get('[data-cy=amount]').invoke('val').should('contain', '2.5');
    cy.get('[data-cy=max]').click();
    cy.get('[data-cy=amount]').invoke('val').then((val) => {
      cy.get('[data-cy=amount]').parents('.v-input').find('.v-input__append-outer button').click();
      cy.get('[data-cy=amount]').invoke('val').should('contain', val);
    });
  });
});
