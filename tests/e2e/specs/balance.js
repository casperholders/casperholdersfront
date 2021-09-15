describe('Balance', () => {
    it('It show balance', () => {
        const msg = {
            "detail": {
                "isUnlocked": true,
                "isConnected": true,
                "activeKey": "01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c"
            }
        }
        cy.visit("http://localhost:8080/balance")
        const event = new CustomEvent('signer:connected', msg);
        cy.window().then( win => {
            win.dispatchEvent(event);
        })
        cy.wait(5000)
        cy.get("#labels").should('have.length', 1)
        cy.get("#labels div:first").should('contain',"Available")
        cy.get("#labels div:first").next().should('contain', "Staked")

        cy.wait(1000).window().then(win => {
            msg.detail.activeKey = "01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a"
            win.dispatchEvent(event)
        })
        cy.get("#labels").should('have.length', 1)
        cy.get("#labels div:first").should('contain',"Available").should('contain',"0 CSPR").should('contain',"(0.00%)")
    })
})
