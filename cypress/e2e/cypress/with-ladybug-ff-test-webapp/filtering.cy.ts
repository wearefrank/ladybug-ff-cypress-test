describe('Tests with filtering', () => {
  before(() => {
    cy.apiDeleteAll('FileDebugStorage')
    cy.apiDeleteAll('Test')
    cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
    cy.runInTestAPipeline('Example1b', 'Adapter1b', 'xxx')
    cy.runInTestAPipeline('Example1c', 'Adapter1c', 'xxx')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeChar', ' ')
    cy.runInTestAPipeline('UseToStreamPipe', 'UseToStreamPipeBin', ' ').then((total) => {
      expect(total).to.equal(5)
    })
  })

  it('Dummy test', () => {
    cy.wrap('Some text')
  })
})
