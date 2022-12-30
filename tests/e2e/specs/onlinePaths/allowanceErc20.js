describe('Allowance ERC20', () => {
  function testAllowanceUsing(
    activeKey,
    contractHash,
    contractUnit,
    spenderHash,
  ) {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey,
      },
    };

    cy.visit('http://localhost:8080/balance', {
      onBeforeLoad: function (window) {
        window.localStorage.setItem(
          `casperholders.erc20.tokens.tracked.${activeKey}`,
          JSON.stringify([contractHash]),
        );
      },
    });

    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);

    cy.get(`[data-cy=erc20-balance-${contractHash}]`).should('be.visible');
    cy.get(`[data-cy=erc20-${contractHash}-allowance-open]`)
      .should('be.visible')
      .click();

    cy.get(`[data-cy=erc20-${contractHash}-${spenderHash}-allowance]`)
      .should('be.visible')
      .contains(new RegExp(`(\\d+,)?\\d+\.\\d{5} ${contractUnit}`));
    cy.get(`[data-cy=erc20-${contractHash}-${spenderHash}-allowance-revoke]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy=erc20-${contractHash}-allowance-close]`)
      .should('be.visible')
      .click();

    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();

    cy.get(`[data-cy=erc20-${contractHash}-allowance-open]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy=erc20-${contractHash}-${spenderHash}-allowance-max]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy=erc20-${contractHash}-allowance-close]`)
      .should('be.visible')
      .click();

    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();
  }

  it('Should let you do a revoke/max of ERC20 allowance', () => {
    const ACTIVE_KEY = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
    const ERC20_CONTRACT_KEY = '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df';
    const ERC20_CONTRACT_UNIT = 'WCSPR';
    const SPENDER = '3233636434333534333034663465623164643637333963626136366434313537';

    testAllowanceUsing(
      ACTIVE_KEY,
      ERC20_CONTRACT_KEY,
      ERC20_CONTRACT_UNIT,
      SPENDER,
    );
  });

  it('Should let you do a revoke/max of Uniswap ERC20 allowance', () => {
    const ACTIVE_KEY = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
    const ERC20_CONTRACT_KEY = '35750604fe052d00244162dd0534e581e35494aa242ebae7a209c24ec490ca21';
    const ERC20_CONTRACT_UNIT = 'UNITEST';
    const SPENDER = '3233636434333534333034663465623164643637333963626136366434313537';

    testAllowanceUsing(
      ACTIVE_KEY,
      ERC20_CONTRACT_KEY,
      ERC20_CONTRACT_UNIT,
      SPENDER,
    );
  });
});
