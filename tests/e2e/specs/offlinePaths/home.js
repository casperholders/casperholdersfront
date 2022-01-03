describe('Home', () => {
  it('It show testnet', () => {
    cy.visit('http://localhost:8080/');

    cy.get('.v-toolbar__title').should('contain', ' Casper Holders TestNet ');
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
    cy.wait(5000);
    cy.get('#metrics-loading')
      .should('not.exist');
    cy.get('#metrics-chart')
      .should('be.visible');
    cy.get('#account')
      .should('be.visible').click();
    cy.get('#logout').should('be.visible').click();
    cy.get('#account')
      .should('not.exist');
    cy.get('#connect')
      .should('be.visible').click();
    cy.get('#connectDialog')
      .should('be.visible');
    cy.get('#connectLedger').should('be.visible').click();
    cy.get('#connectLedgerUSB').should('be.visible').click();
    cy.get('#retryButton').should('be.visible').click();
    cy.get('#connectCasperSigner').should('be.visible').click();
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.get('#connected').should('be.visible');
    cy.wait(3000);
    cy.get('#connected').should('not.exist');
    cy.get('#account')
      .should('be.visible');
    cy.get('#toggleDrawer').should('be.visible').click();
    cy.get('#drawer').should('be.visible');
  });
});
