describe('Add bid', () => {
  it('Should let you add bid', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5',
      },
    };
    cy.visit('http://localhost:8080/addbid');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(2000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  });
});
