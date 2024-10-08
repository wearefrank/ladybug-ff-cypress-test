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
      cy.wrap('Found report just created, storageId=' + storageId)
      cy.getIframeBody().find('[data-cy-debug="tableRow"]')
        .find('td:nth-child(2)').each($cell => {
          if (parseInt($cell.text()) === storageId) {
            cy.wrap('Going to click cell with text' + $cell.text())
            cy.wrap($cell).click()
          }
        })
      cy.getIframeBody().find('[data-cy-debug-tree="root"]')
        .should('have.length.at.least', 1)
        .contains('Pipeline Example1a/Adapter1a').within(_ => {
          cy.contains('Pipeline Example1a/Adapter1a')
        })
      cy.guardedCopyReportToTestTab('apiCopyTheReportToTestTab')
      cy.checkTestTabHasReportNamed('Pipeline Example1a_Adapter1a')
      // Martijn October 8 2024: I do not know why I have to do this query again.
      cy.checkTestTabHasReportNamed('Pipeline Example1a_Adapter1a')
        .find('[data-cy-test="runReport"]').click()
      // TODO: Use data-cy to find the rerun result.
      cy.checkTestTabHasReportNamed('Pipeline Example1a_Adapter1a')
        .find('td:eq(5)').should('contain', 'stubbed')
    })
  })
})
