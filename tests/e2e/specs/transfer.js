describe('Transfer', () => {
  it('Should let you do a transfer', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    cy.visit('http://localhost:8080/transfer');
    // wait for the store to initialize
    cy.window().should('have.property', '__store__');
    cy.window().then((win) => {
      win.__store__.dispatch('updateFromSignerEvent', msg.detail);
    });
    cy.wait(5000);
    cy.get('#address').type('0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.operationResult').should('have.length', 1).should('contain', 'Waiting for the deploy result');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats ! The operation succeeded');
  });
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
    cy.get('.v-alert').should('contain', ' Not connected on Signer. ');
    // wait for the store to initialize
    cy.window().should('have.property', '__store__');

    cy.window().then((win) => {
      win.__store__.dispatch('updateFromSignerEvent', msg.detail);
    });
    cy.wait(5000);
    cy.get('.v-alert').should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Insufficient funds. You must have more than 2.50001 CSPR on your wallet. ');
    cy.wait(1000).then(() => {
      msg.detail.activeKey = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
      cy.window().then((win) => {
        win.__store__.dispatch('updateFromSignerEvent', msg.detail);
      });
    });
    cy.get('.v-alert').should('have.length', 0);
    cy.get('#submitOperation').click();
    cy.get('#address').parents('.v-input__control').find('.v-messages__message').should('contain', 'Address is required');
    cy.get('#address').type('NotValidAddress').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Error: Unsupported type of public key');
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
