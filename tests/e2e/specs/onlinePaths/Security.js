import 'cypress-real-events/support';
import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import waitForBalances from '../../helpers/waitForBalances';

describe('Security', () => {
  it('Should remove and re-add an account hash', () => {
    cy.visit('http://localhost:8080/security');
    mockConnection(cy, '01a5A5B7328118681638BE3e06c8749609280Dba4c9DAF9AeB3D3464b8839B018a', 'firstKey');
    waitForBalances(cy);

    //Check Main weight and set it to 4 if it's set to 1
    cy.get('#9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4-weight').invoke('val')
      .then(val => {
        if (val === '1') {
          cy.get('#9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4-weight').type('{selectall}{del}4');
          cy.get('#9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4-field').should('be.visible');
          cy.get('#9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4-weight').should('be.visible').should('have.value', '4');
          waitForBalances(cy);
          sendTransaction(cy);
        }
      });

    cy.get('#reset').click();

    //Main weight should be 4
    cy.get('#9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4-field').should('be.visible');
    cy.get('#9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4-weight').should('be.visible').should('have.value', '4');

    //Check thresholds and set them to 2 if they are set to 1
    cy.get('[data-cy=keyManagementThreshold]').invoke('val')
      .then(val => {
        if (val === '1') {
          cy.get('[data-cy=keyManagementThreshold]').type('{selectall}{del}2');
          sendTransaction(cy);
          cy.get('#reset').click();
        }
      });

    cy.get('[data-cy=deployThreshold]').invoke('val')
      .then(val => {
        if (val === '1') {
          cy.get('[data-cy=deployThreshold]').type('{selectall}{del}2');
          sendTransaction(cy);
          cy.get('#reset').click();
        }
      });

    // Threshold should be set to 2
    cy.get('[data-cy=keyManagementThreshold]').should('be.visible').should('have.value', '2');
    cy.get('[data-cy=deployThreshold]').should('be.visible').should('have.value', '2');

    cy.get('#reset').click();

    cy.get('[data-cy=loadingKeyInfo]').should('have.length', 0);
    cy.document().then(($document) => {
      const documentResult = $document.querySelectorAll('#ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd-field');
      if (!documentResult.length) {
        cy.get('#addKey').click();
        cy.get('#1-field').should('be.visible').type('ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd');
        waitForBalances(cy);
        sendTransaction(cy);
      }
    });

    cy.get('#reset').click();

    cy.get('[data-cy=loadingKeyInfo]').should('have.length', 0);
    cy.get('#addKey').click();
    cy.get('#addKey').click();
    cy.get('#3-delete').should('be.visible').click();
    cy.get('#3-delete').should('not.exist');
    cy.get('#2-delete').should('be.visible').click();
    cy.get('#2-delete').should('not.exist');
    cy.get('#reset').click();
    cy.get('#ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd-field').should('be.visible');
    cy.get('#ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd-weight').should('be.visible').should('have.value', '1');
    cy.get('#ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd-delete').should('be.visible').click();
    cy.get('#ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd-weight').should('be.visible').should('have.value', '0');
    waitForBalances(cy);
    sendTransaction(cy);
    cy.get('#reset').click();
    cy.get('#ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd-field').should('not.exist');
    cy.get('#addKey').click();
    cy.get('#1-field').should('be.visible').type('ffaa73331421de42fd71a28824e1606a1ca7fa754f91f501f0cf56015f7284cd');
    waitForBalances(cy);
    sendTransaction(cy);
  });
});

describe('Impersonation', () => {
  it('Should verify impersonation & multisig multi-key transfer', () => {
    cy.visit('http://localhost:8080/account');
    cy.wrap(Cypress.automation('remote:debugger:protocol', {
      command: 'Browser.grantPermissions',
      params: {
        permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
        origin: window.location.origin,
      },
    }));
    mockConnection(cy, '018b46617b2b97e633B36530f2964b3F4c15916235910A2737E83D4fA2c7FAD542', 'secondKey');

    cy.get('#impersonateKeyTextField').type('01c02669b2fe80b371744dfa18f6955b72c92c654371e099fb408c0b85f1d77410');
    cy.get('#accountAuthorization').should('contain', 'Account not authorized.');
    cy.get('#impersonateKeyTextField').clear().type('01a5A5B7328118681638BE3e06c8749609280Dba4c9DAF9AeB3D3464b8839B018a');
    cy.get('#accountAuthorization').should('contain', 'Account authorized.');

    cy.get('#toggleDrawer').click();
    cy.get('#nav-group-items-1').click();

    cy.get('[data-cy=address]').type('0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5');

    cy.get('[data-cy=submitOperation]').click();
    cy.get('[data-cy=agreeAndSign]').parents('.v-dialog').should('be.visible');
    cy.get('[data-cy=agreeAndSign]').click().parents('.v-dialog').should('not.be.visible');
    cy.get('#pendingWeightedDeploy-0').should('be.visible');
    cy.get('#copyLinkWeightedDeploy-0').focus().realClick();
    cy.wait(2000);
    cy.window().then((win) => win.navigator.clipboard.readText().then((text) => {
      console.log(text);
      cy.log(text);
      cy.visit(text);
    }));

    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');

    cy.get('#accountAuthorization').should('contain', ' Account not authorized to sign this deploy. ');

    mockConnection(cy, '01a5A5B7328118681638BE3e06c8749609280Dba4c9DAF9AeB3D3464b8839B018a', 'firstKey');

    cy.get('#accountAuthorization').should('contain', ' Account authorized to sign this deploy. ');

    cy.get('[data-cy=agreeAndSign]').click();
    cy.get('[data-cy=operationResult]', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('[data-cy=removeDeployResult]').click();
  });
});
