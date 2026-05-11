/**
 * Centralized site configuration for UEPM website
 * All external URLs, metadata, and site-wide settings are defined here
 * for easy maintenance and consistency across components.
 */

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  github: {
    url: string;
    text: string;
    stars?: number;
  };
  npm: {
    packageName: string;
    url: string;
    text: string;
    downloads?: number;
  };
  documentation: {
    url: string;
    text: string;
  };
  analytics: {
    provider: 'vercel' | 'plausible' | 'none';
    id?: string;
  };
  social: {
    github: string;
    npm: string;
  };
  externalLinks: {
    issues: string;
    discussions: string;
    releases: string;
    examples: string;
    unrealEngine: string;
    npmDocs: string;
    pluginDevelopment: string;
    packageJsonGuide: string;
  };
}

export const siteConfig: SiteConfig = {
  title: "UEPM - NPM for Unreal Engine Plugins",
  description: "Bringing familiar NPM workflows to Unreal Engine plugin development. Simplify plugin management with one-command setup, automatic validation, and dependency management.",
  url: "https://uepm.dev", // This will be updated for actual deployment
  
  github: {
    url: "https://github.com/uepm/uepm",
    text: "GitHub Repository"
  },
  
  npm: {
    packageName: "@uepm/init",
    url: "https://www.npmjs.com/package/@uepm/init",
    text: "NPM Package"
  },
  
  documentation: {
    url: "https://github.com/uepm/uepm#readme",
    text: "Documentation"
  },
  
  analytics: {
    provider: 'none', // Will be configured via environment variables
    id: undefined
  },
  
  social: {
    github: "https://github.com/uepm/uepm",
    npm: "https://www.npmjs.com/package/@uepm/init"
  },
  
  externalLinks: {
    issues: "https://github.com/uepm/uepm/issues",
    discussions: "https://github.com/uepm/uepm/discussions",
    releases: "https://github.com/uepm/uepm/releases",
    examples: "https://github.com/uepm/uepm/tree/main/samples",
    unrealEngine: "https://www.unrealengine.com",
    npmDocs: "https://docs.npmjs.com",
    pluginDevelopment: "https://docs.unrealengine.com/5.3/en-US/plugins-in-unreal-engine",
    packageJsonGuide: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json"
  }
};

/**
 * Environment-specific configuration
 * These values can be overridden by environment variables
 */
export function getEnvironmentConfig(): Partial<SiteConfig> {
  const config: Partial<SiteConfig> = {};
  
  // Analytics configuration from environment
  if (import.meta.env.PUBLIC_ANALYTICS_PROVIDER) {
    config.analytics = {
      provider: import.meta.env.PUBLIC_ANALYTICS_PROVIDER as 'vercel' | 'plausible' | 'none',
      id: import.meta.env.PUBLIC_ANALYTICS_ID
    };
  }
  
  // Site URL from environment (for production deployment)
  if (import.meta.env.PUBLIC_SITE_URL) {
    config.url = import.meta.env.PUBLIC_SITE_URL;
  }
  
  return config;
}

/**
 * Get the complete site configuration with environment overrides
 */
export function getSiteConfig(): SiteConfig {
  const envConfig = getEnvironmentConfig();
  return {
    ...siteConfig,
    ...envConfig,
    analytics: {
      ...siteConfig.analytics,
      ...envConfig.analytics
    }
  };
}