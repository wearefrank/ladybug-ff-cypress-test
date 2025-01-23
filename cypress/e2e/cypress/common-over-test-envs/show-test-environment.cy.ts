describe('Information to check the test environment', () => {
  it('Provide info about the test environment', () => {
    cy.visit('')
    cy.waitForVideo()
    cy.getNumLadybugReports().then(() => {
      cy.inIframeBody('#version').invoke('text').then((s) => {
        cy.log('Ladybug version is:')
        cy.log(`${s}`)
        cy.waitForVideo()
      })
    })
  })

  it('See property ibistesttool.custom', () => {
    cy.visit('')
    cy.contains('Environment Variables').click()
    cy.get('input[name=search]').type('ibistesttool.custom{enter}')
    cy.waitForVideo()
  })
})
