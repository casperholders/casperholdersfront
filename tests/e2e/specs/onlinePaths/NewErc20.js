import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  name: 'testErc20',
  symbol: 'TESTERC20',
  decimals: '1',
  total_supply: '1000000000',
}

describe('Deploy & test erc20', () => {
  it('Deploy erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy=download-ERC20]').should('be.visible').click();
    cy.get('[data-cy="setArgs-ERC20"]').should('be.visible').click();
    cy.readFile('tests/e2e/fixtures/downloads/erc20_token.wasm', { encoding: null }, {timeout: 2000}).as('erc20_token');
    cy.get('#smartContractFile').selectFile('@erc20_token', { force: true });
    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    setArgs(cy, args);
    cy.get('[data-cy=amount]').type('{selectall}{del}100');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  /* it('It show balance for ERC20 tokens', () => {
    cy.visit('http://localhost:8080/balance');

    cy.get('[data-cy=balance-not-connected]')
      .should('be.visible')
      .should('contain', 'Not connected.');
    cy.get('[data-cy=erc20-balance]')
      .should('not.exist');

    const ERC20_CONTRACT_WITH_TOKENS_KEY = '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df';
    const ERC20_CONTRACT_WITHOUT_TOKENS_KEY = '6fcd116a32cc79d724981938ee8e449c80b1600089661b54be53b10fb7a482b8';

    mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c');

    cy.get('[data-cy=balance-not-connected]')
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
      .contains(/^(\d*,)*\d+\.\d* WCSPR$/);
    cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT_WITHOUT_TOKENS_KEY}]`)
      .should('be.visible')
      .contains('0.00000 ZEI');
  }); */
});


