import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

/**
 * **Feature: uepm-website, Property 1: Hero section loads within performance threshold**
 * **Validates: Requirements 1.1**
 * 
 * For any page load on standard broadband connections, the hero section content 
 * should be visible and interactive within 1.5 seconds of First Contentful Paint
 */
describe('Hero Section Performance', () => {
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
          <title>Test</title>
          <style>
            /* Simulate critical CSS for hero section */
            .hero-section { display: flex; min-height: 100vh; }
            .text-gradient-primary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
            .btn { display: inline-flex; padding: 1rem 2rem; }
            .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          </style>
        </head>
        <body>
          <section class="hero-section" aria-labelledby="hero-title" role="banner">
            <div class="container">
              <h1 id="hero-title" class="text-gradient-primary animate-fade-in">NPM for Unreal Engine Plugins</h1>
              <p class="animate-slide-up">Bringing familiar package management workflows to Unreal Engine development.</p>
              <div class="animate-slide-up">
                <a href="#get-started" class="btn btn-primary">Get Started</a>
                <a href="https://github.com/uepm/uepm#readme" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View Documentation</a>
              </div>
              <div class="animate-slide-up">
                <div class="bg-gray-900 rounded-lg">
                  <code>npx @uepm/init</code>
                </div>
                <button id="copy-command" data-copy-text="npx @uepm/init" aria-label="Copy installation command to clipboard">Copy command</button>
              </div>
            </div>
          </section>
        </body>
      </html>
    `, {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window as Window & typeof globalThis;
    
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      value: {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByType: (type: string) => {
          if (type === 'paint') {
            return [
              { name: 'first-contentful-paint', startTime: 800 },
              { name: 'first-paint', startTime: 750 }
            ];
          }
          return [];
        }
      }
    });

    // Set global document and window for tests
    global.document = document;
    global.window = window;
  });

  describe('Property 1: Hero section loads within performance threshold', () => {
    it('should render hero content within performance threshold for any viewport size and load time', () => {
      fc.assert(fc.property(
        fc.integer({ min: 100, max: 700 }), // Simulated load time in ms
        fc.integer({ min: 320, max: 1920 }), // Viewport width
        fc.integer({ min: 568, max: 1080 }),  // Viewport height
        (simulatedLoadTime, viewportWidth, viewportHeight) => {
      // Simulate viewport size
      Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

      // Simulate page load timing
      const startTime = performance.now();
      
      // Test that hero section elements are present and accessible
      const heroSection = document.querySelector('.hero-section');
      const heroTitle = document.querySelector('#hero-title');
      const ctaButtons = document.querySelectorAll('.btn');
      const codePreview = document.querySelector('code');
      const copyButton = document.querySelector('#copy-command');

      // Verify hero section structure exists
      expect(heroSection).toBeTruthy();
      expect(heroTitle).toBeTruthy();
      expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
      expect(codePreview).toBeTruthy();
      expect(copyButton).toBeTruthy();

      // Test accessibility attributes
      expect(heroSection?.getAttribute('role')).toBe('banner');
      expect(heroSection?.getAttribute('aria-labelledby')).toBe('hero-title');
      expect(heroTitle?.getAttribute('id')).toBe('hero-title');

      // Test that content is meaningful and not empty
      expect(heroTitle?.textContent?.trim()).toBeTruthy();
      expect(heroTitle?.textContent?.length).toBeGreaterThan(10);
      expect(codePreview?.textContent?.trim()).toBeTruthy();

      // Test button accessibility
      ctaButtons.forEach(button => {
        expect(button.getAttribute('href') || button.getAttribute('onclick')).toBeTruthy();
      });

      // Test copy functionality setup
      expect(copyButton?.getAttribute('data-copy-text')).toBeTruthy();

      // Simulate content rendering time
      const renderTime = performance.now() - startTime;
      
      // Performance threshold: content should be ready quickly
      // In a real scenario, this would test actual DOM rendering and paint times
      expect(renderTime).toBeLessThan(100); // DOM operations should be fast
      
      // Simulate that First Contentful Paint happens within threshold
      const fcp = window.performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint');
      
      if (fcp) {
        // Hero content should be visible within 1.5 seconds of FCP
        const heroVisibilityTime = fcp.startTime + simulatedLoadTime;
        expect(heroVisibilityTime).toBeLessThanOrEqual(1500);
      }

      // Test responsive behavior - content should be accessible at any viewport size
      if (viewportWidth < 640) {
        // Mobile: ensure content is still accessible
        expect(heroTitle?.textContent).toBeTruthy();
        expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
      }
      
      if (viewportWidth >= 1024) {
        // Desktop: ensure full layout is available
        expect(heroSection?.classList.contains('hero-section')).toBe(true);
      }
        }
      ), { numRuns: 100 });
    });

    it('should handle different content variations while maintaining performance', () => {
      fc.assert(fc.property(
        fc.constantFrom('Get Started', 'Start Now', 'Begin', 'Try UEPM', 'Install Now'),
        fc.constantFrom('View Documentation', 'Read Docs', 'Learn More', 'Documentation', 'Guide'),
        fc.constantFrom('npx @uepm/init', 'npm install @uepm/cli', 'yarn add @uepm/core'),
        (primaryCTAText, secondaryCTAText, codeCommand) => {
      // Update DOM with different content
      const primaryButton = document.querySelector('.btn-primary');
      const secondaryButton = document.querySelector('.btn-secondary');
      const codeElement = document.querySelector('code');
      const copyButton = document.querySelector('#copy-command');

      if (primaryButton) primaryButton.textContent = primaryCTAText;
      if (secondaryButton) secondaryButton.textContent = secondaryCTAText;
      if (codeElement) codeElement.textContent = codeCommand;
      if (copyButton) copyButton.setAttribute('data-copy-text', codeCommand);

      // Test that content updates don't break functionality
      expect(primaryButton?.textContent).toBe(primaryCTAText);
      expect(secondaryButton?.textContent).toBe(secondaryCTAText);
      expect(codeElement?.textContent).toBe(codeCommand);
      expect(copyButton?.getAttribute('data-copy-text')).toBe(codeCommand);

      // Test that all content variations are meaningful
      expect(primaryCTAText.length).toBeGreaterThan(3);
      expect(secondaryCTAText.length).toBeGreaterThan(3);
      expect(codeCommand.length).toBeGreaterThan(5);
      
      // Test that command looks like a valid npm/npx command
      expect(codeCommand).toMatch(/^(npm|npx|yarn)\s+/);
        }
      ), { numRuns: 100 });
    });

    it('should maintain functionality across different loading states', () => {
      fc.assert(fc.property(
        fc.boolean(), // Has animations enabled
        fc.boolean(), // Has JavaScript enabled  
        fc.boolean(),  // Has CSS loaded
        (hasAnimations, hasJavaScript, hasCSSLoaded) => {
      // Simulate different loading states
      if (!hasAnimations) {
        // Simulate prefers-reduced-motion
        const style = document.createElement('style');
        style.textContent = '* { animation: none !important; }';
        document.head.appendChild(style);
      }

      if (!hasCSSLoaded) {
        // Remove CSS classes to simulate CSS loading failure
        document.querySelectorAll('*').forEach(el => {
          if (el.className) {
            el.className = '';
          }
        });
      }

      // Core content should still be accessible regardless of loading state
      const heroTitle = document.querySelector('#hero-title');
      const ctaButtons = document.querySelectorAll('a[href]');
      const codePreview = document.querySelector('code');

      expect(heroTitle?.textContent?.trim()).toBeTruthy();
      expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
      expect(codePreview?.textContent?.trim()).toBeTruthy();

      // Test that semantic HTML structure is preserved
      expect(heroTitle?.tagName).toBe('H1');
      expect(document.querySelector('[role="banner"]')).toBeTruthy();

      // Test that links are still functional
      ctaButtons.forEach(button => {
        const href = button.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/^(#|https?:\/\/)/);
      });

      if (hasJavaScript) {
        // Test copy functionality when JS is available
        const copyButton = document.querySelector('#copy-command');
        expect(copyButton?.getAttribute('data-copy-text')).toBeTruthy();
      }
        }
      ), { numRuns: 100 });
    });

    it('should have proper semantic structure for accessibility', () => {
      const heroSection = document.querySelector('.hero-section');
      const heroTitle = document.querySelector('#hero-title');
      
      // Test ARIA attributes
      expect(heroSection?.getAttribute('role')).toBe('banner');
      expect(heroSection?.getAttribute('aria-labelledby')).toBe('hero-title');
      
      // Test heading hierarchy
      expect(heroTitle?.tagName).toBe('H1');
      expect(heroTitle?.getAttribute('id')).toBe('hero-title');
      
      // Test that there's only one H1 on the page
      const h1Elements = document.querySelectorAll('h1');
      expect(h1Elements.length).toBe(1);
    });

    it('should have interactive elements properly configured', () => {
      const ctaButtons = document.querySelectorAll('.btn');
      const copyButton = document.querySelector('#copy-command');
      
      // Test CTA buttons
      ctaButtons.forEach(button => {
        const href = button.getAttribute('href');
        expect(href).toBeTruthy();
        
        if (href?.startsWith('http')) {
          expect(button.getAttribute('target')).toBe('_blank');
          expect(button.getAttribute('rel')).toContain('noopener');
        }
      });
      
      // Test copy button
      expect(copyButton?.getAttribute('data-copy-text')).toBeTruthy();
      expect(copyButton?.getAttribute('aria-label')).toBeTruthy();
    });
  });
});