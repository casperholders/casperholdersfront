describe('Transfer ERC20', () => {
  it('Should let you do a transfer of ERC20 tokens', () => {
    const ACTIVE_KEY = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
    const ERC20_CONTRACT_KEY = '9af628fe541a8ad58e020a79f7260228dc58745e295f5dfa2dedd497064e31df';
    const TRANSFER_TO_KEY = '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5';

    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: ACTIVE_KEY,
      },
    };
    cy.visit('http://localhost:8080/transfer');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT_KEY);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT_KEY}]`).click();
    cy.get('#address').type(TRANSFER_TO_KEY);
    cy.get('#amount').clear().type('0.1');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#disagree').click().parents('.v-dialog').should('not.be.visible');
    cy.wait(5000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();
    cy.get('.operationResult').should('have.length', 0);

    const msgTransferBack = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: TRANSFER_TO_KEY,
      },
    };
    cy.visit('http://localhost:8080/transfer');
    const eventTransferBack = new CustomEvent('signer:connected', msgTransferBack);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT_KEY);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT_KEY}]`).click();
    cy.get('#address').type(ACTIVE_KEY);
    cy.get('#amount').clear().type('0.1');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#disagree').click().parents('.v-dialog').should('not.be.visible');
    cy.wait(5000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();
    cy.get('.operationResult').should('have.length', 0);
  });
  it('Should let you do a transfer of Uniswap ERC20 tokens', () => {
    const ACTIVE_KEY = '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c';
    const ERC20_CONTRACT_KEY = '35750604fe052d00244162dd0534e581e35494aa242ebae7a209c24ec490ca21';
    const TRANSFER_TO_KEY = '0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5';

    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: ACTIVE_KEY,
      },
    };
    cy.visit('http://localhost:8080/transfer');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT_KEY);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT_KEY}]`).click();
    cy.get('#address').type(TRANSFER_TO_KEY);
    cy.get('#amount').clear().type('0.1');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#disagree').click().parents('.v-dialog').should('not.be.visible');
    cy.wait(5000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();
    cy.get('.operationResult').should('have.length', 0);

    const msgTransferBack = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: TRANSFER_TO_KEY,
      },
    };
    cy.visit('http://localhost:8080/transfer');
    const eventTransferBack = new CustomEvent('signer:connected', msgTransferBack);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.get('[data-cy=token-input]').parent().click();
    cy.get('[data-cy=token-input]').type(ERC20_CONTRACT_KEY);
    cy.get(`.v-list-item__title[data-cy=token-contract-${ERC20_CONTRACT_KEY}]`).click();
    cy.get('#address').type(ACTIVE_KEY);
    cy.get('#amount').clear().type('0.1');
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#disagree').click().parents('.v-dialog').should('not.be.visible');
    cy.wait(5000);
    cy.get('#submitOperation').click();
    cy.get('#agreeAndSign').parents('.v-dialog').should('be.visible');
    cy.get('#agreeAndSign').click().parents('.v-dialog').should('not.be.visible');
    cy.get('.step1', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Connecting to the Casper Network...');
    cy.get('.step2', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Creation of a new block...');
    cy.get('.step3', { timeout: 20000 }).should('have.length', 1).should('be.visible').should('contain', 'Fetching the result...');
    cy.get('.operationResult', { timeout: 200000 }).should('have.length', 1).should('contain', 'Congrats, the operation succeeded ! Here\'s the deploy hash :');
    cy.get('#removeDeployResult').click();
    cy.get('.operationResult').should('have.length', 0);
  });
});
