describe('Add bid', () => {
  it('Should not let you add bid', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a',
      },
    };
    const event = new CustomEvent('signer:connected', msg);
    cy.visit('http://localhost:8080/addbid');
    cy.get('.v-alert').should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Not connected. ');
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.get('.v-alert', { timeout: 10000 }).should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Unable to retrieve your Validator balance. Make sure that you are correctly bonded to the network. ');
    cy.wait(1000).window().then((win) => {
      msg.detail.activeKey = '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5';
      win.dispatchEvent(event);
    });
    cy.get('.v-alert').should('have.length', 0);
    cy.get('#submitOperation').click();
    cy.get('#amount').type('9999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('#amount').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
  });
});
