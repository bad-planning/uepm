/**
 * Centralized configuration exports
 * Import all configuration from this single entry point
 */

// Site configuration
export { 
  siteConfig, 
  getSiteConfig, 
  getEnvironmentConfig,
  type SiteConfig 
} from './site';

// Content configuration
export {
  homePageContent,
  navigationLinks,
  footerLinks,
  type Feature,
  type CodeStep,
  type CodeExampleConfig,
  type HeroContent,
  type HomePageContent,
  type NavigationLink,
  type FooterLinkSection
} from './content';

// Analytics configuration
export {
  getAnalyticsConfig,
  initializeAnalytics,
  trackEvent,
  analytics,
  type AnalyticsConfig
} from './analytics';

// Performance configuration
export {
  performanceConfig,
  performanceOptimizer,
  PerformanceOptimizer,
  type PerformanceConfig
} from './performance';