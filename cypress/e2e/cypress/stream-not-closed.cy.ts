describe('Stream not closed prematurely', () => {
  it('Test it for unread streamed value', () => {
    cy.visit('')
    cy.get('[data-cy-nav="adapterStatus"]', { timeout: 10000 }).click()
    cy.get('[data-cy-nav="testingRunPipeline"]').should('not.be.visible')
    cy.get('[data-cy-nav="testing"]').click()
    cy.get('[data-cy-nav="testingRunPipeline"]').click()
    cy.get('[data-cy-test-pipeline="selectConfig"]')
      .clear().type('IgnoreStreamedValue')
    cy.get('[data-cy-test-pipeline="selectAdapter"]')
      .clear().type('Adapter1a')
    // Requires special treatment because the Monaco editor has to be
    // accessed here.
    cy.get('[data-cy-test-pipeline="message"]')
      .type('{ctrl}a').type(' ')
    cy.get('[data-cy-test-pipeline="send"]').click()
    cy.get('[data-cy-test-pipeline="runResult"]').should('contain', 'SUCCESS')
    cy.get('[data-cy-nav="adapterStatus"]', { timeout: 10000 }).click()
    cy.get('[data-cy-nav="testingLadybug"]').should('not.be.visible')
    cy.get('[data-cy-nav="testing"]').click()
    cy.intercept({
      method: 'GET',
      url: 'iaf/ladybug/api/metadata/FileDebugStorage/count',
      times: 1
    }).as('apiGetReports')
    cy.get('[data-cy-nav="testingLadybug"]').click()
    cy.frameLoaded()
  })

  /* ==== Test Created with Cypress Studio ==== */
  it('My test', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get('[data-cy-nav="testing"]').click();
    cy.get('[data-cy-nav="testingRunPipeline"] > a').click();
    cy.get(':nth-child(1) > .col-sm-9 > .form-control').clear('IgnoreStreamedValue');
    cy.get(':nth-child(1) > .col-sm-9 > .form-control').type('IgnoreStreamedValue');
    cy.get(':nth-child(2) > .col-sm-9 > .form-control').clear('Adapter1a');
    cy.get(':nth-child(2) > .col-sm-9 > .form-control').type('Adapter1a');
    cy.get('.ladda-label').click();
    cy.get('.alert').should('have.text', 'SUCCESS');
    cy.get('[data-cy-nav="testingLadybug"] > a').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('My test 2', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/iaf/ladybug');
    cy.get('[data-cy-record-table-index="0"] > .cdk-column-name').click();
    cy.get(':nth-child(6) > :nth-child(2) > :nth-child(1) > .sft-child-container > :nth-child(2) > app-tree-item > div.ng-star-inserted > .sft-item > .item-name').click();
    cy.get('.view-lines').click();
    cy.get('.view-line > :nth-child(1) > :nth-child(2)').should('be.visible');
    /* ==== End Cypress Studio ==== */
  });
})
