describe('Basic tests', () => {
	it('Basic test', () => {
		cy.visit('');
		cy.runInTestAPipeline('Example1a', 'Adapter1a', 'xxx');
	})
})