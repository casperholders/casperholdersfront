import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  public_key: '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55',
  name: 'testUniswapErc20',
  symbol: 'TESTUNISWAPERC20',
  decimals: '1',
  initial_supply: '1000000000',
  contract_name: 'testUniswapErc20Contract'
}

describe('Deploy & test Uniswap erc20', () => {
  it('Deploy uniswap erc20', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy="download-Uniswap ERC20"]').should('be.visible').click();
    cy.get('[data-cy="setArgs-Uniswap ERC20"]').should('be.visible').click();
    cy.readFile('tests/e2e/fixtures/downloads/uniswap_erc20_token.wasm', { encoding: null }, {timeout: 2000}).as('uniswap_erc20_token');
    cy.get('#smartContractFile').selectFile('@uniswap_erc20_token', { force: true });
    mockConnection(cy, '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55');
    setArgs(cy, args);
    cy.get('[data-cy=amount]').type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  // it('It show balance for Uniswap ERC20 tokens', () => {
  //   cy.visit('http://localhost:8080/balance');
  //   cy.wait(500);
  //   cy.get('[data-cy=balance-not-connected]')
  //     .should('be.visible')
  //     .should('contain', 'Not connected.');
  //   cy.get('[data-cy=erc20-balance]')
  //     .should('not.exist');
  //
  //   const ERC20_CONTRACT = '35750604fe052d00244162dd0534e581e35494aa242ebae7a209c24ec490ca21';
  //   mockConnection(cy, '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c');
  //   cy.get('[data-cy=balance-not-connected]')
  //     .should('not.exist');
  //   cy.get('[data-cy=erc20-balance]')
  //     .should('be.visible');
  //   cy.get('[data-cy=erc20-add-button]')
  //     .should('be.visible');
  //   cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT}]`)
  //     .should('not.exist');
  //
  //   cy.get('[data-cy=erc20-add-card]')
  //     .should('be.visible')
  //     .click();
  //   cy.get('[data-cy=token-input]').parent().click();
  //   cy.get('[data-cy=token-input]').type(ERC20_CONTRACT);
  //   cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT}]`).click({ force: true });
  //   cy.get('[data-cy=erc20-add-submit]').click({ force: true });
  //
  //   cy.get('[data-cy=erc20-add-card]')
  //     .should('not.exist');
  //   cy.get(`[data-cy=erc20-balance-${ERC20_CONTRACT}]`)
  //     .should('be.visible')
  //     .contains(/^(\d*,)*\d+\.\d* UNITEST$/);
  // });
});
