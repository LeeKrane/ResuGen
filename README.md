# ResuGen

<div align="center">
  <img src="/public/logo.webp" alt="ResuGen Logo" width="120" height="120">
  <p>A modern, intuitive resume generator built with Nuxt 3 and Nuxt UI</p>
</div>

## 🌟 Features

- **Modern UI/UX**: Clean, responsive interface built with Nuxt UI components
- **Real-time Preview**: See changes instantly as you build your resume
- **ATS-Friendly**: Optimized for Applicant Tracking Systems
- **Browser-based PDF Export**: Print to PDF directly through your browser
- **Data Portability**: Import/Export your resume data as ZIP
- **Flexible Customization**: Personalize colors, spacing, and typography
- **Type-Safe**: Built with TypeScript for reliability
- **Aesthetic Design**: Subtle particle animation background

## 🎯 How It Works

1. **Fill Your Details**: Enter your information using our intuitive form-based editor
2. **Customize Appearance**: Adjust colors, spacing, and typography to match your style
3. **Generate PDF**: Use your browser's print function to save as PDF
   - Click the "Print" button
   - Select "Save as PDF" in your browser's print dialog
   - Choose your preferred paper size (A4 recommended)
   - Save your professional resume

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm/yarn/bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://gitlab.com/krane.dev/resugen.git
   cd resugen
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) - Vue.js Framework
- **UI Components**: [Nuxt UI](https://ui.nuxt.com/) - Ready-to-use Vue components
- **Styling**: Tailwind CSS - Utility-first CSS framework
- **Type Safety**: TypeScript - Static type checking
- **File Handling**: JSZip - Resume data import/export
- **Visual Effects**: Nuxt Particles - Decorative background
- **Image Optimization**: Nuxt Image - Automatic image optimization

## 📁 Project Structure

```
resugen/
├── app/
│   ├── components/
│   │   ├── form/       # Form-related components
│   │   ├── general/    # General-purpose components
│   │   └── site/       # Site layout components
│   └── pages/          # Application routes
├── public/             # Static assets
├── types/              # TypeScript type definitions
└── nuxt.config.ts      # Nuxt configuration
```

## 🔧 Configuration

The application can be configured through `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  // Enable development tools
  devtools: { enabled: true },

  // Configure modules
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    'nuxt-particles'
  ],

  // Additional configuration...
})
```

## 🎨 Customization Options

- **Colors**: Customize all aspects of your resume's color scheme
- **Typography**: Choose from various font combinations
- **Spacing**: Adjust margins, padding, and layout spacing
- **Sections**: Add, remove, or reorder resume sections
- **Content**: Full control over text formatting and structure

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and conventions
- Development workflow
- Issue reporting
- Pull request process

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- [Live Demo](https://resugen.krane.dev)
- [Documentation](https://gitlab.com/krane.dev/resugen/-/blob/main/README.md)
- [Issue Tracker](https://gitlab.com/krane.dev/resugen/-/issues)
- [GitLab Repository](https://gitlab.com/krane.dev/resugen)
- [GitHub Mirror](https://github.com/krane.dev/resugen)

## ✨ Acknowledgments

- [Nuxt.js Team](https://nuxt.com/) for the amazing framework
- [Nuxt UI Team](https://ui.nuxt.com/) for the beautiful components
- All our [contributors](https://gitlab.com/krane.dev/resugen/-/graphs/main)

## 📧 Support

Need help? Have questions?

- Create an [issue](https://gitlab.com/krane.dev/resugen/-/issues/new)
- Email: support+resugen@krane.dev

---

<div align="center">
  Made with ❤️ by <a href="https://krane.dev">Krane Development</a>
</div>