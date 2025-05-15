describe('dtap.stage=PRD', () => {
  it('Report generator is disabled by default', () => {
    cy.visitLadybugAsTester()
    cy.getNumLadybugReports().then(numReports => {
      cy.wrap(numReports).should('equal', 0)
      cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
      cy.getNumLadybugReports().should('equal', 0)
    })
  })

  const credentialsToTest: Array<{ username: string, pwd: string }> = [
    { username: 'webservice', pwd: 'IbisWebService' },
    { username: 'observer', pwd: 'IbisObserver' },
    { username: 'admin', pwd: 'IbisAdmin' },
    { username: 'dataAdmin', pwd: 'IbisDataAdmin' }
  ]
  for (const testCase of credentialsToTest) {
    it(`Cannot rerun report as ${testCase.username}`, () => {
      cy.apiDeleteAll(Cypress.env('debugStorageName') as string)
      cy.apiDeleteAll('Test')
      cy.visit('')
      cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx').then(storageId => {
        cy.wrap('Found report just created, storageId=' + storageId)
        cy.inIframeBody('[data-cy-debug="tableRow"]')
          .find('td:nth-child(2)').each($cell => {
            if (parseInt($cell.text()) === storageId) {
              cy.wrap('Going to click cell with text' + $cell.text())
              cy.wrap($cell).click()
            }
          })
        cy.inIframeBody('[data-cy-debug-tree="root"]')
          .should('have.length.at.least', 1)
          .contains('Pipeline Example1a/Adapter1a').within(_ => {
            cy.contains('Pipeline Example1a/Adapter1a').click()
          })
        cy.awaitLoadingSpinner()
        cy.inIframeBody('.rerun-result').should('not.exist')
        cy.inIframeBody('[data-cy-report="rerun"]').click()
        cy.awaitLoadingSpinner()
        cy.inIframeBody('.rerun-result').should('not.exist')
        cy.inIframeBody(':contains(Not allowed)')
        cy.getNumLadybugReports().should('equal', 1)
      })
    })
  }
})
