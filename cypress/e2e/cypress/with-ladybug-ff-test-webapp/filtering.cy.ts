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

  const testedColumnAndNameCombinations = columnAndNameCombinations.filter((testCase) => testCase.name !== 'Status')

  for (const testCase of testedColumnAndNameCombinations) {
    it(`Filter on field ${testCase.name}, expected at column ${testCase.colNr}`, () => {
      cy.visit('')
      // Enter Ladybug
      cy.getNumLadybugReports().should('equal', 5)
      // Check the name and column number combination
      cy.inIframeBody('[data-cy-debug="table"]').find(`th:eq(${testCase.colNr})`).contains(`${testCase.name}`)
      cy.inIframeBody('[data-cy-debug="tableRow"]:eq(0)').find(`td:eq(${testCase.colNr})`).then((el: JQuery<HTMLElement>) => {
        const firstRowFieldValue = el.text().trim()
        cy.log(`Filtering on value: ${firstRowFieldValue}`)
        cy.inIframeBody('[data-cy-debug="filter"]').click()
        cy.enterFilter(testCase.labelFilterPanel, firstRowFieldValue)
        cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length.lessThan', 5)
        cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length.greaterThan', 0)
        cy.checkActiveFilterSphere(testCase.labelFilterPanel, firstRowFieldValue).should('be.visible')
        cy.inIframeBody('[data-cy-debug="clear-filter-btn"]').click()
        cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 5)
        cy.inIframeBody('[data-cy-debug="close-filter-btn"]').click()
        cy.inIframeBody('[data-cy-debug="close-filter-btn"]').should('not.exist')
        cy.checkActiveFilterSphere(testCase.labelFilterPanel, firstRowFieldValue).should('not.exist')
      })
    })
  }

  it('Filter on two criteria', () => {
    cy.visit('')
    // Enter Ladybug
    cy.getNumLadybugReports().should('equal', 5)
    cy.inIframeBody('[data-cy-debug="filter"]').click()
    cy.enterFilter('Name', 'Adapter')
    cy.enterFilter('Input', 'yyy')
    cy.inIframeBody('[data-cy-debug="close-filter-btn"]').click()
    cy.checkActiveFilterSphere('Name', 'Adapter').should('be.visible')
    cy.checkActiveFilterSphere('Input', 'yyy').should('be.visible')
    cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 1)
    cy.inIframeBody('[data-cy-debug="filter"]').click()
    cy.inIframeBody('[data-cy-debug="clear-filter-btn"]').click()
    cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 5)
    cy.checkActiveFilterSphere('Name', 'Adapter').should('not.exist')
    cy.checkActiveFilterSphere('Input', 'yyy').should('not.exist')
    cy.inIframeBody('[data-cy-debug="close-filter-btn"]').click()
    cy.inIframeBody('[data-cy-debug="close-filter-btn"]').should('not.exist')
  })

  it('Change view so that a column goes on which there was a filter and original filter not saved', () => {
    cy.visit('')
    // Enter Ladybug
    cy.getNumLadybugReports().should('equal', 5)
    cy.inIframeBody('[data-cy-debug="filter"]').click()
    cy.enterFilter('Input', 'yyy')
    cy.inIframeBody('[data-cy-debug="close-filter-btn"]').click()
    cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 3)
    cy.checkActiveFilterSphere('Input', 'yyy').should('be.visible')
    cy.inIframeBody('[data-cy-change-view-dropdown]').select('White box view no input')
    cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 5)
    cy.checkActiveFilterSphere('Input', 'yyy').should('not.exist')
    // Check that the original filter is not saved
    cy.inIframeBody('[data-cy-change-view-dropdown]').select('White box')
    cy.awaitLoadingSpinner()
    cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 5)
    cy.checkActiveFilterSphere('Input', 'yyy').should('not.exist')
  })
})
