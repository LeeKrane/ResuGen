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
   - Bug Report: Use the [[BUG]](https://github.com/LeeKrane/ResuGen/issues/new?template=bug-report.md) template for bugs
   - Feature Request: Use the [[FEAT]](https://github.com/LeeKrane/ResuGen/issues/new?template=feature-request.md) template for new features
   - Enhancement Request: Use the [[ENHANCE]](https://github.com/LeeKrane/ResuGen/issues/new?template=enhancement-request.md) template for improvements
   - Documentation Issue: Use the [[DOCS]](https://github.com/LeeKrane/ResuGen/issues/new?template=documentation-issue.md) template for documentation issues
   - Question: Use the [[QUESTION]](https://github.com/LeeKrane/ResuGen/issues/new?template=question.md) template for questions
   - UI/UX Feedback: Use the [[UX]](https://github.com/LeeKrane/ResuGen/issues/new?template=ui-ux-feedback.md) template for design feedback
   - Performance Issue: Use the [[PERF]](https://github.com/LeeKrane/ResuGen/issues/new?template=performance-issue.md) template for performance concerns
   - Maintenance/Refactor: Use the [[MAINT]](https://github.com/LeeKrane/ResuGen/issues/new?template=maintenance-refactor.md) template for technical debt
   - Security Report: Email security+resugen@krane.dev (do not create public issues)
3. For general questions, "how-to" questions, or sharing your creations, please use our [GitHub Discussions](https://github.com/LeeKrane/ResuGen/discussions) instead of creating an issue.

### Working on Issues
1. Comment on the issue you want to work on
2. Wait for assignment from maintainers
3. Create a branch with a descriptive name that includes the issue number:
   ```bash
   git checkout -b feat/123-resume-export-options
   # or
   git checkout -b fix/456-mobile-layout-issue
   # or use GitHub's auto-generated branch names
   git checkout -b 123-resume-export-options
   ```
   Branch prefix should be one of:
   - `feat/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `style/` for code style changes
   - `refactor/` for code refactoring
   - `test/` for adding tests
   - `chore/` for maintenance tasks
   - `<issue-number>-<issue-title>` for GitHub auto-generated branch names

## Pull Request Process

1. Ensure your PR addresses an existing issue. If it's a new feature or significant change, please open an issue first for discussion.
2. Before submitting, ensure the following:
   - Your code adheres to the project's code style.
   - All tests pass locally (if applicable)
   - Documentation is updated as needed
   - Your branch is rebased on the latest `development` branch to avoid conflicts.
   - For UI changes, include relevant screenshots or GIFs in your PR description.
3. Create a Pull Request against the `development` branch (not `latest`, this is done by maintainers):
   - Provide a clear, descriptive title using conventional commit message style (e.g., `feat: Add resume export options`).
   - Reference the related issue(s) (e.g., `Closes #123`).
   - Fill out the Pull Request template thoroughly.
4. Wait for maintainers to review your PR. Be prepared to address feedback and make changes as necessary.

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

- Check the [documentation](https://github.com/LeeKrane/ResuGen/-/blob/latest/README.md).
- For general questions, discussions, ideas, polls, or "how-to" questions, please use [GitHub Discussions](https://github.com/LeeKrane/ResuGen/discussions).
- For bugs, feature requests, or other issues, please use [GitHub Issues](https://github.com/LeeKrane/ResuGen/issues).
- For security reports, please email [security+resugen@krane.dev](mailto:security+resugen@krane.dev)
- Visit our [Volta project board](https://volta.net/LeeKrane/ResuGen) for project status.
- Contact support at [support+resugen@krane.dev](mailto:support+resugen@krane.dev).

## License

By contributing to ResuGen, you agree that your contributions will be licensed under the MIT License.
