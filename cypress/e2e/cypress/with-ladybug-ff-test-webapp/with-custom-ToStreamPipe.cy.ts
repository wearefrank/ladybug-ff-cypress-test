// This test demonstrates that some bugs ARE present.
// When these bugs are fixed, they can be updated
// to ward against regression.
describe('With custom ToStreamPipe', () => {
  // Make this beforeEach() when issue https://github.com/wearefrank/ladybug/issues/344
  // will have been fixed.
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
  })

  it('Discarded character stream appears well in Ladybug', () => {
    cy.visit('')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeChar', ' ')
    cy.getNumLadybugReports().should('equal', 1)
    cy.inIframeBody('[data-cy-debug="tableRow"]').contains('UseToStreamPipeChar').click()
    cy.selectTreeNode([
      'Pipeline UseToStreamPipe/UseToStreamPipeChar',
      'Pipeline UseToStreamPipe/UseToStreamPipeChar',
      'Pipe testPipe',
      { text: 'Pipe testPipe', seq: 1 }
    ]).click()
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.inIframeBody('app-edit-display app-editor').contains('Hello World_suffix')
  })

  it('Discarded binary stream appears well in Ladybug', () => {
    cy.visit('')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeBin', ' ')
    cy.getNumLadybugReports().should('equal', 2)
    cy.inIframeBody('[data-cy-debug="tableRow"]').contains('UseToStreamPipeBin').click()
    cy.selectTreeNode([
      'Pipeline UseToStreamPipe/UseToStreamPipeBin',
      'Pipeline UseToStreamPipe/UseToStreamPipeBin',
      'Pipe testPipe',
      { text: 'Pipe testPipe', seq: 1 }
    ]).click()
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'ByteArrayInputStream')
    cy.inIframeBody('app-edit-display app-editor').contains('Hello World_suffix')
  })

  it('NOK: Empty character stream IS closed prematurely', () => {
    cy.visit('')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeEmptyChar', ' ')
    cy.getNumLadybugReports().should('equal', 3)
    cy.inIframeBody('[data-cy-debug="tableRow"]').contains('UseToStreamPipeEmptyChar').click()
    cy.selectTreeNode([
      'Pipeline UseToStreamPipe/UseToStreamPipeEmptyChar',
      'Pipeline UseToStreamPipe/UseToStreamPipeEmptyChar',
      'Pipe testPipe',
      { text: 'Pipe testPipe', seq: 1 }
    ]).click()
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.inIframeBody('app-edit-display app-editor').contains('>> Captured writer was closed')
  })

  it('NOK: Empty binary stream IS closed prematurely', () => {
    cy.visit('')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeEmptyBin', ' ')
    cy.getNumLadybugReports().should('equal', 4)
    cy.inIframeBody('[data-cy-debug="tableRow"]').contains('UseToStreamPipeEmptyBin').click()
    cy.selectTreeNode([
      'Pipeline UseToStreamPipe/UseToStreamPipeEmptyBin',
      'Pipeline UseToStreamPipe/UseToStreamPipeEmptyBin',
      'Pipe testPipe',
      { text: 'Pipe testPipe', seq: 1 }
    ]).click()
    cy.inIframeBody('app-edit-display app-report-alert-message').should('contain.text', 'Message is captured asynchronously')
    cy.inIframeBody('app-edit-display app-editor').contains('>> Captured stream was closed')
  })
})
