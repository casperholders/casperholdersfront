import mockConnection from './mockConnection';

export default function testAllowanceUsing(
  activeKey,
  contractHash,
  contractUnit,
  spenderHash,
) {

  cy.visit('http://localhost:8080/balance', {
    onBeforeLoad: function (window) {
      window.localStorage.setItem(
        `casperholders.erc20.tokens.tracked.${activeKey.toLowerCase()}`,
        JSON.stringify([contractHash]),
      );
    },
  });

  mockConnection(cy, activeKey);

  cy.get(`[data-cy=erc20-balance-${contractHash}]`).should('be.visible');
  cy.get(`[data-cy=erc20-${contractHash}-allowance-open]`)
    .should('be.visible')
    .click();

  cy.get(`[data-cy=erc20-${contractHash}-${spenderHash}-allowance]`)
    .should('be.visible')
    .contains(new RegExp(`(\\d+,)?\\d+\.?\\d* ${contractUnit}`));
  cy.get(`[data-cy=erc20-${contractHash}-${spenderHash}-allowance-revoke]`)
    .should('be.visible')
    .click();
  cy.get(`[data-cy=erc20-${contractHash}-allowance-close]`)
    .should('be.visible')
    .click();

  cy.get('[data-cy=operationResult]', { timeout: 30000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  cy.get('[data-cy=removeDeployResult]').click();

  cy.get(`[data-cy=erc20-${contractHash}-allowance-open]`)
    .should('be.visible')
    .click();
  cy.get(`[data-cy=erc20-${contractHash}-${spenderHash}-allowance-max]`)
    .should('be.visible')
    .click();
  cy.get(`[data-cy=erc20-${contractHash}-allowance-close]`)
    .should('be.visible')
    .click();

  cy.get('[data-cy=operationResult]', { timeout: 30000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  cy.get('[data-cy=removeDeployResult]').click();
}
