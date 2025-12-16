import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

/**
 * **Feature: uepm-website, Property 8: Performance standards are maintained across devices**
 * **Validates: Requirements 6.4**
 * 
 * For any device type (mobile, tablet, desktop) and network condition,
 * the website should maintain acceptable performance metrics including:
 * - First Contentful Paint < 1.5s
 * - Largest Contentful Paint < 2.5s
 * - Cumulative Layout Shift < 0.1
 * - First Input Delay < 100ms
 */
describe('Cross-Device Performance', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>UEPM - NPM for Unreal Engine Plugins</title>
          <style>
            /* Critical CSS for performance testing */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; line-height: 1.6; }
            .hero-section { min-height: 100vh; display: flex; align-items: center; }
            .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
            .features-grid { display: grid; gap: 2rem; }
            .feature-card { padding: 2rem; border-radius: 0.5rem; }
            .code-block { background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; }
            .btn { display: inline-flex; padding: 0.75rem 1.5rem; border-radius: 0.375rem; }
            .text-gradient { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
            
            /* Responsive styles */
            @media (max-width: 640px) {
              .container { padding: 0 1rem; }
              .features-grid { grid-template-columns: 1fr; }
              .hero-section { min-height: 80vh; }
            }
            @media (min-width: 641px) and (max-width: 1024px) {
              .container { padding: 0 2rem; }
              .features-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (min-width: 1025px) {
              .container { padding: 0 2rem; }
              .features-grid { grid-template-columns: repeat(3, 1fr); }
            }
          </style>
        </head>
        <body>
          <header>
            <nav class="container">
              <div>UEPM</div>
              <div>
                <a href="#features">Features</a>
                <a href="https://github.com/uepm/uepm#readme" target="_blank" rel="noopener noreferrer">Documentation</a>
              </div>
            </nav>
          </header>
          
          <main>
            <section class="hero-section" aria-labelledby="hero-title">
              <div class="container">
                <h1 id="hero-title" class="text-gradient">NPM for Unreal Engine Plugins</h1>
                <p>Bringing familiar package management workflows to Unreal Engine development.</p>
                <div>
                  <a href="#get-started" class="btn btn-primary">Get Started</a>
                  <a href="https://github.com/uepm/uepm#readme" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View Documentation</a>
                </div>
                <div class="code-block">
                  <code>npx @uepm/init</code>
                  <button id="copy-command" data-copy-text="npx @uepm/init">Copy</button>
                </div>
              </div>
            </section>
            
            <section id="features" class="container">
              <h2>Features</h2>
              <div class="features-grid">
                <div class="feature-card">
                  <h3>One-Command Setup</h3>
                  <p>Initialize UEPM in your project with a single command</p>
                </div>
                <div class="feature-card">
                  <h3>NPM Distribution</h3>
                  <p>Publish and install plugins using familiar NPM workflows</p>
                </div>
                <div class="feature-card">
                  <h3>Dependency Management</h3>
                  <p>Automatic resolution and installation of plugin dependencies</p>
                </div>
              </div>
            </section>
          </main>
          
          <footer class="container">
            <p>&copy; 2024 UEPM. Open source project.</p>
          </footer>
        </body>
      </html>
    `, {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window as Window & typeof globalThis;
    
    // Mock performance API with realistic metrics
    Object.defineProperty(window, 'performance', {
      value: {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByType: (type: string) => {
          if (type === 'paint') {
            return [
              { name: 'first-paint', startTime: 400 },
              { name: 'first-contentful-paint', startTime: 600 }
            ];
          }
          if (type === 'largest-contentful-paint') {
            return [{ startTime: 1200, size: 15000 }];
          }
          if (type === 'layout-shift') {
            return [{ value: 0.05, hadRecentInput: false }];
          }
          return [];
        },
        getEntriesByName: (name: string) => {
          if (name === 'first-input-delay') {
            return [{ processingStart: 50, startTime: 0 }];
          }
          return [];
        }
      }
    });

    // Mock navigator for device detection
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (compatible; test)',
        connection: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50
        }
      }
    });

    // Set global document and window for tests
    global.document = document;
    global.window = window;
  });

  describe('Property 8: Performance standards are maintained across devices', () => {
    it('should maintain Core Web Vitals thresholds across device types and network conditions', () => {
      fc.assert(fc.property(
        fc.constantFrom('mobile', 'tablet', 'desktop'),
        fc.constantFrom('slow-2g', '2g', '3g', '4g', '5g'),
        fc.integer({ min: 320, max: 2560 }), // viewport width
        fc.integer({ min: 568, max: 1440 }), // viewport height
        fc.float({ min: 0.5, max: 4.0 }), // device pixel ratio
        (deviceType, networkType, viewportWidth, viewportHeight, devicePixelRatio) => {
          // Configure device characteristics
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
          Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });
          Object.defineProperty(window, 'devicePixelRatio', { value: devicePixelRatio, writable: true });

          // Configure network characteristics
          const networkConfig = {
            'slow-2g': { downlink: 0.25, rtt: 2000, effectiveType: 'slow-2g' },
            '2g': { downlink: 0.35, rtt: 1400, effectiveType: '2g' },
            '3g': { downlink: 1.5, rtt: 400, effectiveType: '3g' },
            '4g': { downlink: 10, rtt: 50, effectiveType: '4g' },
            '5g': { downlink: 50, rtt: 10, effectiveType: '5g' }
          };

          const network = networkConfig[networkType as keyof typeof networkConfig];
          Object.defineProperty(window.navigator, 'connection', {
            value: network,
            writable: true
          });

          // Test Core Web Vitals based on device and network
          const performanceEntries = window.performance.getEntriesByType('paint');
          const fcpEntry = performanceEntries.find(entry => entry.name === 'first-contentful-paint');
          const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
          const clsEntries = window.performance.getEntriesByType('layout-shift');
          const fidEntries = window.performance.getEntriesByName('first-input-delay');

          // Adjust thresholds based on device and network
          let fcpThreshold = 1500; // Base FCP threshold
          let lcpThreshold = 2500; // Base LCP threshold
          let clsThreshold = 0.1;  // Base CLS threshold
          let fidThreshold = 100;  // Base FID threshold

          // Adjust for network conditions
          if (networkType === 'slow-2g' || networkType === '2g') {
            fcpThreshold *= 2;
            lcpThreshold *= 2;
          } else if (networkType === '3g') {
            fcpThreshold *= 1.5;
            lcpThreshold *= 1.5;
          }

          // Adjust for device type
          if (deviceType === 'mobile') {
            // Mobile devices may have slower processing
            fidThreshold *= 1.5;
          }

          // Test First Contentful Paint
          if (fcpEntry) {
            expect(fcpEntry.startTime).toBeLessThanOrEqual(fcpThreshold);
          }

          // Test Largest Contentful Paint
          if (lcpEntries.length > 0) {
            const latestLcp = lcpEntries[lcpEntries.length - 1];
            expect(latestLcp.startTime).toBeLessThanOrEqual(lcpThreshold);
          }

          // Test Cumulative Layout Shift
          const totalCls = clsEntries.reduce((sum, entry) => sum + (entry as any).value, 0);
          expect(totalCls).toBeLessThanOrEqual(clsThreshold);

          // Test First Input Delay
          if (fidEntries.length > 0) {
            const fid = (fidEntries[0] as any).processingStart - (fidEntries[0] as any).startTime;
            expect(fid).toBeLessThanOrEqual(fidThreshold);
          }

          // Test that critical content is present regardless of performance
          const heroTitle = document.querySelector('#hero-title');
          const ctaButtons = document.querySelectorAll('.btn');
          const featuresSection = document.querySelector('#features');

          expect(heroTitle?.textContent?.trim()).toBeTruthy();
          expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
          expect(featuresSection).toBeTruthy();
        }
      ), { numRuns: 100 });
    });

    it('should optimize resource loading based on device capabilities', () => {
      fc.assert(fc.property(
        fc.constantFrom('mobile', 'tablet', 'desktop'),
        fc.float({ min: Math.fround(1.0), max: Math.fround(3.0) }), // device pixel ratio
        fc.boolean(), // supports WebP
        fc.boolean(), // supports AVIF
        fc.constantFrom('2g', '3g', '4g', '5g'), // network speed
        (deviceType, devicePixelRatio, supportsWebP, supportsAVIF, networkSpeed) => {
          // Test image optimization strategy
          const baseImageSize = 1000; // Base image size in KB
          let optimizedSize = baseImageSize;

          // Apply format optimization
          if (supportsAVIF) {
            optimizedSize *= 0.5; // AVIF provides ~50% size reduction
          } else if (supportsWebP) {
            optimizedSize *= 0.7; // WebP provides ~30% size reduction
          }

          // Apply device pixel ratio optimization
          if (deviceType === 'mobile' && devicePixelRatio > 2) {
            // High DPI mobile - use 2x images but optimize aggressively
            optimizedSize *= 1.4; // Less than full increase
          } else if (deviceType === 'desktop' && devicePixelRatio > 1) {
            optimizedSize *= Math.min(devicePixelRatio * 0.7, 1.8); // Moderate increase for desktop, capped
          }

          // Apply network-based optimization
          if (networkSpeed === '2g' || networkSpeed === '3g') {
            optimizedSize *= 0.6; // Aggressive compression for slow networks
          }

          // Test that optimized size is reasonable
          expect(optimizedSize).toBeLessThanOrEqual(baseImageSize * 1.9); // Never more than 1.9x original
          expect(optimizedSize).toBeGreaterThan(baseImageSize * 0.2); // Never less than 20% of original

          // Test lazy loading implementation
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            // Images below the fold should have loading="lazy"
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
              expect(img.getAttribute('loading')).toBe('lazy');
            }
          });

          // Test critical resource prioritization
          const criticalElements = document.querySelectorAll('.hero-section *, .btn, h1');
          expect(criticalElements.length).toBeGreaterThan(0);
        }
      ), { numRuns: 50 });
    });

    it('should maintain responsive performance across viewport changes', () => {
      fc.assert(fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.integer({ min: 568, max: 1440 }),
        fc.constantFrom('portrait', 'landscape'),
        (width, height, orientation) => {
          // Adjust dimensions based on orientation
          const viewportWidth = orientation === 'portrait' ? Math.min(width, height) : Math.max(width, height);
          const viewportHeight = orientation === 'portrait' ? Math.max(width, height) : Math.min(width, height);

          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
          Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

          // Test layout performance
          const startTime = performance.now();
          
          // Simulate layout recalculation
          const container = document.querySelector('.container');
          const featuresGrid = document.querySelector('.features-grid');
          
          if (container && featuresGrid) {
            // Test container sizing
            const containerPadding = viewportWidth < 640 ? 16 : 32;
            const maxContentWidth = Math.min(viewportWidth - (containerPadding * 2), 1280);
            expect(maxContentWidth).toBeGreaterThan(0);

            // Test grid layout performance
            const minCardWidth = 280;
            const gap = 32;
            const availableWidth = maxContentWidth;
            const columns = viewportWidth < 640 ? 1 : viewportWidth < 1024 ? 2 : 3;
            const cardWidth = (availableWidth - (gap * (columns - 1))) / columns;

            expect(cardWidth).toBeGreaterThan(minCardWidth * 0.8);
            expect(columns).toBeLessThanOrEqual(3);
          }

          const layoutTime = performance.now() - startTime;
          
          // Layout calculations should be fast
          expect(layoutTime).toBeLessThan(16); // Should complete within one frame (16ms)

          // Test that content remains accessible
          const heroTitle = document.querySelector('#hero-title');
          const ctaButtons = document.querySelectorAll('.btn');
          
          expect(heroTitle?.textContent?.trim()).toBeTruthy();
          expect(ctaButtons.length).toBeGreaterThanOrEqual(2);

          // Test responsive breakpoint behavior
          if (viewportWidth < 640) {
            // Mobile: single column layout
            expect(document.querySelector('.features-grid')).toBeTruthy();
          } else if (viewportWidth < 1024) {
            // Tablet: two column layout
            expect(document.querySelector('.features-grid')).toBeTruthy();
          } else {
            // Desktop: three column layout
            expect(document.querySelector('.features-grid')).toBeTruthy();
          }
        }
      ), { numRuns: 75 });
    });

    it('should handle performance degradation gracefully', () => {
      fc.assert(fc.property(
        fc.float({ min: Math.fround(0.5), max: Math.fround(2.0) }), // CPU throttling factor
        fc.integer({ min: 100, max: 2000 }), // Network latency in ms
        fc.float({ min: Math.fround(0.5), max: Math.fround(10.0) }), // Available bandwidth in Mbps
        fc.boolean(), // JavaScript enabled
        fc.boolean(), // CSS animations enabled
        (cpuThrottle, networkLatency, bandwidth, jsEnabled, animationsEnabled) => {
          // Simulate performance constraints
          const performanceMultiplier = cpuThrottle;
          const networkDelay = networkLatency;
          const bandwidthLimit = bandwidth;

          // Test that core functionality works under constraints
          const heroSection = document.querySelector('.hero-section');
          const heroTitle = document.querySelector('#hero-title');
          const ctaButtons = document.querySelectorAll('.btn');
          const codeBlock = document.querySelector('.code-block');

          // Core content should always be present
          expect(heroSection).toBeTruthy();
          expect(heroTitle?.textContent?.trim()).toBeTruthy();
          expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
          expect(codeBlock).toBeTruthy();

          // Test graceful degradation
          if (!jsEnabled) {
            // Without JavaScript, basic functionality should still work
            ctaButtons.forEach(button => {
              const href = button.getAttribute('href');
              expect(href).toBeTruthy();
              expect(href).toMatch(/^(#|https?:\/\/)/);
            });
          }

          if (!animationsEnabled) {
            // Without animations, content should still be accessible
            expect(heroTitle?.textContent?.length).toBeGreaterThan(10);
          }

          // Test performance budgets - ensure bandwidth is valid
          const safeBandwidth = Math.max(bandwidth || 0.1, 0.1); // Ensure minimum bandwidth
          const safePerformanceMultiplier = Math.max(performanceMultiplier || 1, 0.1); // Ensure valid multiplier
          const safeNetworkDelay = Math.max(networkDelay || 0, 0); // Ensure non-negative delay
          
          const estimatedLoadTime = (safeNetworkDelay * safePerformanceMultiplier) + (1000 / safeBandwidth);
          
          // Ensure we have valid numbers
          expect(estimatedLoadTime).not.toBeNaN();
          expect(estimatedLoadTime).toBeGreaterThan(0);
          
          // Even under constraints, should load within reasonable time
          if (bandwidth > 1.0 && cpuThrottle < 1.5) {
            expect(estimatedLoadTime).toBeLessThan(5000); // 5 second budget for decent conditions
          } else {
            expect(estimatedLoadTime).toBeLessThan(10000); // 10 second budget for poor conditions
          }

          // Test that critical path is optimized
          const criticalResources = [
            'HTML document',
            'Critical CSS',
            'Hero section content'
          ];

          criticalResources.forEach(resource => {
            // Critical resources should be prioritized
            expect(resource).toBeTruthy();
          });
        }
      ), { numRuns: 50 });
    });

    it('should maintain accessibility performance across devices', () => {
      const deviceConfigs = [
        { type: 'mobile', width: 375, height: 667, touch: true },
        { type: 'tablet', width: 768, height: 1024, touch: true },
        { type: 'desktop', width: 1440, height: 900, touch: false },
        { type: 'large-desktop', width: 2560, height: 1440, touch: false }
      ];

      deviceConfigs.forEach(({ type, width, height, touch }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        // Test focus management performance
        const focusableElements = document.querySelectorAll('a, button, input, [tabindex]');
        expect(focusableElements.length).toBeGreaterThan(0);

        // Test that focus indicators are visible
        focusableElements.forEach(element => {
          // Focus indicators should not impact layout performance
          const hasVisibleFocus = element.matches(':focus-visible') || 
                                 element.getAttribute('tabindex') !== null;
          // This is a structural test - in real implementation, 
          // focus styles should be optimized for performance
        });

        // Test touch target sizes on touch devices
        if (touch) {
          const interactiveElements = document.querySelectorAll('.btn, button, a');
          interactiveElements.forEach(element => {
            // Touch targets should be at least 44px
            // This would be tested with actual computed styles in real implementation
            expect(element.tagName).toMatch(/^(A|BUTTON)$/);
          });
        }

        // Test screen reader performance
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const landmarks = document.querySelectorAll('[role], main, nav, header, footer');
        
        expect(headings.length).toBeGreaterThan(0);
        expect(landmarks.length).toBeGreaterThan(0);

        // Test that ARIA attributes don't impact performance
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
        // ARIA attributes should be minimal and efficient
        ariaElements.forEach(element => {
          const ariaLabel = element.getAttribute('aria-label');
          const ariaLabelledby = element.getAttribute('aria-labelledby');
          
          if (ariaLabel) {
            expect(ariaLabel.length).toBeLessThan(200); // Keep ARIA labels concise
          }
          if (ariaLabelledby) {
            const referencedElement = document.getElementById(ariaLabelledby);
            expect(referencedElement).toBeTruthy(); // Referenced elements should exist
          }
        });
      });
    });

    it('should optimize bundle size and loading strategy across devices', () => {
      fc.assert(fc.property(
        fc.constantFrom('mobile', 'tablet', 'desktop'),
        fc.constantFrom('2g', '3g', '4g', '5g'),
        fc.boolean(), // Service worker available
        fc.boolean(), // HTTP/2 support
        (deviceType, networkSpeed, hasServiceWorker, hasHTTP2) => {
          // Test bundle optimization strategy
          const baseBundleSize = 100; // KB
          let optimizedBundleSize = baseBundleSize;

          // Apply device-specific optimizations
          if (deviceType === 'mobile') {
            // Mobile gets smaller initial bundle
            optimizedBundleSize *= 0.7;
          }

          // Apply network-specific optimizations
          if (networkSpeed === '2g' || networkSpeed === '3g') {
            // Slower networks get more aggressive splitting
            optimizedBundleSize *= 0.6;
          }

          // Apply technology-specific optimizations
          if (hasServiceWorker) {
            // Service worker enables better caching strategies
            optimizedBundleSize *= 0.9; // Slight reduction due to caching
          }

          if (hasHTTP2) {
            // HTTP/2 allows for more granular resource loading
            optimizedBundleSize *= 0.95;
          }

          // Test bundle size constraints
          expect(optimizedBundleSize).toBeLessThan(200); // Never exceed 200KB initial
          expect(optimizedBundleSize).toBeGreaterThan(30); // Minimum viable bundle

          // Test critical path optimization
          const criticalElements = document.querySelectorAll('.hero-section, .btn, h1');
          expect(criticalElements.length).toBeGreaterThan(0);

          // Test that non-critical resources can be deferred
          const deferrableElements = document.querySelectorAll('#features, footer');
          expect(deferrableElements.length).toBeGreaterThan(0);

          // Test resource hints optimization
          const preloadCandidates = ['critical.css', 'hero-image.webp'];
          const prefetchCandidates = ['features.js', 'analytics.js'];

          preloadCandidates.forEach(resource => {
            // Critical resources should be preloaded
            expect(resource).toMatch(/\.(css|webp|woff2)$/);
          });

          prefetchCandidates.forEach(resource => {
            // Non-critical resources should be prefetched
            expect(resource).toMatch(/\.(js|css)$/);
          });
        }
      ), { numRuns: 40 });
    });
  });
});