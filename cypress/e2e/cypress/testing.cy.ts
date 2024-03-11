describe('Test user stories about testing with Ladybug', () => {
  it('Run report', () => {
    cy.visit('')
    cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx').then(storageId => {
      cy.getIframeBody().find('[data-cy-debug="filter"]').click()
      cy.getIframeBody().find('[data-cy-debug="tableFilterRow"]').should('be.visible').within(() => {
        cy.find('[data-cy-debug="tableFilter"]:eq(1)')
          .type(storageId.toString() + '{enter}')
      })
      cy.getIframeBody().find('[data-cy-debug="tableBody"]').should('have.length', 1).each($row => {
        cy.wrap($row).find('td:eq(1)').click()
      })
      cy.getIframeBody().find('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 1)
      cy.guardedCopyReportToTestTab('apiCopyTheReportToTestTab')
    })
  })
})
