import mockConnection from '../../helpers/mockConnection';

describe('Home', () => {
  it('It show testnet', () => {
    cy.visit('http://localhost:8080/');

    cy.get('[data-cy=humanReadableNetwork]').should('contain', ' Testnet ');
    mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c');
    cy.get('[data-cy=account]')
      .should('be.visible').click();
    cy.get('[data-cy=logout]').should('be.visible').click();
    cy.get('[data-cy=account]')
      .should('not.exist');
    cy.get('[data-cy=connect]')
      .should('be.visible').click();
    cy.get('[data-cy=connectDialog]')
      .should('be.visible');
    cy.get('[data-cy=connectLedger]').should('be.visible').click();
    cy.get('[data-cy=connectLedgerUSB]').should('be.visible').click();
  });
});
