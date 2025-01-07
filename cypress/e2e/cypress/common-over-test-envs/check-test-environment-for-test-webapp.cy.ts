describe('Check test environment for use test webapp', () => {
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
