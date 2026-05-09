/**
 * @file LoadingSpinner.test.tsx
 * @description Static render tests for the LoadingSpinner component using Bun's test runner and react-dom/server.
 *
 * NOTE: These are static render coverage tests. They do not test full client-side interactions or
 * DOM-specific behavior as they rely on renderToString.
 *
 * TODO: If this component later needs interaction, focus, or accessibility testing,
 * revisit Vitest + React Testing Library once the network environment is stable.
 */

import { expect, test } from "bun:test";
import { LoadingSpinner } from "./LoadingSpinner";
import React from 'react';
import { renderToString } from 'react-dom/server';

test("renders LoadingSpinner without crashing", () => {
  const html = renderToString(<LoadingSpinner />);
  expect(html).toBeDefined();
  expect(html).toContain("div");
});

test("renders LoadingSpinner with optional text", () => {
  const testText = "Loading your data...";
  const html = renderToString(<LoadingSpinner text={testText} />);
  expect(html).toContain(testText);
});

test("renders LoadingSpinner with small size", () => {
  const html = renderToString(<LoadingSpinner size="small" />);
  // Verifying the specific dimensions for 'small' (16px)
  expect(html).toContain("width:16px");
  expect(html).toContain("height:16px");
});

test("renders LoadingSpinner with medium size (default)", () => {
  const html = renderToString(<LoadingSpinner />);
  // Verifying the specific dimensions for 'medium' (32px)
  expect(html).toContain("width:32px");
  expect(html).toContain("height:32px");
});

test("renders LoadingSpinner with large size", () => {
  const html = renderToString(<LoadingSpinner size="large" />);
  // Verifying the specific dimensions for 'large' (48px)
  expect(html).toContain("width:48px");
  expect(html).toContain("height:48px");
});
