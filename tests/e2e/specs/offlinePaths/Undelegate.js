import mockConnection from '../../helpers/mockConnection';

describe('Undelegate', () => {
  it('Should not let you do a undelegation', () => {
    cy.visit('http://localhost:8080/unstake');
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=errorBalance]').should('contain', ' Not connected. ');
    mockConnection(cy,'01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a');
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=errorBalance]').should('contain', 'Insufficient funds. You must have more than 2.5 CSPR on your wallet.');
    mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c');
    cy.get('[data-cy=unstakeOperation]').find('.v-alert').should('have.length', 0);
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=submitOperation]').click();
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=amount]').type('9999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=amount]').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
    cy.get('[data-cy=unstakeOperation]').find('[data-cy=validator]').parents('.v-input__control').find('.v-messages__message').should('contain', 'You need to select a validator');
  });
});
