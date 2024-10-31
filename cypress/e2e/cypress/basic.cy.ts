describe('Basic tests', () => {
  beforeEach(() => {
    // This URL is wrong, intercept it to suppress network error
    cy.intercept('GET', '/assets/monaco/vs/base/worker/workerMain.js', { body: '' })
  })

  it('Basic test', () => {
    cy.visit('')
    cy.getNumLadybugReports().then(numReports => {
      cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
      cy.getNumLadybugReports().should('equal', numReports + 1)
    })
  })

  it('Filter no regex', () => {
    cy.visit('')
    cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
    cy.runInTestAPipeline('Example1b', 'Adapter1b', 'xxx')
    cy.getNumLadybugReports().should('at.least', 2).then(total => {
      cy.getNumLadybugReportsForNameFilter('Adapter1a').then(reportsA => {
        expect(reportsA).not.to.be.undefined
        expect(reportsA).to.be.lessThan(total as number)
        cy.getNumLadybugReportsForNameFilter('Adapter1b').then(reportsB => {
          expect(reportsB).to.be.lessThan(total as number)
          expect(reportsA + reportsB).to.equal(total)
        })
      })
    })
  })
})
