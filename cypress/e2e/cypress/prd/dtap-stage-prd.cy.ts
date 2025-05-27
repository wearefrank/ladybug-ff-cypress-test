describe('dtap.stage=PRD', () => {
  /*
   * The code below is based on a suggestion from the internet, but it does not work.
   * It lets the browser crash.
   *
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return false
    }
    return true
  })
  */

  it('Report generator is disabled by default', () => {
    cy.visitAsTester()
    cy.getNumLadybugReports().then(numReports => {
      cy.wrap(numReports).should('equal', 0)
      cy.runInTestAPipeline('Example1a', 'Adapter1a', undefined)
      cy.getNumLadybugReports().should('equal', 0)
    })
  })

  describe('Rerun in debug tab forbidden', () => {
    before(() => {
      // Implicitly logs in
      cy.visitAsTester()
      cy.apiDeleteAllAsTester(Cypress.env('debugStorageName') as string)
      cy.apiDeleteAllAsTester('Test')
      cy.enterLadybug()
      cy.enableReportGenerator()
      cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx')
    })

    const credentialsToTest: Array<{ username: string, pwd: string }> = [
      { username: 'observer', pwd: 'IbisObserver' },
      { username: 'admin', pwd: 'IbisAdmin' },
      { username: 'dataAdmin', pwd: 'IbisDataAdmin' }
    ]
    for (const testCase of credentialsToTest) {
      it(`Cannot Report rerun as ${testCase.username}`, () => {
        cy.visitAs(testCase.username, testCase.pwd)
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
