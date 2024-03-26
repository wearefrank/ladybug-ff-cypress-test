describe('Test user stories about testing with Ladybug', () => {
  beforeEach(() => {
    cy.visit('')
    cy.request({
      method: 'DELETE',
      url: 'http://localhost/iaf/ladybug/api/report/all/Test'
    }).then(response => {
      cy.wrap(response).its('status').should('equal', 200)
    })
  })

  it('Run report', () => {
    cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx').then(storageId => {
      cy.getIframeBody().find('[data-cy-debug="tableBody"]')
        .find('tr > td:nth-child(2)').each($cell => {
          if (parseInt($cell.text()) === storageId) {
            cy.wrap($cell).click()
          }
        })
      cy.getIframeBody().find('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 1)
      cy.guardedCopyReportToTestTab('apiCopyTheReportToTestTab')
      cy.checkTestTabHasReportNamed('Pipeline Adapter1a').as('testTabReportRow')
        .find('[data-cy-test="runReport"]').click()
      // TODO: Use data-cy. This can only be done if there is a data-cy* tag to request
      cy.get('@testTabReportRow').find('td:eq(4)').should('contain', 'stubbed')
    })
  })
})
