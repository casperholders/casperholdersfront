import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  name: 'testErc20',
  symbol: 'TESTERC20',
  decimals: '10',
  total_supply: '1000000000',
}

describe('Add bid', () => {
  it('Should let you add bid', () => {
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
});
