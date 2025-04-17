describe('dtap.stage=PRD', () => {
  it('Report generator is disabled by default', () => {
    cy.visitLadybugAsTester()
    cy.getNumLadybugReports().then(numReports => {
      cy.wrap(numReports).should('equal', 0)
      cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
      cy.getNumLadybugReports().should('equal', 0)
    })
  })
})
