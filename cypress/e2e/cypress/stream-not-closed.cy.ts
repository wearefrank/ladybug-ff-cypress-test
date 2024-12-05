// This test actually checks that an existing bug is detected.
// The expected behavior is that a stream is NOT closed
// prematurily.
//
// This test will be adjusted when the bug
// will have been fixed.
describe('Stream IS closed prematurely', () => {
  beforeEach(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
  })

  it('Test it for unread streamed value', () => {
    cy.visit('')
    cy.runInTestAPipeline('IgnoreStreamedValue', 'Adapter1a', ' ')
    cy.getNumLadybugReports().should('equal', 1)
    cy.visit('/iaf/ladybug')
    cy.get('[data-cy-debug="tableRow"]').contains('Adapter1a').click()
    cy.selectDebugTreeNode([0, 0, 5, 1], 'Pipe replace').click()
    cy.get('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.get('app-edit-display app-editor').should('contain.text', '>>')
  })

  it('Test it for empty streamed value', () => {
    cy.visit('')
    cy.runInTestAPipeline('StreamedEmptyValue', 'Adapter1b', ' ')
    cy.getNumLadybugReports().should('equal', 1)
    cy.visit('/iaf/ladybug')
    cy.get('[data-cy-debug="tableRow"]').contains('Adapter1a').click()
    cy.selectDebugTreeNode([0, 0, 5, 1], 'Pipe replace').click()
    cy.get('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.get('app-edit-display app-editor').should('contain.text', '>>')
  })
})
