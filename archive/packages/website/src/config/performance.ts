/**
 * Performance monitoring and optimization configuration
 */

export interface PerformanceConfig {
  // Core Web Vitals thresholds
  coreWebVitals: {
    fcp: number; // First Contentful Paint (ms)
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte (ms)
  };
  
  // Resource loading optimization
  resources: {
    // Image optimization
    images: {
      formats: string[];
      quality: number;
      sizes: number[];
      lazyLoading: boolean;
    };
    
    // Font optimization
    fonts: {
      preload: string[];
      display: 'swap' | 'fallback' | 'optional';
    };
    
    // JavaScript optimization
    javascript: {
      defer: boolean;
      modulePreload: boolean;
      bundleSplitting: boolean;
    };
    
    // CSS optimization
    css: {
      critical: boolean;
      minify: boolean;
      purge: boolean;
    };
  };
  
  // Monitoring configuration
  monitoring: {
    enabled: boolean;
    provider: 'vercel' | 'plausible' | 'google-analytics';
    trackingId?: string;
    reportWebVitals: boolean;
    errorTracking: boolean;
  };
  
  // Cache configuration
  cache: {
    staticAssets: number; // Cache duration in seconds
    apiResponses: number;
    serviceWorker: boolean;
  };
}

export const performanceConfig: PerformanceConfig = {
  coreWebVitals: {
    fcp: 1500, // 1.5 seconds
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1 layout shift score
    ttfb: 600  // 600ms
  },
  
  resources: {
    images: {
      formats: ['avif', 'webp', 'jpg'],
      quality: 85,
      sizes: [320, 640, 768, 1024, 1280, 1920],
      lazyLoading: true
    },
    
    fonts: {
      preload: [
        '/fonts/inter-var.woff2',
        '/fonts/jetbrains-mono.woff2'
      ],
      display: 'swap'
    },
    
    javascript: {
      defer: true,
      modulePreload: true,
      bundleSplitting: true
    },
    
    css: {
      critical: true,
      minify: true,
      purge: true
    }
  },
  
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    provider: 'vercel',
    trackingId: process.env.VERCEL_ANALYTICS_ID,
    reportWebVitals: true,
    errorTracking: true
  },
  
  cache: {
    staticAssets: 31536000, // 1 year
    apiResponses: 3600,     // 1 hour
    serviceWorker: true
  }
};

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private config: PerformanceConfig;
  
  constructor(config: PerformanceConfig = performanceConfig) {
    this.config = config;
  }
  
  /**
   * Generate responsive image srcset
   */
  generateImageSrcSet(src: string, alt: string): string {
    const { sizes, formats } = this.config.resources.images;
    
    return sizes
      .map(size => `${src}?w=${size}&q=${this.config.resources.images.quality} ${size}w`)
      .join(', ');
  }
  
  /**
   * Get optimized image attributes
   */
  getImageAttributes(src: string, alt: string, priority = false) {
    return {
      src,
      alt,
      srcset: this.generateImageSrcSet(src, alt),
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      loading: priority ? 'eager' : 'lazy',
      decoding: 'async',
      fetchpriority: priority ? 'high' : 'auto'
    };
  }
  
  /**
   * Get font preload links
   */
  getFontPreloadLinks(): Array<{ href: string; as: string; type: string; crossorigin: string }> {
    return this.config.resources.fonts.preload.map(href => ({
      href,
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    }));
  }
  
  /**
   * Get critical CSS for inline inclusion
   */
  getCriticalCSS(): string {
    return `
      /* Critical CSS for above-the-fold content */
      *,*::before,*::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
      html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}
      body{margin:0;line-height:inherit}
      h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
      a{color:inherit;text-decoration:inherit}
      button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
      .hero-section{min-height:100vh;display:flex;align-items:center;justify-content:center}
      .container{width:100%;max-width:1280px;margin:0 auto;padding:0 1rem}
      .btn{display:inline-flex;align-items:center;justify-content:center;padding:0.75rem 1.5rem;border-radius:0.375rem;font-weight:500;transition:all 0.2s}
      .text-gradient{background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
      @media (max-width: 640px) {
        .container{padding:0 1rem}
        .hero-section{min-height:80vh}
      }
    `;
  }
  
  /**
   * Initialize performance monitoring
   */
  initializeMonitoring() {
    if (!this.config.monitoring.enabled) return;
    
    // Web Vitals reporting
    if (this.config.monitoring.reportWebVitals && typeof window !== 'undefined') {
      this.reportWebVitals();
    }
    
    // Error tracking
    if (this.config.monitoring.errorTracking && typeof window !== 'undefined') {
      this.initializeErrorTracking();
    }
  }
  
  private reportWebVitals() {
    // Report Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: entry.name,
          value: entry.startTime || (entry as any).value,
          id: entry.entryType,
          timestamp: Date.now()
        };
        
        // Send to analytics
        this.sendMetric(metric);
      }
    });
    
    // Observe paint metrics
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
  
  private initializeErrorTracking() {
    window.addEventListener('error', (event) => {
      this.sendError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.sendError({
        message: 'Unhandled Promise Rejection',
        error: event.reason
      });
    });
  }
  
  private sendMetric(metric: any) {
    // Send to configured analytics provider
    if (this.config.monitoring.provider === 'vercel' && typeof window !== 'undefined') {
      // Vercel Analytics
      (window as any).va?.track('web-vital', metric);
    }
  }
  
  private sendError(error: any) {
    // Send error to monitoring service
    console.error('Performance Error:', error);
    
    if (this.config.monitoring.provider === 'vercel' && typeof window !== 'undefined') {
      (window as any).va?.track('error', error);
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();