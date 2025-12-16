/**
 * Centralized content configuration for UEPM website
 * All homepage content, features, and messaging are defined here
 * for easy maintenance and content management.
 */

export interface Feature {
  icon: string;
  title: string;
  description: string;
  learnMoreHref?: string;
}

export interface CodeStep {
  label: string;
  code: string;
  language: 'bash' | 'json' | 'typescript';
  explanation?: string;
}

export interface CodeExampleConfig {
  title: string;
  description: string;
  steps: CodeStep[];
}

export interface HeroContent {
  title: string;
  subtitle: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
  codePreview: string;
}

export interface HomePageContent {
  hero: HeroContent;
  features: Feature[];
  codeExamples: {
    quickStart: CodeExampleConfig;
    pluginInstall: CodeExampleConfig;
    packageJson: CodeExampleConfig;
  };
  getStarted: {
    title: string;
    subtitle: string;
    quickStartCommand: string;
  };
}

export const homePageContent: HomePageContent = {
  hero: {
    title: "NPM for Unreal Engine Plugins",
    subtitle: "Bring familiar package management workflows to Unreal Engine development. Install, manage, and distribute plugins with the simplicity of NPM.",
    primaryCTA: {
      text: "Get Started",
      href: "#get-started"
    },
    secondaryCTA: {
      text: "View Documentation",
      href: "https://github.com/uepm/uepm#readme"
    },
    codePreview: "npx @uepm/init"
  },
  
  features: [
    {
      icon: "Zap",
      title: "One-Command Setup",
      description: "Initialize UEPM in any Unreal Engine project with a single command. No complex configuration required.",
      learnMoreHref: "https://github.com/uepm/uepm#quick-start"
    },
    {
      icon: "Package",
      title: "NPM Distribution",
      description: "Publish and install plugins using the familiar NPM ecosystem. Leverage existing tooling and workflows.",
      learnMoreHref: "https://github.com/uepm/uepm#publishing-plugins"
    },
    {
      icon: "Shield",
      title: "Automatic Validation",
      description: "Built-in validation ensures plugin compatibility and catches common issues before deployment.",
      learnMoreHref: "https://github.com/uepm/uepm#validation"
    },
    {
      icon: "GitBranch",
      title: "Dependency Management",
      description: "Automatically resolve and install plugin dependencies. Handle version conflicts intelligently.",
      learnMoreHref: "https://github.com/uepm/uepm#dependencies"
    },
    {
      icon: "Wrench",
      title: "Patch Support",
      description: "Apply patches and modifications to plugins seamlessly. Maintain customizations across updates.",
      learnMoreHref: "https://github.com/uepm/uepm#patches"
    },
    {
      icon: "Users",
      title: "Community Driven",
      description: "Open source project built by and for the Unreal Engine community. Contribute and shape the future.",
      learnMoreHref: "https://github.com/uepm/uepm/discussions"
    }
  ],
  
  codeExamples: {
    quickStart: {
      title: "Quick Start",
      description: "Get up and running with UEPM in your Unreal Engine project",
      steps: [
        {
          label: "Initialize UEPM",
          code: "npx @uepm/init",
          language: "bash",
          explanation: "Run this command in your Unreal Engine project root directory"
        },
        {
          label: "Follow the setup wizard",
          code: "? Project name: MyAwesomeGame\n? Unreal Engine version: 5.3\n? Initialize git repository? Yes\n✓ UEPM initialized successfully!",
          language: "bash",
          explanation: "The interactive setup will guide you through configuration"
        }
      ]
    },
    
    pluginInstall: {
      title: "Install Plugins",
      description: "Add plugins to your project using familiar NPM commands",
      steps: [
        {
          label: "Install a plugin",
          code: "uepm install @uepm/example-plugin",
          language: "bash",
          explanation: "Install plugins from NPM or local sources"
        },
        {
          label: "Install with version",
          code: "uepm install @uepm/ui-toolkit@^2.1.0",
          language: "bash",
          explanation: "Specify version ranges just like NPM packages"
        },
        {
          label: "Install development dependencies",
          code: "uepm install --save-dev @uepm/test-utils",
          language: "bash",
          explanation: "Separate runtime and development dependencies"
        }
      ]
    },
    
    packageJson: {
      title: "Package Configuration",
      description: "Configure your project with a familiar package.json structure",
      steps: [
        {
          label: "package.json",
          code: `{
  "name": "my-awesome-game",
  "version": "1.0.0",
  "unrealEngine": "5.3",
  "dependencies": {
    "@uepm/ui-toolkit": "^2.1.0",
    "@uepm/networking": "^1.5.2"
  },
  "devDependencies": {
    "@uepm/test-utils": "^1.0.0"
  }
}`,
          language: "json",
          explanation: "Standard package.json with Unreal Engine specific fields"
        }
      ]
    }
  },
  
  getStarted: {
    title: "Ready to Get Started?",
    subtitle: "Transform your Unreal Engine plugin workflow in minutes. Install UEPM and experience the power of NPM-style package management.",
    quickStartCommand: "npx @uepm/init"
  }
};

/**
 * Navigation links configuration
 */
export interface NavigationLink {
  text: string;
  href: string;
  internal: boolean;
  description?: string;
}

export const navigationLinks: NavigationLink[] = [
  {
    text: "Home",
    href: "/",
    internal: true
  },
  {
    text: "Documentation",
    href: "https://github.com/uepm/uepm#readme",
    internal: false,
    description: "Complete setup and usage guide"
  },
  {
    text: "GitHub",
    href: "https://github.com/uepm/uepm",
    internal: false,
    description: "Source code and issues"
  },
  {
    text: "NPM",
    href: "https://www.npmjs.com/package/@uepm/init",
    internal: false,
    description: "Package on NPM registry"
  }
];

/**
 * Footer links configuration
 */
export interface FooterLinkSection {
  title: string;
  links: Array<{
    text: string;
    href: string;
    external: boolean;
  }>;
}

export const footerLinks: Record<string, FooterLinkSection> = {
  product: {
    title: "Product",
    links: [
      {
        text: "Documentation",
        href: "https://github.com/uepm/uepm#readme",
        external: true
      },
      {
        text: "Getting Started",
        href: "#get-started",
        external: false
      },
      {
        text: "Examples",
        href: "https://github.com/uepm/uepm/tree/main/samples",
        external: true
      },
      {
        text: "Release Notes",
        href: "https://github.com/uepm/uepm/releases",
        external: true
      }
    ]
  },
  
  community: {
    title: "Community",
    links: [
      {
        text: "GitHub",
        href: "https://github.com/uepm/uepm",
        external: true
      },
      {
        text: "Discussions",
        href: "https://github.com/uepm/uepm/discussions",
        external: true
      },
      {
        text: "Report Issues",
        href: "https://github.com/uepm/uepm/issues",
        external: true
      },
      {
        text: "NPM Package",
        href: "https://www.npmjs.com/package/@uepm/init",
        external: true
      }
    ]
  },
  
  resources: {
    title: "Resources",
    links: [
      {
        text: "Unreal Engine",
        href: "https://www.unrealengine.com/",
        external: true
      },
      {
        text: "NPM Documentation",
        href: "https://docs.npmjs.com/",
        external: true
      },
      {
        text: "Plugin Development",
        href: "https://docs.unrealengine.com/5.3/en-US/plugins-in-unreal-engine/",
        external: true
      },
      {
        text: "Package.json Guide",
        href: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json",
        external: true
      }
    ]
  }
};