import './commands'

// Ignore ResizeObserver errors
Cypress.on('uncaught:exception', (err: any) => {
  const errorText = err?.message || err?.toString() || '';

  if (/ResizeObserver/i.test(errorText)) {
    return false;
  }

  return true;
});
