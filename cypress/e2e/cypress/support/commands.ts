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
    inIframeBody(query: string): Chainable<any>
    getNumLadybugReports(): Chainable<any>
    runInTestAPipeline(config: string, adapter: string, message: string): Chainable<any>
    getNumLadybugReportsForNameFilter(name: string): Chainable<number>
    createReportInLadybug(config: string, adapter: string, message: string): Chainable<number>
    getAllStorageIdsInTable(): Chainable<number[]>
    guardedCopyReportToTestTab(alias: string)
    checkTestTabHasReportNamed(name: string): Cypress.Chainable<any>
    enterFilter(field: string, filter: string)
    checkActiveFilterSphere(field: string, value: string): Cypress.Chainable<any>
    apiDeleteAll(storageName: string)
    selectTreeNode(path: NodeSelection[]): Cypress.Chainable<any>
    awaitLoadingSpinner(): void
    waitForVideo(): void
    trimmedText(): Chainable<any>
    checkpointValue(): Chainable<any>
  }
}

Cypress.Commands.add('inIframeBody', (query) => {
  cy
    .get('iframe')
    .its('0.contentDocument')
    .its('body')
    .then(body => {
      cy.wrap(body).find(query)
    })
})

Cypress.Commands.add('getNumLadybugReports', () => {
  cy.get('[data-cy-nav="adapterStatus"]', { timeout: 10000 }).click()
  cy.get('[data-cy-nav="testingLadybug"]').should('not.be.visible')
  cy.get('[data-cy-nav="testing"]').click()
  cy.get('[data-cy-nav="testingLadybug"]').click()
  cy.awaitLoadingSpinner()
  cy.inIframeBody('[data-cy-nav-tab="debugTab"]').click()
  cy.intercept({
    method: 'GET',
    url: 'iaf/ladybug/api/metadata/FileDebugStorage/count',
    times: 1
  }).as('apiGetReports_2')
  cy.inIframeBody('[data-cy-debug="refresh"]').click()
  cy.wait('@apiGetReports_2').then(interception => {
    const count: number = interception.response.body
    // Uncomment if PR https://github.com/wearefrank/ladybug-frontend/pull/363
    // has been merged and if its frontend is referenced by F!F pom.xml.
    //
    // cy.inIframeBody('[data-cy-debug="amountShown"]')
    // .should('equal', "/" + count);
    cy.inIframeBody('[data-cy-debug="tableRow"]')
      .should('have.length', count)
    return cy.wrap(count)
  })
})

Cypress.Commands.add('runInTestAPipeline', (config: string, adapter: string, message: string) => {
  cy.get('[data-cy-nav="adapterStatus"]', { timeout: 10000 }).click()
  cy.get('[data-cy-nav="testingRunPipeline"]').should('not.be.visible')
  cy.get('[data-cy-nav="testing"]').click()
  cy.get('[data-cy-nav="testingRunPipeline"]').click()
  cy.get('[data-cy-test-pipeline="selectConfig"]')
    .clear().type(config + '{enter}')
  cy.get('[data-cy-test-pipeline="selectAdapter"]')
    .clear().type(adapter + '{enter}')
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
    cy.inIframeBody('[data-cy-debug="filter"]').click()
    cy.enterFilter('Name', name)
    cy.inIframeBody('[data-cy-debug="tableRow"]').its('length')
      .should('be.lessThan', totalNumReports).then(result => {
        cy.inIframeBody('app-filter-side-drawer').find('label:contains(Name)')
          .parent().find('button:contains(Clear)').click()
        cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', totalNumReports)
        cy.inIframeBody('app-filter-side-drawer').find('button:contains(Close)').click()
        cy.inIframeBody('app-filter-side-drawer').find('label').should('not.exist')
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
  cy.inIframeBody('[data-cy-debug="tableRow"]').each($row => {
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
  cy.inIframeBody('[data-cy-debug-editor="copy"]').click()
  cy.wait(`@${alias}`).then((interception) => {
    cy.wrap(interception).its('request.url').should('contain', 'Test')
    cy.wrap(interception).its('response.statusCode').should('equal', 200)
  })
  cy.wait('@apiGetTestReports', { timeout: 30000 })
})

Cypress.Commands.add('checkTestTabHasReportNamed', (name) => {
  cy.inIframeBody('[data-cy-nav-tab="testTab"]').click()
  cy.inIframeBody('[data-cy-test="table"] tbody tr')
    .should('have.length', 1)
    .as('testtabReportRow')
  // TODO: It would be nice not to trim the text here.
  cy.get('@testtabReportRow').find('td:eq(2)').trimmedText().should('equal', name)
  cy.get('@testtabReportRow').find('td:eq(4)').should('be.empty')
  return cy.get('@testtabReportRow')
})

Cypress.Commands.add('enterFilter', (field: string, filter: string) => {
  const fieldQuery = `label:contains(${field})`
  cy.inIframeBody('app-filter-side-drawer').find(fieldQuery)
    .parent().find('input')
    .type(filter + '{enter}')
})

Cypress.Commands.add('checkActiveFilterSphere', (field: string, value: string) => {
  const expectedText = `${field}: ${value}`
  return cy.inIframeBody('app-active-filters').contains(expectedText)
})

Cypress.Commands.add('apiDeleteAll', (storageName: string) => {
  cy.request({
    method: 'DELETE',
    url: `/iaf/ladybug/api/report/all/${storageName}`
  }).then(response => {
    cy.wrap(response).its('status').should('equal', 200)
  })
})

interface TextWithSeq {
  text: string
  seq: number
}

type NodeSelection = TextWithSeq | string

function normalizeNodeSelection (input: NodeSelection): TextWithSeq {
  if (typeof input === 'string') {
    return { text: input, seq: 0 }
  } else {
    return input
  }
}

Cypress.Commands.add('selectTreeNode', (path: NodeSelection[]) => {
  const head = normalizeNodeSelection(path.shift())
  cy.inIframeBody(`[data-cy-debug-tree="root"] > app-tree-item > div > div:nth-child(1):contains(${head.text})`).then((elementsWithTexts) => {
    const chosen = elementsWithTexts[head.seq]
    return cy.wrap(chosen).parent().parent().then((element) => {
      if (path.length === 0) {
        return cy.wrap(element)
      } else {
        return selectTreeNodeImpl(element, path)
      }
    })
  })
})

function selectTreeNodeImpl (subject: JQuery<HTMLElement>, path: NodeSelection[]): Cypress.Chainable<any> | void {
  const head = normalizeNodeSelection(path.shift())
  cy.wrap(subject).find(`> div > div > div > app-tree-item > div > div:nth-child(1):contains(${head.text})`).then((elementsWithTexts) => {
    const chosen = elementsWithTexts[head.seq]
    if (path.length === 0) {
      return cy.wrap(chosen)
    } else {
      cy.wrap(chosen).parent().parent().then((element) => {
        return selectTreeNodeImpl(element, path)
      })
    }
  })
}

Cypress.Commands.add('awaitLoadingSpinner', () => {
  // We do not want to catch the moment that the loading spinner is NOT YET present
  cy.wait(200)
  cy.inIframeBody('[data-cy-loading-spinner]').should('not.exist')
})

// Wait so that the state of the UI is shown more clearly in videos.
Cypress.Commands.add('waitForVideo', () => {
  cy.wait(3000)
})

Cypress.Commands.add('trimmedText', { prevSubject: true }, (subject) => {
  cy.wrap(subject).invoke('text').then((theText) => {
    const nbspRegex = /\u00A0/g
    // cy.log(`Text to trim shown as URL encoded: ${encodeURI(theText)}`)
    const result = theText.replace(nbspRegex, ' ').trim()
    // cy.log(`Trimmed text shown as URL encoded: ${encodeURI(result)}`)
    cy.wrap(result)
  })
})

Cypress.Commands.add('checkpointValue', { prevSubject: false }, () => {
  cy.inIframeBody('app-edit-display app-editor').then((appEditor) => {
    const textOfAppEditor = appEditor.text()
    if (textOfAppEditor.length === 0) {
      cy.wrap(appEditor)
    } else {
      cy.wrap(appEditor).find('.monaco-scrollable-element')
    }
  })
})
