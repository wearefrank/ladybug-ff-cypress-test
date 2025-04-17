describe('Information to check the test environment', () => {
  it('Provide info about the test environment', () => {
    // Authorizes as IbisTester, should be irrelevant for tests with dtap.stage=LOC
    cy.visitLadybugAsTester()
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
    cy.visitLadybugAsTester()
    cy.contains('Environment Variables').click()
    cy.get('input[name=search]').type('ibistesttool.custom{enter}')
    cy.waitForVideo()
  })

  it('See property configurations.dir', () => {
    cy.visitLadybugAsTester()
    cy.contains('Environment Variables').click()
    cy.get('input[name=search]').type('configurations.dir{enter}')
    cy.waitForVideo()
  })

  it('Frank!Framework should be healthy', () => {
    cy.request('/iaf/api/server/health').then((resp) => {
      expect(resp.status).to.equal(200)
    })
  })
})
