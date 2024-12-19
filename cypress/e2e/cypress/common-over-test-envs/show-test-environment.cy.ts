describe('Information to check the test environment', () => {
  it('Provide info about the test environment', () => {
    cy.visit('')
    cy.wait(3000)
    cy.getNumLadybugReports().then(() => {
      cy.getIframeBody().find('#version').invoke('text').then((s) => {
        cy.log('Ladybug version is:')
        cy.log(`${s}`)
        cy.wait(3000)
      })
    })
  })
})
