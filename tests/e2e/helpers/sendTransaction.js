export default function (cy) {
  cy.get('[data-cy=submitOperation]').click();
  cy.get('[data-cy=agreeAndSign]').parents('.v-dialog').should('be.visible');
  cy.get('[data-cy=disagree]').click().parents('.v-dialog').should('not.be.visible');
  cy.get('[data-cy=submitOperation]').click();
  cy.get('[data-cy=agreeAndSign]').parents('.v-dialog').should('be.visible');
  cy.get('[data-cy=agreeAndSign]').click().parents('.v-dialog').should('not.be.visible');
  cy.scrollTo('bottom');
  cy.get('[data-cy=operationResult]', { timeout: 30000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  cy.get('[data-cy=removeDeployResult]').click();
}
