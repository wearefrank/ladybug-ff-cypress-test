describe('Test the tests themselves', () => {
  it('Test the base URL', () => {
    cy.wrap(Cypress.config().baseUrl).should('equal', 'http://localhost:8090/')
  })
})
