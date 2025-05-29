import { render } from '@testing-library/react';
const { axe } = require('jest-axe');
import type { AxeResults } from 'axe-core';

// The matchers are extended globally in jest.setup.js

export async function validateAccessibility(ui: React.ReactElement) {
  const container = render(ui).container;
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}
