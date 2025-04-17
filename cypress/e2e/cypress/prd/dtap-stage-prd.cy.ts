describe('dtap.stage=PRD', () => {
  it('Can access the Frank!Framework', () => {
    cy.visit('', {
      auth: {
        username: 'tester',
        password: 'IbisTester'
      }
    })
  })
})
