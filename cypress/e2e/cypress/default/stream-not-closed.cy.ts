// These tests not only check that Ladybug behaves correctly.
// There are also tests that demonstrate known issues. Such
// tests are distinguished by the word "NOK".
describe('Stream is not closed prematurely', () => {
  // Make this beforeEach() when issue https://github.com/wearefrank/ladybug/issues/344
  // will have been fixed.
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
  })

  // Succeeds as long as issue https://github.com/frankframework/frankframework/issues/8398
  // has NOT been fixed.
  it('NOK: Ignored value is shown as empty', () => {
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
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'empty')
    cy.inIframeBody('app-edit-display app-editor').should('not.contain.text', '>>')
    cy.inIframeBody('app-edit-display app-editor').should('have.text', '')
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
    cy.inIframeBody('app-edit-display app-editor').should('not.contain.text', '>>')
    cy.inIframeBody('app-edit-display app-editor').should('have.text', '')
  })
})
