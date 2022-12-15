describe('Home', () => {
  it('It show testnet', () => {
    cy.visit('http://localhost:8080/');

    cy.get('.v-toolbar__title .v-chip__content').should('contain', ' Testnet ');
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.get('#tutorial').click().get('.v-window__prev button').click()
      .should('be.visible');
    cy.get('#closeTutorial').click();
    cy.get('#tutorialDialog').should('not.be.visible');
    cy.get('#metrics-loading', { timeout: 5000 })
      .should('not.exist');
    cy.get('#metrics-chart')
      .should('be.visible');
    cy.get('#account')
      .should('be.visible').click();
    cy.get('#logout').scrollIntoView().should('be.visible').click();
    cy.get('#account', { timeout: 5000 })
      .should('not.exist');
    cy.get('#connect', { timeout: 5000 })
      .should('be.visible').click();
    cy.get('#connectDialog')
      .should('be.visible');
    cy.get('#connectLedger').should('be.visible').click();
    cy.get('#connectLedgerUSB').should('be.visible').click();
  });
});
