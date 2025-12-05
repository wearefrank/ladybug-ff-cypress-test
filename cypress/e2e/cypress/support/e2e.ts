import './commands'

// Ignore ResizeObserver errors
Cypress.on('uncaught:exception', (err: any) => {
  const msg = err?.message || '';

  // Only ignore ResizeObserver loop errors, not all ResizeObserver strings
  if (msg.includes('ResizeObserver loop limit exceeded') ||
      msg.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false;
  }

  return true;
});
