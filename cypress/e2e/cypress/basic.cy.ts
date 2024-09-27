describe('Basic tests', () => {
  beforeEach(() => {
    cy.visit('')
  })

  it('Basic test', () => {
    cy.getNumLadybugReports().then(numReports => {
      cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx')
      cy.getNumLadybugReports().should('equal', numReports + 1)
    })
  })

  it('Filter no regex', () => {
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

  it('To be captured', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy-nav="testing"]').click()
    cy.get('[data-cy-nav="testingLadybug"] > a').click()
    /* ==== End Cypress Studio ==== */
  })
})
