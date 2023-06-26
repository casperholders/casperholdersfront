import mockConnection from '../../helpers/mockConnection';

describe('Withdraw bid', () => {
  it('Should not let you withdraw bid', () => {
    cy.visit('http://localhost:8080/withdrawbid');
    cy.get('[data-cy=withdrawOperation]').find('[data-cy=errorBalance]').should('have.length', 1);
    cy.get('[data-cy=withdrawOperation]').find('[data-cy=errorBalance]').should('contain', ' Not connected. ');
    mockConnection(cy, '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');
    cy.get('[data-cy=withdrawOperation]').find('.v-alert .error').should('have.length', 0);
    cy.get('[data-cy=withdrawOperation]').find('[data-cy=submitOperation]').click();
    cy.get('[data-cy=withdrawOperation]').find('[data-cy=amount]').type('9999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('[data-cy=withdrawOperation]').find('[data-cy=amount]').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
  });
});
