describe('Check test environment', () => {
  it('Check that the extra view defined in ladybug-ff-test-webapp exists', () => {
    cy.visit('/iaf/ladybug')
    cy.get('[data-cy-change-view-dropdown]').select('White box view with less metadata')
  })

  it('Have a video to see the Frank!Framework version and the project name', () => {
    cy.visit('')
    cy.wait(3000)
  })
})
