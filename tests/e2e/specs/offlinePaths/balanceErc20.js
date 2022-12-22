describe('Balance', () => {
  it('It show balance for ERC20 tokens', () => {
    cy.visit('http://localhost:8080/balance');
    cy.wait(500);
    cy.get('#balance-not-connected')
      .should('be.visible')
      .should('contain', 'Not connected.');
    cy.get('[data-cy=erc20-balance]')
      .should('not.exist');

    const ERC20_CONTRACT_WITH_TOKENS_KEY = '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df';
    const ERC20_CONTRACT_WITHOUT_TOKENS_KEY = '6fcd116a32cc79d724981938ee8e449c80b1600089661b54be53b10fb7a482b8';

    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.get('#balance-not-connected', { timeout: 5000 })
      .should('not.exist');
    cy.get('[data-cy=erc20-balance]')
      .should('be.visible');
    cy.get('[data-cy=erc20-add-button]')
      .should('be.visible');
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITH_TOKENS_KEY}]`)
      .should('not.exist');
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITHOUT_TOKENS_KEY}]`)
      .should('not.exist');

    cy.get('[data-cy=erc20-add-card]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT_WITH_TOKENS_KEY);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT_WITH_TOKENS_KEY}]`).click({ force: true });
    cy.get('[data-cy=erc20-add-submit]').click({ force: true });

    cy.get('[data-cy=erc20-add-card]')
      .should('not.exist');
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITH_TOKENS_KEY}]`)
      .should('be.visible')
      .contains(/^\d+\.\d{5} WCSPR$/);
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITHOUT_TOKENS_KEY}]`)
      .should('not.exist');

    cy.get('[data-cy=erc20-add-button]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT_WITHOUT_TOKENS_KEY);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT_WITHOUT_TOKENS_KEY}]`).click({ force: true });
    cy.get('[data-cy=erc20-add-submit]').click({ force: true });

    cy.get('[data-cy=erc20-add-card]')
      .should('not.exist');
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITH_TOKENS_KEY}]`)
      .should('be.visible')
      .contains(/^\d+\.\d{5} WCSPR$/);
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITHOUT_TOKENS_KEY}]`)
      .should('be.visible')
      .contains('0.00000 ZEI');
  });
  it('It show balance for Uniswap ERC20 tokens', () => {
    cy.visit('http://localhost:8080/balance');
    cy.wait(500);
    cy.get('#balance-not-connected')
      .should('be.visible')
      .should('contain', 'Not connected.');
    cy.get('[data-cy=erc20-balance]')
      .should('not.exist');

    const ERC20_CONTRACT = '35750604fe052d00244162dd0534e581e35494aa242ebae7a209c24ec490ca21';

    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.get('#balance-not-connected', { timeout: 5000 })
      .should('not.exist');
    cy.get('[data-cy=erc20-balance]')
      .should('be.visible');
    cy.get('[data-cy=erc20-add-button]')
      .should('be.visible');
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT}]`)
      .should('not.exist');

    cy.get('[data-cy=erc20-add-card]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT}]`).click({ force: true });
    cy.get('[data-cy=erc20-add-submit]').click({ force: true });

    cy.get('[data-cy=erc20-add-card]')
      .should('not.exist');
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT}]`)
      .should('be.visible')
      .contains(/^\d,\d+\.\d{5} UNITEST$/);
  });
});
