import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  public_key: '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55',
  name: 'testUniswapErc20',
  symbol: 'TESTUNISWAPERC20',
  decimals: '10',
  initial_supply: '1000000000',
  contract_name: 'testUniswapErc20Contract'
}

describe('Add bid', () => {
  it('Should let you add bid', () => {
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
});
