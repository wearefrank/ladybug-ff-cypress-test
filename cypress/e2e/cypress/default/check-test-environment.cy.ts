describe('Check test environment WITHOUT test webapp', () => {
  it('Check that the extra view defined in ladybug-ff-test-webapp DOES NOT exist', () => {
    cy.visit('/iaf/ladybug')
    cy.get('[data-cy-change-view-dropdown]').find('White box').should('exist')
    cy.get('[data-cy-change-view-dropdown]').find('White box view with less metadata').should('not.exist')
    cy.wait(3000)
  })
})
