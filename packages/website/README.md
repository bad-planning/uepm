# UEPM Website

The official marketing website for UEPM (Unreal Engine Package Manager), built with Astro and Tailwind CSS.

## 🚀 Project Structure

```text
packages/website/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable Astro components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   ├── styles/           # Global CSS and Tailwind config
│   ├── assets/           # Images and other assets
│   └── test/             # Test files
├── astro.config.mjs      # Astro configuration
├── tailwind.config.mjs   # Tailwind CSS configuration
├── vitest.config.ts      # Vitest test configuration
└── package.json
```

## 🧞 Commands

All commands are run from the `packages/website` directory:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`     |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run test`            | Run tests with Vitest                           |
| `npm run test:watch`      | Run tests in watch mode                         |
| `npm run lint`            | Run ESLint                                       |
| `npm run lint:fix`        | Run ESLint with auto-fix                        |
| `npm run type-check`      | Run TypeScript type checking                    |

## 🎨 Features

- **Astro**: Static site generation with excellent performance
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Full type safety
- **React**: For interactive components (islands architecture)
- **Shiki**: Syntax highlighting for code examples
- **Lucide**: Beautiful, customizable icons
- **Vitest**: Fast unit testing
- **ESLint**: Code linting and formatting

## 📝 Development

The website follows the component-based architecture defined in the design document:

- **Hero Component**: Main landing section with value proposition
- **CodeExample Component**: Interactive code blocks with copy functionality
- **Features Component**: Showcase of UEPM capabilities
- **Layout Component**: Base page structure with SEO meta tags

All components follow consistent naming conventions (PascalCase) and include proper TypeScript interfaces for maintainability.

## 🧪 Testing

The project includes comprehensive tests for:

- Project structure validation
- Component naming conventions
- Configuration file integrity
- Build system setup

Run tests with `npm run test` or in watch mode with `npm run test:watch`.

## 🚀 Deployment

The website is configured for static deployment to platforms like Vercel or Netlify. The build output is optimized for performance with:

- Static site generation
- Asset optimization
- Responsive images
- CSS purging