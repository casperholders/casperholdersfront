export default function (cy) {
  cy.get('[data-cy=loadedBalance]').should('have.length.greaterThan', 1);
  cy.get('[data-cy=loadingBalance]').should('have.length', 0);
}
