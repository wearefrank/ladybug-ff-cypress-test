describe('Basic tests', () => {
	it('Basic test', () => {
		cy.visit('');
		cy.getNumLadybugReports().then(numReports => {
			cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx');
			cy.getNumLadybugReports().should('equal', numReports + 1);
		})
	})
})