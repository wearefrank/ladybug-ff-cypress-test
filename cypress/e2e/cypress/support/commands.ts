// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare namespace Cypress {
  interface Chainable<Subject = any> {
    getIframeBody(): Chainable<any>
    getNumLadybugReports(): Chainable<any>
    runInTestAPipeline(config: string, adapter: string, message: string): Chainable<any>
    getNumLadybugReportsForNameFilter(name: string, expectReports: boolean): Chainable<any>
  }
}

// From the internet.
Cypress.Commands.add('getIframeBody', () => {
  return cy
    .get('iframe')
    .its('0.contentDocument').should('exist')
    .its('body').should('not.be.undefined')
    .then(body => cy.wrap(body))
})

Cypress.Commands.add('getNumLadybugReports', () => {
  cy.get('[data-cy-nav="testing"]').click()
  cy.intercept('GET', 'iaf/ladybug/api/metadata/Debug/count').as('apiGetReports')
  cy.get('[data-cy-nav="testingLadybug"]').click()
  cy.wait(200)
  cy.getIframeBody().find('[data-cy-nav-tab="debugTab"]').click()
  cy.wait('@apiGetReports')
  cy.intercept('GET', 'iaf/ladybug/api/metadata/Debug/count').as('apiGetReports_2')
  cy.getIframeBody().find('[data-cy-debug="refresh"]').click()
  cy.wait('@apiGetReports_2').then(interception => {
    const count: number = interception.response.body
    // Uncomment if PR https://github.com/wearefrank/ladybug-frontend/pull/363
    // has been merged and if its frontend is referenced by F!F pom.xml.
    //
    // cy.getIframeBody().find('[data-cy-debug="amountShown"]')
    // .should('equal', "/" + count);
    cy.getIframeBody().find('[data-cy-debug="tableBody"] tr')
      .should('have.length', count)
    return cy.wrap(count)
  })
})

Cypress.Commands.add('runInTestAPipeline', (config: string, adapter: string, message: string) => {
  cy.get('[data-cy-nav="testing"]').click()
  cy.get('[data-cy-nav="testingRunPipeline"]').click()
  cy.get('[data-cy-test-pipeline="selectConfig"]')
    .clear().type(config)
  cy.get('[data-cy-test-pipeline="selectAdapter"]')
    .clear().type(adapter)
  cy.get('[data-cy-test-pipeline="message"]')
    .clear().type(message)
  cy.get('[data-cy-test-pipeline="send"]').click()
  cy.get('[data-cy-test-pipeline="runResult"]').should('contain', 'SUCCESS')
})

Cypress.Commands.add('getNumLadybugReportsForNameFilter', (name, expectReports) => {
  cy.getNumLadybugReports().then(totalNumReports => {
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.getIframeBody().find('[data-cy-debug="tableFilterRow"]')
    cy.getIframeBody().find('[data-cy-debug="tableFilter"]:eq(3)')
      .type(name + '{enter}')
    if (expectReports) {
      cy.getIframeBody().find('[data-cy-debug="tableBody"] tr').then(nodes => {
        wrapUp(totalNumReports, nodes.length)
      })
    } else {
      cy.getIframeBody().find('[data-cy-debug="tableBody"] tr').should('not.exist').then(() => {
        wrapUp(totalNumReports, 0)
      })
    }
  })

  function wrapUp (totalNumReports, filteredNumReports: number): Cypress.Chainable<number> {
    cy.getIframeBody().find('[data-cy-debug="tableFilter"]:eq(3)')
      .clear()
      .type('{enter}')
    if (totalNumReports === 0) {
      cy.getIframeBody().find('[data-cy-debug="tableBody"] tr').should('not.exist')
    } else {
      cy.getIframeBody().find('[data-cy-debug="tableBody"] tr').should('have.length', totalNumReports)
    }
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.getIframeBody().find('[data-cy-debug="tableFilterRow"]').should('not.exist')
    return cy.wrap(filteredNumReports)
  }
})
