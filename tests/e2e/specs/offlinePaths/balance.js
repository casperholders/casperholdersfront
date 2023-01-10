import mockConnection from '../../helpers/mockConnection';

describe('Balance', () => {
  it('It show balance', () => {
    cy.visit('http://localhost:8080/balance');

    cy.get('[data-cy=balance-not-connected]')
      .should('be.visible')
      .should('contain', 'Not connected.');

    mockConnection(cy, '0184f6d260f4ee6869ddb36affe15456de6ae045278fa2f467bb677561ce0dad55');

    cy.get('[data-cy=balance-not-connected]')
      .should('not.exist');
    cy.get('[data-cy=balance-total-staked] .amount')
      .should('be.visible')
      .should('not.contain', '0.00000\xa0CSPR')
      .contains(/^(\d*,)*\d+\.\d{5} CSPR$/);
    cy.get('[data-cy=balance-total-available] .amount')
      .should('be.visible')
      .should('not.contain', /^0.00000\xa0CSPR$/)
      .contains(/^(\d*,)*\d+\.\d{5} CSPR$/);
    cy.get('[data-cy=balance-total] .amount')
      .should('be.visible')
      .should('not.contain', '0.00000\xa0CSPR')
      .contains(/^(\d*,)*\d+\.\d{5} CSPR$/);

    cy.get('[data-cy=reward-calculator-panel-header]').click();
    cy.get('[data-cy=reward-calculator]').should('be.visible');
    cy.get('[data-cy=operations]').contains(/.+-.+ of .+/);

    mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a');

    cy.get('[data-cy=balance-not-connected]')
      .should('not.exist');
    cy.get('[data-cy=balance-total-staked] .amount')
      .should('be.visible')
      .should('contain', '0.00000\xa0CSPR');
    cy.get('[data-cy=balance-total-available] .amount')
      .should('be.visible')
      .should('contain', '0.00000\xa0CSPR');
    cy.get('[data-cy=balance-total] .amount')
      .should('be.visible')
      .should('contain', '0.00000\xa0CSPR');
  });
});
