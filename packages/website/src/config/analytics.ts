/**
 * Analytics configuration and integration
 * Supports Vercel Analytics and Plausible Analytics
 */

import { getSiteConfig } from './site';

export interface AnalyticsConfig {
  provider: 'vercel' | 'plausible' | 'none';
  id?: string;
  domain?: string;
}

/**
 * Get analytics configuration from site config
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  const siteConfig = getSiteConfig();
  
  return {
    provider: siteConfig.analytics.provider,
    id: siteConfig.analytics.id,
    domain: new URL(siteConfig.url).hostname
  };
}

/**
 * Initialize analytics based on configuration
 * This should be called in the main layout component
 */
export function initializeAnalytics(): string | null {
  const config = getAnalyticsConfig();
  
  if (config.provider === 'none' || !config.id) {
    return null;
  }
  
  switch (config.provider) {
    case 'vercel':
      return getVercelAnalyticsScript();
    
    case 'plausible':
      return getPlausibleAnalyticsScript(config.id, config.domain);
    
    default:
      return null;
  }
}

/**
 * Generate Vercel Analytics script
 */
function getVercelAnalyticsScript(): string {
  return `
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
  `;
}

/**
 * Generate Plausible Analytics script
 */
function getPlausibleAnalyticsScript(id: string, domain?: string): string {
  const dataDomain = domain ? `data-domain="${domain}"` : '';
  
  return `
    <script defer data-api="${id}" ${dataDomain} src="https://plausible.io/js/script.js"></script>
  `;
}

/**
 * Track custom events (works with both providers)
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  const config = getAnalyticsConfig();
  
  if (config.provider === 'none') {
    return;
  }
  
  try {
    switch (config.provider) {
      case 'vercel':
        if (typeof window !== 'undefined' && (window as any).va) {
          (window as any).va('track', eventName, properties);
        }
        break;
      
      case 'plausible':
        if (typeof window !== 'undefined' && (window as any).plausible) {
          (window as any).plausible(eventName, { props: properties });
        }
        break;
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Common event tracking functions
 */
export const analytics = {
  /**
   * Track CTA button clicks
   */
  trackCTAClick: (ctaName: string, location: string) => {
    trackEvent('CTA Click', { cta_name: ctaName, location });
  },
  
  /**
   * Track code copy events
   */
  trackCodeCopy: (codeType: string) => {
    trackEvent('Code Copy', { code_type: codeType });
  },
  
  /**
   * Track external link clicks
   */
  trackExternalLink: (url: string, linkText: string) => {
    trackEvent('External Link', { url, link_text: linkText });
  },
  
  /**
   * Track documentation access
   */
  trackDocumentationAccess: (section: string) => {
    trackEvent('Documentation Access', { section });
  },
  
  /**
   * Track feature exploration
   */
  trackFeatureView: (featureName: string) => {
    trackEvent('Feature View', { feature_name: featureName });
  }
};