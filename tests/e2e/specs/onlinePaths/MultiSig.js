import 'cypress-real-events/support';

describe('MultiSig', () => {
  it('Should let you do a transfer', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        isMultisig: 'firstKey',
        activeKey: '015f7482183d83edb3e9b3f7fc4b5d7ce7b7e2b6381974b7af7d1c1ee82efabb93',
      },
    };
    cy.visit('http://localhost:8080/transfer');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.get('#address').type('0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#disagree').click().parents('.v-dialog').should('not.be.visible');
    cy.wait(5000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  });
  it('Should verify impersonation & multisig multi-key transfer', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        isMultisig: 'secondKey',
        activeKey: '011a2a0ae0fc96c1bb706197bdbc0f8fb85b3ac894861e39997242d5541f3e57a8',
      },
    };
    cy.visit('http://localhost:8080/settings');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(1000);
    cy.get('#impersonateKeyTextField').type('01c02669b2fe80b371744dfa18f6955b72c92c654371e099fb408c0b85f1d77410');
    cy.get('#accountAuthorization').should('contain', 'Account not authorized.');
    cy.get('#impersonateKeyTextField').clear().type('015f7482183d83edb3e9b3f7fc4b5d7ce7b7e2b6381974b7af7d1c1ee82efabb93');
    cy.get('#accountAuthorization').should('contain', 'Account authorized.');
    cy.wait(1000);
    cy.get('#toggleDrawer').click();
    cy.get('#nav-group-Account-items-2').click();
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(1000);
    cy.get('#address').type('0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(1000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('#pendingWeightedDeploy-0').should('be.visible');
    cy.get('#copyLinkWeightedDeploy-0').focus().realClick();
    cy.wait(2000);
    cy.window().then((win) => win.navigator.clipboard.readText().then((text) => cy.visit(text)));
    const msg2 = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    const event2 = new CustomEvent('signer:connected', msg2);
    cy.window().then((win) => {
      win.dispatchEvent(event2);
    });
    cy.get('#accountAuthorization').should('contain', ' Account not authorized to sign this deploy. ');
    const msg3 = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        isMultisig: 'firstKey',
        activeKey: '015f7482183d83edb3e9b3f7fc4b5d7ce7b7e2b6381974b7af7d1c1ee82efabb93',
      },
    };
    const event3 = new CustomEvent('signer:connected', msg3);
    cy.window().then((win) => {
      win.dispatchEvent(event3);
    });
    cy.get('#accountAuthorization').should('contain', ' Account authorized to sign this deploy. ');
    cy.wait(2000);
    cy.get('#agreeAndSign').click();
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
  });
});
