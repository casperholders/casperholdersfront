import 'cypress-real-events/support';

describe('Security', () => {
  it('Should remove and re-add an account hash', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        isMultisig: 'firstKey',
        activeKey: '015f7482183d83edb3e9b3f7fc4b5d7ce7b7e2b6381974b7af7d1c1ee82efabb93',
      },
    };
    cy.visit('http://localhost:8080/security');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.get('#b72e9cfc3929ac69ac7e7f913caeff03c36e554ff84430c771afb7aca13dfcc3-field').should('be.visible');
    cy.get('#b72e9cfc3929ac69ac7e7f913caeff03c36e554ff84430c771afb7aca13dfcc3-weight').should('be.visible').should('have.value', '1');
    cy.get('#b72e9cfc3929ac69ac7e7f913caeff03c36e554ff84430c771afb7aca13dfcc3-delete').should('be.visible').click();
    cy.get('#b72e9cfc3929ac69ac7e7f913caeff03c36e554ff84430c771afb7aca13dfcc3-weight').should('be.visible').should('have.value', '0');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();
    cy.get('#reset').click();
    cy.get('#b72e9cfc3929ac69ac7e7f913caeff03c36e554ff84430c771afb7aca13dfcc3-field').should('not.exist');
    cy.get('#addKey').click();
    cy.get('#2-delete').should('be.visible').click();
    cy.get('#2-delete').should('not.exist');
    cy.get('#addKey').click();
    cy.get('#2-field').should('be.visible').type('b72e9cfc3929ac69ac7e7f913caeff03c36e554ff84430c771afb7aca13dfcc3');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  });
});
