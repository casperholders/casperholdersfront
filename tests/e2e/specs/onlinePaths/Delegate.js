describe('Delegate', () => {
  it('Should let you do a delegation', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    cy.visit('http://localhost:8080/stake');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(2000);
    cy.get('#validator').parent().click();
    cy.get('#validator').type('0124BFDae2Ed128fa5e4057BC398E4933329570E47240e57fc92F5611A6178EBA5');
    cy.get('.v-list-item__title').contains('0124BFDae2Ed128fa5e4057BC398E4933329570E47240e57fc92F5611A6178EBA5').click();
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  });
});
