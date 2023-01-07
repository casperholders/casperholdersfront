import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import testAllowanceUsing from '../../helpers/testAllowance';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  name: 'testErc20',
  symbol: 'TESTERC20',
  decimals: '1',
  total_supply: '1000000000',
};

const approveArgs = {
  spender: '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df',
  amount: '1000000000000000',
};

let erc20Contract = '';

describe('Deploy & test erc20', () => {
  it('Deploy erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy=download-ERC20]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="setArgs-ERC20"]')
      .should('be.visible')
      .click();
    cy.readFile('tests/e2e/fixtures/downloads/erc20_token.wasm', { encoding: null }, { timeout: 2000 })
      .as('erc20_token');
    cy.get('#smartContractFile')
      .selectFile('@erc20_token', { force: true });
    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    setArgs(cy, args);
    cy.get('[data-cy=amount]')
      .type('{selectall}{del}100');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Approve erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Approve"]`)
      .should('be.visible')
      .click();
    cy.get('[data-cy=contractHash]')
      .invoke('val')
      .then(val => {
        erc20Contract = val;
        console.log(erc20Contract);
        cy.log(erc20Contract);
      });
    setArgs(cy, approveArgs);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}4');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('It show balance for ERC20 tokens', () => {
    cy.visit('http://localhost:8080/balance');

    cy.get('[data-cy=balance-not-connected]')
      .should('be.visible')
      .should('contain', 'Not connected.');
    cy.get('[data-cy=erc20-balance]')
      .should('not.exist');

    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    cy.get('[data-cy=balance-not-connected]')
      .should('not.exist');
    cy.get('[data-cy=erc20-balance]')
      .should('be.visible');
    cy.get('[data-cy=erc20-add-button]')
      .should('be.visible');
    cy.get(`[data-cy=erc20-balance-${erc20Contract}]`)
      .should('not.exist');

    cy.get('[data-cy=erc20-add-card]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=token-input]')
      .parent()
      .click();
    cy.get('[data-cy=token-input]')
      .type(erc20Contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${erc20Contract}]`)
      .click({ force: true });
    cy.get('[data-cy=erc20-add-submit]')
      .click({ force: true });

    cy.get('[data-cy=erc20-add-card]')
      .should('not.exist');
    cy.get(`[data-cy=erc20-balance-${erc20Contract}]`)
      .should('be.visible')
      .contains(/^(\d*,)*\d+\.\d* TESTERC20$/);
  });

  it('Should let you do a revoke/max of ERC20 allowance', () => {
    const ACTIVE_KEY = '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55';
    const ERC20_CONTRACT_UNIT = 'TESTERC20';

    testAllowanceUsing(
      ACTIVE_KEY,
      erc20Contract,
      ERC20_CONTRACT_UNIT,
      '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df',
    );
  });
});


