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
    getNumLadybugReportsForNameFilter(name: string): Chainable<number>
    createReportInLadybug(config: string, adapter: string, message: string): Chainable<number>
    getAllStorageIdsInTable(): Chainable<number[]>
    guardedCopyReportToTestTab(alias: string)
    checkTestTabHasReportNamed(name: string): Cypress.Chainable<any>
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
  cy.get('[data-cy-nav="adapterStatus"]', { timeout: 10000 }).click()
  cy.get('[data-cy-nav="testingLadybug"]').should('not.be.visible')
  cy.get('[data-cy-nav="testing"]').click()
  cy.intercept({
    method: 'GET',
    url: 'iaf/ladybug/api/metadata/FileDebugStorage/count',
    times: 1
  }).as('apiGetReports')
  cy.get('[data-cy-nav="testingLadybug"]').click()
  cy.wait(200)
  cy.getIframeBody().find('[data-cy-nav-tab="debugTab"]').click()
  cy.wait('@apiGetReports')
  cy.intercept({
    method: 'GET',
    url: 'iaf/ladybug/api/metadata/FileDebugStorage/count',
    times: 1
  }).as('apiGetReports_2')
  cy.getIframeBody().find('[data-cy-debug="refresh"]').click()
  cy.wait('@apiGetReports_2').then(interception => {
    const count: number = interception.response.body
    // Uncomment if PR https://github.com/wearefrank/ladybug-frontend/pull/363
    // has been merged and if its frontend is referenced by F!F pom.xml.
    //
    // cy.getIframeBody().find('[data-cy-debug="amountShown"]')
    // .should('equal', "/" + count);
    cy.getIframeBody().find('[data-cy-debug="tableRow"]')
      .should('have.length', count)
    return cy.wrap(count)
  })
})

Cypress.Commands.add('runInTestAPipeline', (config: string, adapter: string, message: string) => {
  cy.get('[data-cy-nav="adapterStatus"]', { timeout: 10000 }).click()
  cy.get('[data-cy-nav="testingRunPipeline"]').should('not.be.visible')
  cy.get('[data-cy-nav="testing"]').click()
  cy.get('[data-cy-nav="testingRunPipeline"]').click()
  cy.intercept('GET', '/assets/monaco/vs/base/worker/workerMain.js').as('monacoAsksWorkerMain')
  cy.get('[data-cy-test-pipeline="selectConfig"]')
    .clear().type(config)
  cy.wait('@monacoAsksWorkerMain')
  cy.get('[data-cy-test-pipeline="selectAdapter"]')
    .clear().type(adapter)
  // Requires special treatment because the Monaco editor has to be
  // accessed here.
  cy.get('[data-cy-test-pipeline="message"]')
    .type('{ctrl}a').type(message)
  cy.get('[data-cy-test-pipeline="send"]').click()
  cy.get('[data-cy-test-pipeline="runResult"]').should('contain', 'SUCCESS')
})

// Only works if some reports are expected to be omitted because of the filter
Cypress.Commands.add('getNumLadybugReportsForNameFilter', (name) => {
  cy.getNumLadybugReports().then(totalNumReports => {
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.getIframeBody().find('app-filter-side-drawer').find('label:contains(Name)')
      .parent().find('input')
      .type(name + '{enter}')
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').its('length')
      .should('be.lessThan', totalNumReports).then(result => {
        cy.getIframeBody().find('app-filter-side-drawer').find('label:contains(Name)')
          .parent().find('button:contains(Clear)').click()
        cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', totalNumReports)
        cy.getIframeBody().find('app-filter-side-drawer').find('button:contains(Close)').click()
        cy.getIframeBody().find('app-filter-side-drawer').find('label').should('not.exist')
        return cy.wrap(result)
      })
  })
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
  cy.getIframeBody().find('[data-cy-debug="tableRow"]').each($row => {
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
    url: /\/api\/report\/store\/*?/g,
    times: 1
  }).as(alias)
  cy.intercept({
    method: 'GET',
    url: /\/iaf\/ladybug\/api\/metadata\/Test*/g
  }).as('apiGetTestReports')
  cy.getIframeBody().find('[data-cy-debug-editor="copy"]').click()
  cy.wait(`@${alias}`).then((interception) => {
    cy.wrap(interception).its('request.url').should('contain', 'Test')
    cy.wrap(interception).its('response.statusCode').should('equal', 200)
  })
  cy.wait('@apiGetTestReports', { timeout: 30000 })
})

Cypress.Commands.add('checkTestTabHasReportNamed', (name) => {
  cy.getIframeBody().find('[data-cy-nav-tab="testTab"]').click()
  cy.getIframeBody().find('[data-cy-test="table"] tbody tr')
    .should('have.length', 1)
    .as('testtabReportRow')
  cy.get('@testtabReportRow').find('td:eq(2)').should('contain', name)
  cy.get('@testtabReportRow').find('td:eq(4)').should('be.empty')
  return cy.get('@testtabReportRow')
})
