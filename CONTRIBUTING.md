# Contributing to ResuGen

Thank you for your interest in contributing to ResuGen! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ResuGen.git
   cd ResuGen
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Guidelines

### Technology Stack
- Nuxt 3
- Nuxt UI
- TypeScript
- Vue 3
- JSZip (for import/export functionality)

### Component Guidelines
- Use Nuxt UI components whenever possible (see [Nuxt UI documentation](https://ui.nuxt.com/))
  - Use `UButton` instead of native `<button>`
  - Use `UInput`, `USelect`, `UTextarea` for form elements
  - Use `UModal` for dialogs
  - Use `UIcon` for icons
  - Use `UTooltip` for tooltips
- Only create custom components when Nuxt UI doesn't provide the needed functionality

### Code Style
- Follow the existing code style and TypeScript conventions
- Use Vue 3's Composition API with `<script setup>` syntax
- Maintain type safety using TypeScript
- Follow the existing component structure:
  - `app/components/form/` for form-related components
  - `app/components/general/` for general-purpose components
  - `app/components/site/` for site layout components

### Commit Guidelines
- Use conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

## Issue Guidelines

### Creating Issues
1. Check existing issues to avoid duplicates
2. Use the appropriate issue template:
   - Bug Report: Use the [BUG] template for bugs
   - Feature Request: Use the [FEAT] template for new features
   - Enhancement Request: Use the [ENHANCE] template for improvements
   - Documentation Issue: Use the [DOCS] template for documentation issues
   - Question: Use the [QUESTION] template for questions
   - UI/UX Feedback: Use the [UX] template for design feedback
   - Performance Issue: Use the [PERF] template for performance concerns
   - Maintenance/Refactor: Use the [MAINT] template for technical debt
   - Security Report: Email security+resugen@krane.dev (do not create public issues)

### Working on Issues
1. Comment on the issue you want to work on
2. Wait for assignment from maintainers
3. Create a branch with a descriptive name that includes the issue number:
   ```bash
   git checkout -b feat/123-resume-export-options
   # or
   git checkout -b fix/456-mobile-layout-issue
   ```
   Branch prefix should be one of:
   - `feat/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `style/` for code style changes
   - `refactor/` for code refactoring
   - `test/` for adding tests
   - `chore/` for maintenance tasks

## Pull Request Process

1. Ensure your PR addresses an existing issue
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass:
   ```bash
   pnpm lint
   ```
5. Create a Pull Request with:
   - Clear title and description
   - Reference to the related issue
   - Screenshots for UI changes
   - List of tested browsers/devices

## Development Setup Tips

### Environment
- Node.js 18+ recommended
- Use VS Code with Volar extension for best Vue/TypeScript support
- Enable ESLint integration in your editor

### Common Tasks
- Lint code: `pnpm lint`
- Fix lint issues: `pnpm lint:fix`
- Build for production: `pnpm build`
- Preview production build: `pnpm preview`

## Getting Help

- Check the [documentation](https://github.com/LeeKrane/ResuGen?tab=readme-ov-file#readme)
- Create a [question issue](https://github.com/LeeKrane/ResuGen/issues/new/choose) using the question template
- Visit our [Volta project board](https://volta.net/LeeKrane/ResuGen) for project status
- Contact support at support+resugen@krane.dev

## License

By contributing to ResuGen, you agree that your contributions will be licensed under the MIT License.