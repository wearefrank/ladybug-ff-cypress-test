// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare namespace Cypress {
	interface Chainable<Subject = any> {
		runInTestAPipeline(config: string, adapter: string, message: string): Chainable<any>;
	}
}

Cypress.Commands.add('runInTestAPipeline', (config: string, adapter: string, message: string) => {
	cy.get('[data-cy-nav="testing"]').click();
	cy.get('[data-cy-nav="testingRunPipeline"]').click();
	cy.get('[data-cy-test-pipeline="selectConfig"]')
		.select(config);
	cy.get('[data-cy-test-pipeline="selectAdapter"]')
		.select(adapter);
	cy.get('[data-cy-test-pipeline="message"]')
		.type(message);
	cy.get('[data-cy-test-pipeline="send"]').click();
	cy.get('[data-cy-test-pipeline="runResult"]').should('contain', 'SUCCESS');
});