// This test actually checks that an existing bug is detected.
// The expected behavior is that a stream is NOT closed
// prematurily.
//
// This test will be adjusted when the bug
// will have been fixed.
describe('Stream IS closed prematurely', () => {
  // Make this beforeEach() when issue https://github.com/wearefrank/ladybug/issues/344
  // will have been fixed.
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
  })

  it('NOK: Test it for unread streamed value', () => {
    cy.visit('')
    cy.runInTestAPipeline('IgnoreStreamedValue', 'Adapter1a', ' ')
    cy.getNumLadybugReports().should('equal', 1)
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').contains('Adapter1a').click()
    cy.selectTreeNode([
      'Pipeline IgnoreStreamedValue/Adapter1a',
      'Pipeline IgnoreStreamedValue/Adapter1a',
      'Pipe replace',
      { text: 'Pipe replace', seq: 1 }
    ]).click()
    cy.getIframeBody().find('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.getIframeBody().find('app-edit-display app-editor').should('contain.text', '>>')
  })

  it('NOK: Test it for empty streamed value', () => {
    cy.visit('')
    cy.runInTestAPipeline('StreamedEmptyValue', 'Adapter1b', ' ')
    // We did not delete the report of the previous test.
    // We have to work around issue https://github.com/wearefrank/ladybug/issues/344
    cy.getNumLadybugReports().should('equal', 2)
    cy.getIframeBody().find('[data-cy-debug="tableRow"]').contains('Adapter1b').click()
    cy.selectTreeNode([
      'Pipeline StreamedEmptyValue/Adapter1b',
      'Pipeline StreamedEmptyValue/Adapter1b',
      'Pipe replace',
      { text: 'Pipe replace', seq: 1 }]).click()
    cy.getIframeBody().find('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.getIframeBody().find('app-edit-display app-editor').should('contain.text', '>>')
  })
})
