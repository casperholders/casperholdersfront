import mockConnection from './mockConnection';
import sendTransaction from './sendTransaction';
import waitForBalances from './waitForBalances';

export default function makeErc20Transfer(account, contract, recipient, multisig) {
  mockConnection(cy, account, multisig);
  cy.get('[data-cy=token-input]').parent().click();
  cy.get('[data-cy=token-input]').type(contract);
  cy.get(`.v-list-item__title[data-cy=token-contract-${contract}]`).click();
  cy.get('[data-cy=address]').type(recipient);
  cy.get('[data-cy=amount]').clear().type('0.1');
  waitForBalances(cy);
  sendTransaction(cy);
}
