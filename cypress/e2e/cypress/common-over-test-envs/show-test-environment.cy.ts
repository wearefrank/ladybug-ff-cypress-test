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

  it('Check that the extra view defined in ladybug-ff-test-webapp exists', () => {
    // cy.visit('/iaf/ladybug')
    // cy.get('[data-cy-change-view-dropdown]').select('White box view with less metadata')
    cy.visit('')
    cy.wait(3000)
    cy.getNumLadybugReports().then(() => {
      cy.getIframeBody().find('[data-cy-change-view-dropdown]').select('White box view with less metadata')
      // Wait so that you see this situation in the video
      cy.wait(3000)
    })
  })
})
