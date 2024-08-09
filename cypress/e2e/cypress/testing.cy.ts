describe('Test user stories about testing with Ladybug', () => {
  beforeEach(() => {
    cy.visit('')
    cy.request({
      method: 'DELETE',
      url: '/iaf/ladybug/api/report/all/Test'
    }).then(response => {
      cy.wrap(response).its('status').should('equal', 200)
    })
  })

  it('Run report', () => {
    cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx').then(storageId => {
      cy.getIframeBody().find('[data-cy-debug="tableRow"]')
        .find('td:nth-child(2)').each($cell => {
          if (parseInt($cell.text()) === storageId) {
            cy.wrap($cell).click()
          }
        })
      cy.getIframeBody().find('[data-cy-debug-tree="root"]')
        .contains('Pipeline Adapter1a').within(_ => {
          cy.contains('Pipeline Adapter1a')
          // TODO: Check that there is no 'Pipeline Adapter1a' inside of this anymore
        })
      cy.guardedCopyReportToTestTab('apiCopyTheReportToTestTab')
      cy.checkTestTabHasReportNamed('Pipeline Adapter1a').as('testTabReportRow')
        .find('[data-cy-test="runReport"]').click()
      // TODO: Use data-cy. This can only be done if there is a data-cy* tag to request
      cy.get('@testTabReportRow').find('td:eq(5)').should('contain', 'stubbed')
    })
  })
})
