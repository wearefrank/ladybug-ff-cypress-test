const NUM_COLUMNS_WHITE_BOX_VIEW = 10

describe('Tests with views and filtering', () => {
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
    cy.visit('')
    cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
    cy.runInTestAPipeline('Example1b', 'Adapter1b', 'xxx')
    cy.runInTestAPipeline('Example1c', 'Adapter1c', 'xxxyyy')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeChar', 'yyy')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeBin', 'yyy')
    cy.getNumLadybugReports().should('equal', 5)
  })

  interface ColumnAndName {
    readonly name: string
    readonly colNr: number
    readonly labelFilterPanel: string
  }

  const columnAndNameCombinations: ColumnAndName[] = [
    { name: 'Storage Id', colNr: 1, labelFilterPanel: 'Storageid' },
    { name: 'End time', colNr: 2, labelFilterPanel: 'Endtime' },
    { name: 'Duration', colNr: 3, labelFilterPanel: 'Duration' },
    { name: 'Name', colNr: 4, labelFilterPanel: 'Name' },
    { name: 'Correlation Id', colNr: 5, labelFilterPanel: 'Correlationid' },
    { name: 'Status', colNr: 6, labelFilterPanel: 'Status' },
    { name: 'Checkpoints', colNr: 7, labelFilterPanel: 'Numberofcheckpoints' },
    { name: 'Memory', colNr: 8, labelFilterPanel: 'Estimatedmemoryusage' },
    { name: 'Size', colNr: 9, labelFilterPanel: 'Storagesize' },
    { name: 'Input', colNr: 10, labelFilterPanel: 'Input' }
  ]

  columnAndNameCombinations.filter((testCase) => testCase.name !== 'Status').forEach(testCase => {
    it(`Filter on field ${testCase.name}, expected at column ${testCase.colNr}`, () => {
      cy.visit('')
      // Enter Ladybug
      cy.getNumLadybugReports().should('equal', 5)
      // Check the name and column number combination
      cy.getIframeBody().find('[data-cy-debug="table"]').find(`th:eq(${testCase.colNr})`).contains(`${testCase.name}`)
      cy.getIframeBody().find('[data-cy-debug="tableRow"]:eq(0)').find(`td:eq(${testCase.colNr})`).then((el: JQuery<HTMLElement>) => {
        const firstRowFieldValue = el.text().trim()
        cy.wrap(`Filtering on value: ${firstRowFieldValue}`)
        cy.getIframeBody().find('[data-cy-debug="filter"]').click()
        cy.enterFilter(testCase.labelFilterPanel, firstRowFieldValue)
        cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length.lessThan', 5)
        cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length.greaterThan', 0)
        cy.checkActiveFilterSphere(testCase.labelFilterPanel, firstRowFieldValue).should('be.visible')
        cy.getIframeBody().find('[data-cy-debug="clear-filter-btn"]').click()
        cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', 5)
        cy.getIframeBody().find('[data-cy-debug="close-filter-btn"]').click()
        cy.getIframeBody().find('[data-cy-debug="close-filter-btn"]').should('not.exist')
        cy.checkActiveFilterSphere(testCase.labelFilterPanel, firstRowFieldValue).should('not.exist')
      })
    })
  })

  it('Filter on two criteria', () => {
    cy.visit('')
    // Enter Ladybug
    cy.getNumLadybugReports().should('equal', 5)
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.enterFilter('Name', 'Adapter')
    cy.enterFilter('Input', 'yyy')
    cy.getIframeBody().find('[data-cy-debug="close-filter-btn"]').click()
    cy.checkActiveFilterSphere('Name', 'Adapter').should('be.visible')
    cy.checkActiveFilterSphere('Input', 'yyy').should('be.visible')
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', 1)
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.getIframeBody().find('[data-cy-debug="clear-filter-btn"]').click()
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', 5)
    cy.checkActiveFilterSphere('Name', 'Adapter').should('not.exist')
    cy.checkActiveFilterSphere('Input', 'yyy').should('not.exist')
    cy.getIframeBody().find('[data-cy-debug="close-filter-btn"]').click()
    cy.getIframeBody().find('[data-cy-debug="close-filter-btn"]').should('not.exist')
  })

  it('Change view so that a column goes on which there was a filter and original filter not saved', () => {
    cy.visit('')
    // Enter Ladybug
    cy.getNumLadybugReports().should('equal', 5)
    cy.getIframeBody().find('[data-cy-debug="filter"]').click()
    cy.enterFilter('Input', 'yyy')
    cy.getIframeBody().find('[data-cy-debug="close-filter-btn"]').click()
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', 3)
    cy.checkActiveFilterSphere('Input', 'yyy').should('be.visible')
    cy.getIframeBody().find('[data-cy-change-view-dropdown]').select('White box view no input')
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', 5)
    cy.checkActiveFilterSphere('Input', 'yyy').should('not.exist')
    // Check that the original filter is not saved
    cy.intercept('/iaf/ladybug/api/testtool').as('viewUpdated')
    cy.getIframeBody().find('[data-cy-change-view-dropdown]').select('White box')
    cy.wait('@viewUpdated')
    // Give UI time to update based on the HTTP response
    cy.wait(200)
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').should('have.length', 5)
    cy.checkActiveFilterSphere('Input', 'yyy').should('not.exist')
  })
})
