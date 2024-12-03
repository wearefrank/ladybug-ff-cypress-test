describe('Stream not closed prematurely', () => {
  it('Test it for unread streamed value', () => {
    cy.visit('')
    cy.getNumLadybugReports().then(numReports => {
      cy.runInTestAPipeline('IgnoreStreamedValue', 'Adapter1a', ' ')
      cy.getNumLadybugReports().should('equal', numReports + 1)
    })
  })
})
