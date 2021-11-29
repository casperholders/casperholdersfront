describe('Transfer', () => {
  it('Should not let you do a transfer', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a',
      },
    };
    cy.visit('http://localhost:8080/transfer');
    cy.get('.v-alert').should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Not connected. ');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(2000);
    cy.get('.v-alert').should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Insufficient funds. You must have more than 2.6 CSPR on your wallet. ');
    cy.wait(1000).window().then((win) => {
      msg.detail.activeKey = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
      win.dispatchEvent(event);
    });
    cy.get('.v-alert').should('have.length', 0);
    cy.get('#submitOperation').click();
    cy.get('#address').parents('.v-input__control').find('.v-messages__message').should('contain', 'Address is required');
    cy.get('#address').type('NotValidAddress').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Error: Invalid public key');
    cy.get('#amount').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
    cy.get('#amount').type('9999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('#amount').type('{selectall}{del}1').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must be at least');
    cy.get('#transferID').type('NotValidTransferID').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Transfer ID must be a number');
    cy.get('#transferID').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Transfer ID is required');
    cy.get('#min').click();
    cy.get('#amount').invoke('val').should('contain', '2.5');
    cy.get('#amount').parents('.v-input').find('.v-input__append-outer button').click();
    cy.get('#amount').invoke('val').should('contain', '3.5');
    cy.get('#amount').parents('.v-input').find('.v-input__append-outer button').click();
    cy.get('#amount').invoke('val').should('contain', '4.5');
    cy.get('#amount').parents('.v-input').find('.v-input__prepend-outer button').click();
    cy.get('#amount').invoke('val').should('contain', '3.5');
    cy.get('#amount').parents('.v-input').find('.v-input__prepend-outer button').click();
    cy.get('#amount').invoke('val').should('contain', '2.5');
    cy.get('#amount').parents('.v-input').find('.v-input__prepend-outer button').click();
    cy.get('#amount').invoke('val').should('contain', '2.5');
    cy.get('#max').click();
    cy.get('#amount').invoke('val').then((val) => {
      cy.get('#amount').parents('.v-input').find('.v-input__append-outer button').click();
      cy.get('#amount').invoke('val').should('contain', val);
    });
  });
});
