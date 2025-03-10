describe('Checkpoint value labels', () => {
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
    const url = Cypress.config('baseUrl') + '/api/nullAndEmpty'
    cy.request('GET', url, null).then((resp) => {
      expect(resp.status).to.equal(200)
    })
  })

  it('When message is null then a label null is shown', () => {
    openReport()
    cy.selectTreeNode([
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipeline NullAndEmpty/NullAndEmpty'
    ]).click()
    cy.checkNumCheckpointValueLabels(1)
    cy.checkpointValueLabel(0)
      .trimmedText()
      .should('equal', 'Message is null')
  })

  it('When message is empty character stream then two labels empty and character stream', () => {
    openReport()
    cy.selectTreeNode([
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipe emptyCharacterStream',
      { seq: 1, text: 'Pipe emptyCharacterStream' }
    ]).click()
    cy.checkNumCheckpointValueLabels(2)
    cy.checkpointValueLabel(0)
      .should('contain.text', 'asynchronously')
      .should('contain.text', 'character stream')
    cy.checkpointValueLabel(1)
      .trimmedText()
      .should('equal', 'Message is empty string')
  })

  it('When message is empty binary stream then two labels empty and binary stream', () => {
    openReport()
    cy.selectTreeNode([
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipe emptyBinaryStream',
      { seq: 1, text: 'Pipe emptyBinaryStream' }
    ]).click()
    cy.checkNumCheckpointValueLabels(3)
    cy.checkpointValueLabel(0)
      .should('contain.text', 'asynchronously')
      .should('contain.text', 'byte stream')
    cy.checkpointValueLabel(1)
      .trimmedText()
      .should('equal', 'Message is empty string')
    cy.checkpointValueLabel(2)
      .should('contain.text', 'encoded')
      .should('contain.text', 'UTF-8')
  })

  it('When message is not-streamed string value then no labels shown', () => {
    openReport()
    cy.selectTreeNode([
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipe normal',
      { seq: 1, text: 'normal' }
    ]).click()
    cy.checkNumCheckpointValueLabels(0)
  })

  it('When message is non-empty character stream then no label empty', () => {
    openReport()
    cy.selectTreeNode([
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipeline NullAndEmpty/NullAndEmpty',
      'Pipe stream',
      { seq: 1, text: 'stream' }
    ]).click()
    cy.checkNumCheckpointValueLabels(1)
    cy.checkpointValueLabel(0)
      .should('contain.text', 'asynchronously')
      .should('contain.text', 'character stream')
  })
})

function openReport (): void {
  cy.visit('')
  cy.getNumLadybugReports()
  cy.inIframeBody('[data-cy-debug="tableRow"]').should('have.length', 1).as('reportRow')
  // Status column.
  // TODO: Test exact value of status column if possible.
  cy.get('@reportRow').find('td:eq(6)').trimmedText().should('equal', 'Success')
  cy.get('@reportRow').contains('NullAndEmpty').click()
}
