describe('Undelegate', () => {
    it('Should let you do a undelegation', () => {
        const msg = {
            "detail": {
                "isUnlocked": true,
                "isConnected": true,
                "activeKey": "01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c"
            }
        }
        cy.visit("http://localhost:8080/unstake")
        const event = new CustomEvent('signer:connected', msg);
        cy.window().then( win => {
            win.dispatchEvent(event);
        })
        cy.wait(5000)
        cy.get("#submitOperation").click()
        cy.get("#agreeAndSign").parents(".v-dialog").should("be.visible")
        cy.get("#agreeAndSign").click().parents(".v-dialog").should("not.be.visible")
        cy.get(".operationResult").should('have.length', 1).should('contain', 'Waiting for the deploy result')
        cy.get(".operationResult", {timeout: 200000}).should('have.length', 1).should('contain', 'Congrats ! The operation succeeded')
    })
    it('Should not let you do a undelegation', () => {
        const msg = {
            "detail": {
                "isUnlocked": true,
                "isConnected": true,
                "activeKey": "01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7a"
            }
        }
        cy.visit("http://localhost:8080/unstake")
        cy.get(".v-alert").should('have.length', 1)
        cy.get(".v-alert").should('contain'," Not connected on Signer. ")
        const event = new CustomEvent('signer:connected', msg);
        cy.window().then( win => {
            win.dispatchEvent(event);
        })
        cy.wait(5000)
        cy.get(".v-alert").should('have.length', 1)
        cy.get(".v-alert").should('contain',"No staking funds.")
        cy.wait(1000).window().then(win => {
            msg.detail.activeKey = "01270a577d2d106c4d29402775f3dffcb9f04aad542579dd4d1cfad20572ebcb7c"
            win.dispatchEvent(event)
        })
        cy.get(".v-alert").should('have.length', 0)
        cy.get("#submitOperation").click()
        cy.get("#amount").type("9999999").parents(".v-input__control").find(".v-messages__message").should('contain', 'Amount must equal or bellow')
        cy.get("#amount").type("{selectall}{del}").parents(".v-input__control").find(".v-messages__message").should('contain', 'Amount is required')
    })
})