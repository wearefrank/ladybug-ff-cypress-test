describe('Stream is not closed prematurely', () => {
  // Make this beforeEach() when issue https://github.com/wearefrank/ladybug/issues/344
  // will have been fixed.
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
  })

  it('When a pipe output is not used by proceding pipes, the value is still shown', () => {
    cy.visit('')
    cy.runInTestAPipeline('IgnoreStreamedValue', 'Adapter1a', ' ')
    cy.getNumLadybugReports().should('equal', 1)
    cy.inIframeBody('[data-cy-debug="tableRow"]').contains('Adapter1a').click()
    cy.selectTreeNode([
      'Pipeline IgnoreStreamedValue/Adapter1a',
      'Pipeline IgnoreStreamedValue/Adapter1a',
      'Pipe replace',
      { text: 'Pipe replace', seq: 1 }
    ]).click()
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.inIframeBody('app-edit-display app-report-alert-message').should('not.contain.text', 'empty')
    cy.checkpointValue().should('not.contain.text', '>>')
    cy.checkpointValue().should('not.contain.text', 'Hello')
    cy.checkpointValue().should('have.text', 'World!')
  })

  it('Test it for empty streamed value', () => {
    cy.visit('')
    cy.runInTestAPipeline('StreamedEmptyValue', 'Adapter1b', ' ')
    // We did not delete the report of the previous test.
    // We have to work around issue https://github.com/wearefrank/ladybug/issues/344
    cy.getNumLadybugReports().should('equal', 2)
    cy.inIframeBody('[data-cy-debug="tableRow"]').contains('Adapter1b').click()
    cy.selectTreeNode([
      'Pipeline StreamedEmptyValue/Adapter1b',
      'Pipeline StreamedEmptyValue/Adapter1b',
      'Pipe replace',
      { text: 'Pipe replace', seq: 1 }]).click()
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'empty')
    cy.checkpointValue().should('not.contain.text', '>>')
    cy.checkpointValue().should('have.text', '')
  })
})

describe('Metadata and message context', () => {
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
    cy.wrap(Cypress.config('fixturesFolder')).then((fixturesFolder) => {
      const rawInputMessage = fixturesFolder + '/ConclusionInputs/valid'
      const inputMessage = rawInputMessage.replace(/\\/g, '/')
      cy.log('Input message for Conclusion/IngestDocument: ' + inputMessage)
      const url = Cypress.config('baseUrl') + '/api/ingestdocument'
      cy.request('POST', url, inputMessage).then(resp => {
        expect(resp.status).to.equal(200)
      })
    })
  })

  it('Check that configuration Conclusion/IngestDocument ran successfully', () => {
    cy.visit('')
    cy.getNumLadybugReports()
    cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 1).as('reportRow')
    cy.get('@reportRow').contains('Conclusion').click()
    // Status column
    cy.get('@reportRow').find('td:eq(6)').trimmedText().should('equal', 'Success')
    cy.selectTreeNode([
      'Pipeline Conclusion/IngestDocument',
      'Pipeline Conclusion/IngestDocument',
      'Pipe sendToMundo',
      { seq: 1, text: 'Pipe sendToMundo' }
    ]).click()
    // Do not check for equality because there is a line number and something
    // other text the user does not see.
    cy.checkpointValue().should('have.text', 'ok')
  })
})
