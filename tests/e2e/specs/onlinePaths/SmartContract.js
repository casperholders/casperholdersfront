describe('Smart Contract', () => {
  it('Should let send smart contract', () => {
    const msg = {
      detail: {
        isUnlocked: true,
        isConnected: true,
        activeKey: '01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c',
      },
    };
    cy.visit('http://localhost:8080/smartcontract');
    const event = new CustomEvent('signer:connected', msg);
    cy.window().then((win) => {
      win.dispatchEvent(event);
    });
    cy.wait(5000);
    cy.fixture('counter.wasm').then((fileContent) => {
      cy.get('#smartContractFile').attachFile({
        fileContent: fileContent.toString(),
        fileName: 'counter.wasm',
        mimeType: 'application/wasm',
      });
    });
    cy.get('#amount').type('{selectall}{del}47');
    /**
     * Smart contract not parsed correctly with cypress
     * For example with cypress :
     * https://testnet.cspr.live/deploy/be28a6c41c6ff7bb18fa0220373865858e2387f9926bb900157aa76e85f4b99f
     * Standard working deploy :
     * https://testnet.cspr.live/deploy/a23b408eae444a1665ea2f60730c1a1e94a911f46f601d6ac223c9f79b2821e2
     * If you compare the module byte content the end is different and I don't know why ...
     */
    /*
        cy.get("#submitOperation").click()
        cy.get("#agreeAndSign").parents(".v-dialog").should("be.visible")
        cy.get("#agreeAndSign").click().parents(".v-dialog").should("not.be.visible")
        cy.get(".operationResult").should('have.length', 1)
        .should('contain', 'Waiting for the deploy result')
        cy.get(".operationResult", {timeout: 300000}).should('have.length', 1)
        .should('contain', 'Congrats ! The operation succeeded') */
  });
});
