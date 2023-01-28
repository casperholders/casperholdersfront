import 'cypress-real-events/support';
import mockConnection from '../../helpers/mockConnection';
import sendTransaction from '../../helpers/sendTransaction';
import setArgs from '../../helpers/setArgs';
import waitForBalances from '../../helpers/waitForBalances';

const args = {
  name: 'testAuction47',
  symbol: 'TESTAUCTION47',
  meta: {
    clType: 'map',
    keyType: 'String',
    valueType: 'String',
  },
  contract_name: 'testAuction47Contract',
};

const ACTIVE_KEY = '0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55';

const mintArgs = {
  recipient: ACTIVE_KEY,
};

let cep47contract = '';
let cep47contractPackage = '';

describe('Deploy and test cep47', () => {
  it('Deploy cep47', () => {
    cy.visit('http://localhost:8080/smartcontract');
    cy.get('[data-cy="download-NFT CEP47"]').should('be.visible').click();
    cy.get('[data-cy="setArgs-NFT CEP47"]').should('be.visible').click();
    cy.readFile('tests/e2e/fixtures/downloads/cep47_token.wasm', { encoding: null }, { timeout: 2000 }).as('cep47_token');
    cy.get('#smartContractFile').selectFile('@cep47_token', { force: true });
    mockConnection(cy, ACTIVE_KEY);
    setArgs(cy, args);
    cy.get('[data-cy=amount]').type('{selectall}{del}200');
    waitForBalances(cy);
    sendTransaction(cy);
  });

   it('Get cep47 contract hash', () => {
    cy.wait(5000);
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
    cy.get('[data-cy=contractHash]')
      .invoke('val')
      .then(val => {
        cep47contract = val;
        console.log(cep47contract);
        cy.log(cep47contract);
      });
     cy.get('[data-cy=contractPackageHash]')
       .invoke('val')
       .then(val => {
         cep47contractPackage = val;
         console.log(cep47contractPackage);
         cy.log(cep47contractPackage);
       });
  });

   it('Mint cep47 nft', () => {
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
    cy.get(`[data-cy=arg-panel-token_ids]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueListInput]')
      .find('[data-cy="listType"]')
      .type('U256');
    cy.get('.v-list-item__title').contains('U256').click();
    cy.get('[data-cy="listNewValue"]').click();
    cy.get(`[data-cy=arg-panel-content-token_ids]`)
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}1`);
    cy.get(`[data-cy=arg-panel-token_metas]`)
      .should('have.length', 1)
      .click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=CLValueListInput]')
      .find('[data-cy="listType"]')
      .type('Map');
    cy.get('.v-list-item__title').contains('Map').click();
    cy.get('[data-cy="listNewValue"]:visible').click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapKeyType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=CLValueMapInput]')
      .find('[data-cy="mapValueType"]')
      .type('String');
    cy.get('.v-list-item__title').contains('String').click();
    cy.get('[data-cy="mapNewValue"]').click();

    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-1]')
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestKey`);
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-1]')
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestValue`);

    cy.get('[data-cy="mapNewValue"]').click();

    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-2]')
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}name`);
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-2]')
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestNft47`);

    cy.get('[data-cy="mapNewValue"]').click();

    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-3]')
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}image`);
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-3]')
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}https://picsum.photos/500/400`);

    cy.get('[data-cy="mapNewValue"]').click();

    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-4]')
      .find('[data-cy=mapKeyValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}description`);
    cy.get(`[data-cy=arg-panel-content-token_metas]`)
      .find('[data-cy=mapValues-4]')
      .find('[data-cy=mapValueValue]')
      .find('[data-cy=CLValueRawInput]')
      .type(`{selectall}{del}TestDescription`);

    cy.get('[data-cy=amount]:visible')
      .type('{selectall}{del}10');
    waitForBalances(cy);
    sendTransaction(cy);
  });

   it('Sell nft cep47', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy=token-input]')
      .parent()
      .click({ force: true });
    cy.get('[data-cy=token-input]')
      .type(cep47contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep47contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep47contract}"]`)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=sellNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=cancelOperation]')
      .should('be.visible')
      .click({ force: true });

    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=sellNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=reservePrice]').type('100');
    cy.get('[data-cy=auctionTimerExtension]').type('60');
    cy.get('[data-cy=minimumBidStep]').type('5');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Check not yet started auction', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/marketplace');

    cy.get(`[data-cy="collection-${cep47contractPackage}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=currentPrice]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('No winning bid');

    cy.get('[data-cy=minBid]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('105.00000 CSPR');

    cy.get('[data-cy=timeLeft]')
      .should('be.visible')
      .should('have.length', 1)
      .contains(/\d+h \d+m \d+s/);

    cy.get('[data-cy=nbBidders]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('0 bidder(s) so far');

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('not.exist')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('not.exist')

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Not yet started');

    mockConnection(cy, ACTIVE_KEY);

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
  });

  it('Check started auction & cancel it', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/marketplace');

    cy.get(`[data-cy="collection-${cep47contractPackage}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=currentPrice]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('No winning bid');

    cy.get('[data-cy=minBid]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('105.00000 CSPR');

    cy.get('[data-cy=timeLeft]')
      .should('be.visible')
      .should('have.length', 1)
      .contains(/\d+h \d+m \d+s/);

    cy.get('[data-cy=nbBidders]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('0 bidder(s) so far');

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Live', {timeout: 120000});

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('not.exist')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('not.exist')

    mockConnection(cy, ACTIVE_KEY);

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=bidTab]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .click()
      .get('[data-cy=cancelAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTab]')
      .should('not.be.visible')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled');

    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Re-Sell nft cep47', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/nft');
    mockConnection(cy, ACTIVE_KEY);
    cy.get('[data-cy="nft-add-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy=token-input]')
      .parent()
      .click({ force: true });
    cy.get('[data-cy=token-input]')
      .type(cep47contract);
    cy.get(`.v-list-item__title[data-cy=token-contract-${cep47contract}]`)
      .click({ force: true });
    cy.get('[data-cy=nft-add-submit]')
      .click({ force: true });
    cy.get(`[data-cy="collection-${cep47contract}"]`)
      .should('be.visible');
    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=sellNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=cancelOperation]')
      .should('be.visible')
      .click({ force: true });

    cy.get(`[data-cy="collection-${cep47contract}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=sellNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=reservePrice]').type('100');
    cy.get('[data-cy=auctionTimerExtension]').type('60');
    cy.get('[data-cy=minimumBidStep]').type('5');
    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Check started auction & bid on it', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/marketplace');

    cy.get('[data-cy=pastAuctions]')
      .should('be.visible')
      .should('have.length', 1)
      .click();

    cy.get(`[data-cy="ended-collection-${cep47contractPackage}-nft-1-0"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });


    cy.get('[data-cy=operationTabs]')
      .should('not.exist');

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Finalized', {timeout: 120000});

    cy.get('[data-cy=backToAuctionList]')
      .click();

    cy.get(`[data-cy="collection-${cep47contractPackage}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=currentPrice]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('No winning bid');

    cy.get('[data-cy=minBid]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('105.00000 CSPR');

    cy.get('[data-cy=timeLeft]')
      .should('be.visible')
      .should('have.length', 1)
      .contains(/\d+h \d+m \d+s/);

    cy.get('[data-cy=nbBidders]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('0 bidder(s) so far');

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Not yet started');

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Live', {timeout: 120000});

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('not.exist')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('not.exist')

    mockConnection(cy, ACTIVE_KEY);

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=bidTab]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled');

    waitForBalances(cy);
    sendTransaction(cy);

    cy.visit('http://localhost:8080/marketplace');

    cy.get(`[data-cy="collection-${cep47contractPackage}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=currentPrice]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('105.00000 CSPR');

    cy.get('[data-cy=minBid]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('110.00000 CSPR');

    cy.get('[data-cy=nbBidders]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('1 bidder(s) so far');

    mockConnection(cy, ACTIVE_KEY);

    cy.get('[data-cy=winner]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('You\'re the current winner !');

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=bidTab]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .click()
      .get('[data-cy=bidTab]')
      .should('not.be.visible')
      .get('[data-cy=cancelBidTab]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=cancelAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled');

    waitForBalances(cy);
    sendTransaction(cy);

    cy.visit('http://localhost:8080/marketplace');

    cy.get(`[data-cy="collection-${cep47contractPackage}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=currentPrice]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('No winning bid');

    cy.get('[data-cy=minBid]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('105.00000 CSPR');

    cy.get('[data-cy=nbBidders]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('0 bidder(s) so far');

  });
  it('Finalize auction', () => {
    cy.wait(5000);
    cy.visit('http://localhost:8080/marketplace');
    cy.get(`[data-cy="collection-${cep47contractPackage}-nft-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });

    cy.get('[data-cy=currentPrice]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('No winning bid');

    cy.get('[data-cy=minBid]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('105.00000 CSPR');

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Live - Can\'t be cancelled anymore', {timeout: 360000});

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Ended. Waiting for finalization', {timeout: 360000});

    cy.get('[data-cy=timeLeft]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Auction ended');

    cy.get('[data-cy=nbBidders]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('0 bidder(s) so far');

    cy.get('[data-cy=operationTabs]')
      .should('not.exist');

    mockConnection(cy, ACTIVE_KEY);

    cy.get('[data-cy=operationTabs]')
      .should('be.visible')
      .should('have.length', 1)
      .get('[data-cy=bidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelBidTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=cancelAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('have.class', 'v-tab--disabled')
      .get('[data-cy=finalizeAuctionTabButton]')
      .should('be.visible')
      .should('have.length', 1)
      .should('not.have.class', 'v-tab--disabled')
      .get('[data-cy=finalizeAuctionTab]')
      .should('be.visible')
      .should('have.length', 1);

    waitForBalances(cy);
    sendTransaction(cy);
  });

  it('Check Finalized auction', () => {
    cy.wait(5000);

    cy.visit('http://localhost:8080/marketplace');
    cy.get(`[data-cy="ended-collection-${cep47contractPackage}-nft-1-1"]`)
      .should('not.exist');

    cy.get('[data-cy=pastAuctions]')
      .should('be.visible')
      .should('have.length', 1)
      .click();

    cy.get(`[data-cy="ended-collection-${cep47contractPackage}-nft-1-1"]`)
      .should('be.visible')
      .should('have.length', 1)
      .realHover('mouse')
      .get('[data-cy=bidNFT]')
      .should('be.visible')
      .should('have.length', 1)
      .click({ force: true });


    cy.get('[data-cy=operationTabs]')
      .should('not.exist');

    cy.get('[data-cy=livenessIndicator]')
      .should('be.visible')
      .should('have.length', 1)
      .contains('Finalized');
  });
});
