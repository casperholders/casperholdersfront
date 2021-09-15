describe('Home', () => {
    it('It show testnet', () => {
        cy.visit("http://localhost:8080/");

        cy.get(".v-toolbar__title").should('contain'," Casper Holders TestNet ")
        const msg = {
            "detail": {
                "isUnlocked": true,
                "isConnected": true,
                "activeKey": "01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c"
            }
        }
        const event = new CustomEvent('signer:connected', msg);
        cy.window().then( win => {
            win.dispatchEvent(event);
        })
        cy.get("#tutorial").click().get(".v-window__prev button").click().get("#publicKey").parent().should('be.visible').should('contain', msg.detail.activeKey)
        cy.get("#copyToClipboard").click()
        cy.get(".v-tooltip__content").should('contain', "Copied !")
    })
})
