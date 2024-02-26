describe('Basic tests', () => {
	it('Basic test', () => {
		cy.visit('');
		cy.runInTestAPipeline();
	})
})