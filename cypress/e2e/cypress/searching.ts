describe('Test about filtering reports', () => {
  it('Filter on storage id', () => {
    cy.visit('')
    cy.createReportInLadybug('Example1b', 'Adapter1b', 'xxx')
    cy.createReportInLadybug('Example1a', 'Adapter1a', 'xxx').then(storageId => {
      cy.getIframeBody().find('[data-cy-debug="filter"]').click()
      cy.getIframeBody().find('[data-cy-debug="tableFilterRow"]').should('be.visible').within(() => {
        cy.find('[data-cy-debug="tableFilter"]:eq(1)')
          .type(storageId.toString() + '{enter}')
      })
      cy.getIframeBody().find('[data-cy-debug="tableBody"]').should('have.length', 1).each($row => {
        cy.wrap($row).find('td:eq(1)').invoke('text').should('equal', storageId.toString())
      })
    })
    cy.getIframeBody().find('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 1)
    cy.guardedCopyReportToTestTab('apiCopyTheReportToTestTab')
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.getIframeBody().find('[data-cy-debug="tableFilterRow"]').should('not.exist')
  })
})
