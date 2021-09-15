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
    // wait for the store to initialize
    cy.window().should('have.property', '__store__');
    cy.window().then((win) => {
      win.__store__.dispatch('updateFromSignerEvent', msg.detail);
    });
    cy.wait(5000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.operationResult').should('have.length', 1).should('contain', 'Waiting for the deploy result');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats ! The operation succeeded');
  });
  it('Should not let you do a delegation', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a',
      },
    };
    cy.visit('http://localhost:8080/stake');
    cy.get('.v-alert').should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Not connected on Signer. ');
    // wait for the store to initialize
    cy.window().should('have.property', '__store__');

    cy.window().then((win) => {
      win.__store__.dispatch('updateFromSignerEvent', msg.detail);
    });
    cy.wait(5000);
    cy.get('.v-alert').should('have.length', 1);
    cy.get('.v-alert').should('contain', ' Insufficient funds. You must have more than 3.50001 CSPR on your wallet. ');
    cy.wait(1000).then(() => {
      msg.detail.activeKey = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
      cy.window().then((win) => {
        win.__store__.dispatch('updateFromSignerEvent', msg.detail);
      });
    });
    cy.get('.v-alert').should('have.length', 0);
    cy.get('#submitOperation').click();
    cy.get('#amount').type('9999999').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount must equal or bellow');
    cy.get('#amount').type('{selectall}{del}').parents('.v-input__control').find('.v-messages__message')
      .should('contain', 'Amount is required');
  });
});
