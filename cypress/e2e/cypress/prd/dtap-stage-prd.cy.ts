describe('dtap.stage=PRD', () => {
  it('Report generator is disabled by default', () => {
    cy.visitLadybugAsTester()
    cy.getNumLadybugReports().then(numReports => {
      cy.wrap(numReports).should('equal', 0)
      cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
      cy.getNumLadybugReports().should('equal', 0)
    })
  })

  describe('Rerun in debug tab forbidden', () => {
    before(() => {
      // Implicitly logs in
      cy.visitLadybugAsTester()
      cy.apiDeleteAllAsTester(Cypress.env('debugStorageName') as string)
      cy.apiDeleteAllAsTester('Test')
      cy.enterLadybug()
      cy.enableReportGenerator()
      cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx').then((storageId) => {
        cy.wrap(storageId).as('storageId')
      })
    })

    const credentialsToTest: Array<{ username: string, pwd: string }> = [
      { username: 'observer', pwd: 'IbisObserver' },
      { username: 'admin', pwd: 'IbisAdmin' },
      { username: 'dataAdmin', pwd: 'IbisDataAdmin' }
    ]
    for (const testCase of credentialsToTest) {
      it(`Cannot Report rerun as ${testCase.username}`, () => {
        cy.visitLadybugAs(testCase.username, testCase.pwd)
        cy.getNumLadybugReports().should('equal', 1)
        cy.inIframeBody('[data-cy-debug="tableRow"]')
          .find('td:nth-child(2)')
          .click()
        cy.inIframeBody('[data-cy-debug-tree="root"]')
          .should('have.length.at.least', 1)
          .contains('Pipeline Example1a/Adapter1a').within(_ => {
            cy.contains('Pipeline Example1a/Adapter1a').click()
          })
        cy.awaitLoadingSpinner()
        cy.inIframeBody('.rerun-result').should('not.exist')
        cy.inIframeBody('[data-cy-report="rerun"]').click()
        cy.inIframeBody(':contains(Not allowed)')
        cy.awaitLoadingSpinner()
        cy.inIframeBody('.rerun-result').trimmedText().should('have.length', 0)
        cy.getNumLadybugReports().should('equal', 1)
      })
    }
  })
})
