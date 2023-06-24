import makeErc20Transfer from '../../helpers/makeErc20Transfer';
import mockConnection from '../../helpers/mockConnection';
import retries from '../../helpers/retries';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import testAllowanceUsing from '../../helpers/testAllowance';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  public_key: '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55',
  name: 'testUniswapErc20',
  symbol: 'TESTUNISWAPERC20',
  decimals: '1',
  initial_supply: '1000000000',
  contract_name: 'testUniswapErc20Contract',
};

const approveArgs = {
  spender: '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df',
  amount: '1000000000000000',
};

const burnArgs = {
  from: args.public_key,
  amount: '10',
};
const mintArgs = {
  to: args.public_key,
  amount: '10',
};

const ACTIVE_KEY = '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55';
const TRANSFER_TO_KEY = '01a5A5B7328118681638BE3e06c8749609280Dba4c9DAF9AeB3D3464b8839B018a';

let uniswapContract = '';

describe('Deploy & test Uniswap erc20', () => {
  it('Deploy uniswap erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy="download-Uniswap ERC20"]').scrollIntoView().should('be.visible').click();
    cy.get('[data-cy="setArgs-Uniswap ERC20"]').scrollIntoView().should('be.visible').click();
    cy.readFile('tests/e2e/fixtures/downloads/uniswap_erc20_token.wasm', { encoding: null }, {timeout: 2000}).as('uniswap_erc20_token');
    cy.get('#smartContractFile').selectFile('@uniswap_erc20_token', { force: true });
    mockConnection(cy, ACTIVE_KEY);
    setArgs(cy, args);
    cy.get('[data-cy=amount]').type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Approve uniswap erc20', retries, () => {
    cy.wait(30000);
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
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
        uniswapContract = val;
        console.log(uniswapContract);
        cy.log(uniswapContract);
      });
    setArgs(cy, approveArgs);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Burn uniswap erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Burn"]`)
      .should('be.visible')
      .click();
    setArgs(cy, burnArgs);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Mint uniswap erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="manageSmartContract"]')
      .should('be.visible')
      .click();
    cy.get(`[data-cy="${args.name}"]`)
      .should('be.visible')
      .click();
    cy.get(`[data-cy="Mint"]`)
      .should('be.visible')
      .click();
    setArgs(cy, mintArgs);
    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('It show balance for Uniswap ERC20 tokens', () => {
    cy.visit('http://localhost:8080/balance');

    cy.get('[data-cy=balance-not-connected]')
      .should('be.visible')
      .should('contain', 'Not connected.');
    cy.get('[data-cy=erc20-balance]')
      .should('not.exist');

    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy=balance-not-connected]')
      .should('not.exist');
    cy.get('[data-cy=erc20-balance]')
      .should('be.visible');
    cy.get('[data-cy=erc20-add-button]')
      .should('be.visible');
    cy.get(`[data-cy=erc20-balance-${uniswapContract}]`)
      .should('not.exist');

    cy.get('[data-cy=erc20-add-card]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=token-input]')
      .parent()
      .click();
    cy.get('[data-cy=token-input]')
      .type(uniswapContract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${uniswapContract}]`)
      .click({ force: true });
    cy.get('[data-cy=erc20-add-submit]')
      .click({ force: true });

    cy.get('[data-cy=erc20-add-card]')
      .should('not.exist');
    cy.get(`[data-cy=erc20-balance-${uniswapContract}]`)
      .should('be.visible')
      .contains(/^(\d*,)*\d+\.\d* TESTUNISWAPERC20$/);
  });

  it('Should let you do a revoke/max of Uniswap ERC20 allowance', () => {
    testAllowanceUsing(
      ACTIVE_KEY,
      uniswapContract,
      args.symbol,
      approveArgs.spender,
    );
  });

  it('Should let you do a transfer of Uniswap ERC20 tokens', () => {
    cy.visit('http://localhost:8080/transfer');
    makeErc20Transfer(ACTIVE_KEY, uniswapContract, TRANSFER_TO_KEY);

    cy.visit('http://localhost:8080/transfer');
    makeErc20Transfer(TRANSFER_TO_KEY, uniswapContract, ACTIVE_KEY, 'firstKey');
  });
});
