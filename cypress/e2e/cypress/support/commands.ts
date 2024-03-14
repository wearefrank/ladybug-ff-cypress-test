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
    getNumLadybugReportsForNameFilter(name: string, expectReports: boolean): Chainable<number>
    createReportInLadybug(config: string, adapter: string, message: string): Chainable<number>
    getAllStorageIdsInTable(): Chainable<number[]>
    guardedCopyReportToTestTab(alias: string)
    checkTestTabHasReportNamed(name: string)
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
    .select(config)
  cy.get('[data-cy-test-pipeline="selectAdapter"]')
    .select(adapter)
  cy.get('[data-cy-test-pipeline="message"]')
    .type(message)
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

Cypress.Commands.add('createReportInLadybug', (config: string, adapter: string, message: string) => {
  cy.getNumLadybugReports().then(numBefore => {
    cy.runInTestAPipeline(config, adapter, message)
    cy.getNumLadybugReports().should('equal', numBefore + 1)
    cy.getAllStorageIdsInTable().then(storageIds => {
      const storageId = Math.max.apply(null, storageIds)
      cy.log(`Last created report has storageId ${storageId.toString()}`)
      return cy.wrap(storageId)
    })
  })
})

Cypress.Commands.add('getAllStorageIdsInTable', () => {
  const storageIds: number[] = []
  cy.getIframeBody().find('[data-cy-debug="tableBody"]').find('tr').each($row => {
    cy.wrap($row).find('td:eq(1)').invoke('text').then(s => {
      storageIds.push(parseInt(s))
    })
  }).then(() => {
    cy.log(`Ladybug debug tab table has storage ids: ${storageIds.toString()}`)
    return cy.wrap(storageIds)
  })
})

Cypress.Commands.add('guardedCopyReportToTestTab', (alias) => {
  cy.intercept({
    method: 'PUT',
    hostname: 'localhost',
    url: /\/api\/report\/store\/*?/g,
    times: 1
  }).as(alias)
  cy.getIframeBody().find('[data-cy-debug-editor="copy"]').click()
  cy.wait(`@${alias}`).then((res) => {
    cy.wrap(res).its('request.url').should('contain', 'Test')
    cy.wrap(res).its('request.body').as('requestBody')
    cy.get('@requestBody').its('Debug').should('have.length', 1)
    cy.wrap(res).its('response.statusCode').should('equal', 200)
  })
})

Cypress.Commands.add('checkTestTabHasReportNamed', (name) => {
  cy.intercept({
    method: 'GET',
    hostname: 'localhost',
    url: /\/iaf\/ladybug\/api\/metadata\/Test*/g
  }).as('apiGetTestReports')
  cy.getIframeBody().find('[data-cy-nav-tab="testTab"]').click()
  cy.wait('@apiGetTestReports')
  cy.getIframeBody().find('[data-cy-test="table"] tr')
    .should('have.length', 1)
    .as('testtabReportRow')
  cy.get('@testtabReportRow').find('td:eq(2)').should('contain', name)
  cy.get('@testtabReportRow').find('td:eq(4)').should('be.empty')
  // TODO: Run the report and check the run result.
})
