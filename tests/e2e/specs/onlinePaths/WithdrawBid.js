describe('Withdraw bid', () => {
  it('Should let you withdraw bid', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5',
      },
    };
    cy.visit('http://localhost:8080/withdrawbid');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(2000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.operationResult').should('have.length', 1).should('contain', 'Waiting for the deploy result');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats ! The operation succeeded');
  });
});
