/**
 * Performance utilities for the UEPM website
 */

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll(selector);
  
  if (!images.length) return;
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        }
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources: string[]) {
  if (typeof window === 'undefined') return;
  
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    // Determine resource type
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(woff2?|ttf|eot)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) {
      link.as = 'image';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
}

/**
 * Measure and report performance metrics
 */
export class PerformanceTracker {
  private metrics: Map<string, number> = new Map();
  
  /**
   * Start timing a performance metric
   */
  start(name: string): void {
    this.metrics.set(name, performance.now());
  }
  
  /**
   * End timing and return duration
   */
  end(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) {
      console.warn(`Performance metric "${name}" was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    
    return duration;
  }
  
  /**
   * Measure function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    this.start(name);
    const result = fn();
    const duration = this.end(name);
    
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    
    return result;
  }
  
  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Promise<Record<string, number>> {
    return new Promise((resolve) => {
      const vitals: Record<string, number> = {};
      
      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          vitals.fid = (entry as any).processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
      
      // Return vitals after a delay to collect metrics
      setTimeout(() => resolve(vitals), 3000);
    });
  }
}

/**
 * Resource loading optimization
 */
export class ResourceOptimizer {
  /**
   * Load CSS asynchronously
   */
  static loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      document.head.appendChild(link);
    });
  }
  
  /**
   * Load JavaScript asynchronously
   */
  static loadJS(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load JS: ${src}`));
      document.head.appendChild(script);
    });
  }
  
  /**
   * Preload resources based on user interaction
   */
  static preloadOnInteraction(resources: string[], events = ['mouseenter', 'touchstart']) {
    let loaded = false;
    
    const load = () => {
      if (loaded) return;
      loaded = true;
      
      resources.forEach((resource) => {
        if (resource.endsWith('.css')) {
          this.loadCSS(resource);
        } else if (resource.endsWith('.js')) {
          this.loadJS(resource);
        }
      });
    };
    
    events.forEach((event) => {
      document.addEventListener(event, load, { once: true, passive: true });
    });
  }
}

/**
 * Memory optimization utilities
 */
export class MemoryOptimizer {
  private static observers: Set<IntersectionObserver> = new Set();
  private static listeners: Map<string, EventListener> = new Map();
  
  /**
   * Clean up observers and listeners
   */
  static cleanup(): void {
    // Disconnect all observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    
    // Remove all listeners
    this.listeners.forEach((listener, event) => {
      document.removeEventListener(event, listener);
    });
    this.listeners.clear();
  }
  
  /**
   * Add observer for cleanup tracking
   */
  static trackObserver(observer: IntersectionObserver): void {
    this.observers.add(observer);
  }
  
  /**
   * Add listener for cleanup tracking
   */
  static trackListener(event: string, listener: EventListener): void {
    this.listeners.set(event, listener);
    document.addEventListener(event, listener);
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    MemoryOptimizer.cleanup();
  });
}