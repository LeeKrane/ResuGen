# Test Setup Instructions

## Overview

Property-based tests have been created for the data model extensions but require testing dependencies to be installed and run.

## Installation

To run the tests, you need to install the testing dependencies:

```bash
pnpm add -D vitest @vitest/ui @vue/test-utils happy-dom fast-check @nuxt/test-utils
```

Or if using npm:

```bash
npm install --save-dev vitest @vitest/ui @vue/test-utils happy-dom fast-check @nuxt/test-utils
```

## Running Tests

Once dependencies are installed, you can run the tests using:

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

## Test Files

- `app/composables/resumeData.test.ts` - Property-based tests for data model extensions
  - Property 4: Job field persists in state (Requirements 1.5)
  - Property 6: Cover letter data stored separately (Requirements 3.3)

## Configuration

The test configuration is defined in `vitest.config.ts` which sets up:
- Global test utilities
- jsdom environment for DOM testing
- Path aliases for imports

## Note

The tests are written and ready to run. They validate that:
1. Job field values persist correctly in application state
2. Cover letter data is stored separately from resume data
3. The new type structures (Qualification, CoverLetter) work correctly

Each property test runs 100 iterations with randomly generated data to ensure correctness across a wide range of inputs.
