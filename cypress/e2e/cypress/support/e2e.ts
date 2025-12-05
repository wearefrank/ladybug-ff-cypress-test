import './commands'

Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver errors
  if (err.message.includes('ResizeObserver')) {
    return false; // prevents Cypress from failing the test
  }

  // Let other errors fail the test
  return true;
});
