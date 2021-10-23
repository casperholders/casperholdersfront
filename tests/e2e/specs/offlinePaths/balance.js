describe('Balance', () => {
  it('It show balance', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    cy.visit('http://localhost:8080/balance');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(2000);

    cy.get('#balance-no-liquidity')
      .should('not.exist');
    cy.get('#balance-chart')
      .should('be.visible')
      .and((chart) => {
        expect(chart.height()).to.be.equals(400);
      });

    cy.wait(1000).window().then((win) => {
      msg.detail.activeKey = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a';
      win.dispatchEvent(event);
    });

    cy.get('#balance-chart')
      .should('not.exist');
    cy.get('#balance-no-liquidity')
      .should('be.visible')
      .should('contain', 'No liquidity available');
  });
});
