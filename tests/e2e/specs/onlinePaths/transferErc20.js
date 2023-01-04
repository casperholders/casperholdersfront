import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import waitForBalances from '../../helpers/waitForBalances';

const ACTIVE_KEY = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
const TRANSFER_TO_KEY = '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5';
const ERC20_CONTRACT_KEY = '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df';
const UNISWAP_ERC20_CONTRACT_KEY = '35750604fe052d00244162dd0534e581e35494aa242ebae7a209c24ec490ca21';

function makeErc20Transfer(account, contract, recipient) {
  mockConnection(cy, account);
  cy.get('[data-cy=token-input]').parent().click();
  cy.get('[data-cy=token-input]').type(contract);
  cy.get(`.v-list-item__title[data-cy=token-contract-${contract}]`).click();
  cy.get('[data-cy=address]').type(recipient);
  cy.get('[data-cy=amount]').clear().type('0.1');
  waitForBalances(cy);
  sendTransaction(cy);
}

describe('Transfer ERC20', () => {
  // it('Should let you do a transfer of ERC20 tokens', () => {
  //   cy.visit('http://localhost:8080/transfer');
  //   makeErc20Transfer(ACTIVE_KEY, ERC20_CONTRACT_KEY, TRANSFER_TO_KEY);
  //
  //   cy.visit('http://localhost:8080/transfer');
  //   makeErc20Transfer(TRANSFER_TO_KEY, ERC20_CONTRACT_KEY, ACTIVE_KEY);
  // });
  // it('Should let you do a transfer of Uniswap ERC20 tokens', () => {
  //   cy.visit('http://localhost:8080/transfer');
  //   makeErc20Transfer(ACTIVE_KEY, UNISWAP_ERC20_CONTRACT_KEY, TRANSFER_TO_KEY);
  //
  //   cy.visit('http://localhost:8080/transfer');
  //   makeErc20Transfer(TRANSFER_TO_KEY, UNISWAP_ERC20_CONTRACT_KEY, ACTIVE_KEY);
  // });
});
