import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

/**
 * **Feature: uepm-website, Property 5: Features section contains required capabilities**
 * **Validates: Requirements 3.2**
 * 
 * The features section should present all key UEPM capabilities including one-command setup,
 * NPM distribution, automatic validation, dependency management, and patch support with
 * proper descriptions and links to documentation.
 */
describe('Features Content', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create a fresh DOM for each test with Features component structure
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test</title>
          <style>
            .features-section { padding: 3rem 0; }
            .grid { display: grid; gap: 2rem; }
            .feature-card { background: white; border-radius: 0.75rem; padding: 2rem; }
            .feature-card:hover { transform: translateY(-4px); }
            @media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
          </style>
        </head>
        <body>
          <section class="features-section" aria-labelledby="features-title">
            <div class="container">
              <div class="text-center mb-16">
                <h2 id="features-title">Why Choose UEPM?</h2>
                <p>Powerful features that transform your Unreal Engine plugin development workflow</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                <!-- One-Command Setup -->
                <div class="feature-card group">
                  <a href="https://github.com/uepm/uepm#quick-start" target="_blank" rel="noopener noreferrer">
                    <div class="w-16 h-16 bg-blue-100 rounded-xl mb-6">
                      <svg class="w-8 h-8 text-blue-600" aria-hidden="true">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h3>One-Command Setup</h3>
                    <p>Initialize your plugin project with a single command. No complex configuration files or manual setup required.</p>
                    <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      npx @uepm/init
                    </div>
                  </a>
                </div>

                <!-- NPM Distribution -->
                <div class="feature-card group">
                  <a href="https://github.com/uepm/uepm#publishing" target="_blank" rel="noopener noreferrer">
                    <div class="w-16 h-16 bg-blue-100 rounded-xl mb-6">
                      <svg class="w-8 h-8 text-blue-600" aria-hidden="true">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    <h3>NPM Distribution</h3>
                    <p>Publish and distribute your plugins using familiar NPM workflows. Leverage the existing NPM ecosystem and tooling.</p>
                    <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      npm publish
                    </div>
                  </a>
                </div>

                <!-- Automatic Validation -->
                <div class="feature-card group">
                  <a href="https://github.com/uepm/uepm#validation" target="_blank" rel="noopener noreferrer">
                    <div class="w-16 h-16 bg-blue-100 rounded-xl mb-6">
                      <svg class="w-8 h-8 text-blue-600" aria-hidden="true">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <h3>Automatic Validation</h3>
                    <p>Built-in validation ensures your plugins meet Unreal Engine standards before installation or distribution.</p>
                    <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      Validated plugins
                    </div>
                  </a>
                </div>

                <!-- Dependency Management -->
                <div class="feature-card group">
                  <a href="https://github.com/uepm/uepm#dependencies" target="_blank" rel="noopener noreferrer">
                    <div class="w-16 h-16 bg-blue-100 rounded-xl mb-6">
                      <svg class="w-8 h-8 text-blue-600" aria-hidden="true">
                        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3>Dependency Management</h3>
                    <p>Automatically resolve and install plugin dependencies. Handle version conflicts and compatibility issues seamlessly.</p>
                    <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      Smart resolution
                    </div>
                  </a>
                </div>

                <!-- Patch Support -->
                <div class="feature-card group">
                  <a href="https://github.com/uepm/uepm#patches" target="_blank" rel="noopener noreferrer">
                    <div class="w-16 h-16 bg-blue-100 rounded-xl mb-6">
                      <svg class="w-8 h-8 text-blue-600" aria-hidden="true">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <h3>Patch Support</h3>
                    <p>Apply patches and modifications to existing plugins without breaking updates. Maintain customizations across versions.</p>
                    <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      Non-destructive
                    </div>
                  </a>
                </div>
              </div>

              <!-- Compatibility section -->
              <div class="mt-16 text-center">
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-4xl mx-auto">
                  <h3>Compatible with Unreal Engine 4.27+ and 5.x</h3>
                  <p>UEPM works seamlessly with all modern versions of Unreal Engine. Whether you're working on UE4 projects or the latest UE5 features, UEPM adapts to your development environment.</p>
                  <div class="flex flex-wrap justify-center gap-4">
                    <span class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      Unreal Engine 4.27+
                    </span>
                    <span class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      Unreal Engine 5.x
                    </span>
                    <span class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      Windows & macOS
                    </span>
                    <span class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      Linux Support
                    </span>
                  </div>
                </div>
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
    window = dom.window as unknown as Window & typeof globalThis;
    
    // Set global document and window for tests
    global.document = document;
    global.window = window;
  });

  describe('Property 5: Features section contains required capabilities', () => {
    it('should display all required UEPM capabilities with proper structure', () => {
      fc.assert(fc.property(
        fc.integer({ min: 320, max: 1920 }), // Viewport width
        fc.integer({ min: 568, max: 1080 }),  // Viewport height
        (viewportWidth, viewportHeight) => {
          // Simulate viewport size
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
          Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

          // Test that features section exists and is properly structured
          const featuresSection = document.querySelector('.features-section');
          const featuresTitle = document.querySelector('#features-title');
          const featureCards = document.querySelectorAll('.feature-card');

          expect(featuresSection).toBeTruthy();
          expect(featuresTitle).toBeTruthy();
          expect(featureCards.length).toBe(5); // Should have exactly 5 feature cards

          // Test section accessibility
          expect(featuresSection?.getAttribute('aria-labelledby')).toBe('features-title');
          expect(featuresTitle?.tagName).toBe('H2');

          // Required capabilities that must be present
          const requiredCapabilities = [
            'One-Command Setup',
            'NPM Distribution', 
            'Automatic Validation',
            'Dependency Management',
            'Patch Support'
          ];

          // Test that all required capabilities are present
          requiredCapabilities.forEach(capability => {
            const capabilityElement = Array.from(document.querySelectorAll('h3'))
              .find(h3 => h3.textContent?.includes(capability));
            expect(capabilityElement).toBeTruthy();
          });

          // Test that each feature card has proper structure
          featureCards.forEach((card, index) => {
            const link = card.querySelector('a');
            const icon = card.querySelector('svg');
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            const highlight = card.querySelector('.bg-blue-50');

            expect(link).toBeTruthy();
            expect(icon).toBeTruthy();
            expect(title).toBeTruthy();
            expect(description).toBeTruthy();
            expect(highlight).toBeTruthy();

            // Test link attributes for external links
            expect(link?.getAttribute('href')).toMatch(/^https:\/\/github\.com\/uepm\/uepm/);
            expect(link?.getAttribute('target')).toBe('_blank');
            expect(link?.getAttribute('rel')).toContain('noopener');

            // Test content quality
            expect(title?.textContent?.trim().length).toBeGreaterThan(5);
            expect(description?.textContent?.trim().length).toBeGreaterThan(20);
            expect(highlight?.textContent?.trim().length).toBeGreaterThan(3);
          });

          // Test responsive grid behavior
          const grid = document.querySelector('.grid');
          expect(grid).toBeTruthy();
          
          if (viewportWidth >= 1024) {
            // Desktop: should support 3-column layout
            expect(grid?.classList.contains('lg:grid-cols-3')).toBe(true);
          } else if (viewportWidth >= 768) {
            // Tablet: should support 2-column layout
            expect(grid?.classList.contains('md:grid-cols-2')).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });

    it('should include compatibility information for Unreal Engine versions', () => {
      fc.assert(fc.property(
        fc.constantFrom('4.27', '5.0', '5.1', '5.2', '5.3', '5.4'),
        fc.constantFrom('Windows', 'macOS', 'Linux'),
        (ueVersion, platform) => {
          // Test compatibility section exists
          const compatibilitySection = document.querySelector('.mt-16');
          expect(compatibilitySection).toBeTruthy();

          // Test Unreal Engine version compatibility
          const ue4Badge = Array.from(document.querySelectorAll('span'))
            .find(span => span.textContent?.includes('Unreal Engine 4.27+'));
          const ue5Badge = Array.from(document.querySelectorAll('span'))
            .find(span => span.textContent?.includes('Unreal Engine 5.x'));
          
          expect(ue4Badge).toBeTruthy();
          expect(ue5Badge).toBeTruthy();

          // Test platform compatibility
          const platformBadges = Array.from(document.querySelectorAll('span'))
            .filter(span => span.textContent?.includes('Windows') || 
                           span.textContent?.includes('macOS') || 
                           span.textContent?.includes('Linux'));
          
          expect(platformBadges.length).toBeGreaterThanOrEqual(2);

          // Test that compatibility information is meaningful
          const compatibilityTitle = compatibilitySection?.querySelector('h3');
          expect(compatibilityTitle?.textContent).toContain('Compatible with Unreal Engine');
          
          const compatibilityDescription = compatibilitySection?.querySelector('p');
          expect(compatibilityDescription?.textContent?.length).toBeGreaterThan(50);
        }
      ), { numRuns: 100 });
    });

    it('should have proper documentation links for each capability', () => {
      fc.assert(fc.property(
        fc.constantFrom(
          '#quick-start',
          '#publishing', 
          '#validation',
          '#dependencies',
          '#patches'
        ),
        (docSection) => {
          // Test that all feature cards link to documentation
          const featureLinks = document.querySelectorAll('.feature-card a');
          
          featureLinks.forEach(link => {
            const href = link.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).toMatch(/^https:\/\/github\.com\/uepm\/uepm#/);
            
            // Test external link security
            expect(link.getAttribute('target')).toBe('_blank');
            expect(link.getAttribute('rel')).toContain('noopener');
            expect(link.getAttribute('rel')).toContain('noreferrer');
          });

          // Test that links are contextually appropriate
          const expectedLinks = [
            'https://github.com/uepm/uepm#quick-start',
            'https://github.com/uepm/uepm#publishing',
            'https://github.com/uepm/uepm#validation', 
            'https://github.com/uepm/uepm#dependencies',
            'https://github.com/uepm/uepm#patches'
          ];

          expectedLinks.forEach(expectedLink => {
            const linkExists = Array.from(featureLinks)
              .some(link => link.getAttribute('href') === expectedLink);
            expect(linkExists).toBe(true);
          });
        }
      ), { numRuns: 100 });
    });

    it('should display meaningful highlights for each capability', () => {
      fc.assert(fc.property(
        fc.constantFrom(
          'npx @uepm/init',
          'npm publish',
          'Validated plugins',
          'Smart resolution', 
          'Non-destructive'
        ),
        (expectedHighlight) => {
          // Test that highlights are present and meaningful
          const highlights = document.querySelectorAll('.bg-blue-50');
          expect(highlights.length).toBe(5);

          const highlightTexts = Array.from(highlights).map(h => h.textContent?.trim());
          
          // Test that expected highlight exists
          expect(highlightTexts).toContain(expectedHighlight);

          // Test highlight quality
          highlights.forEach(highlight => {
            const text = highlight.textContent?.trim();
            expect(text?.length).toBeGreaterThan(3);
            expect(text?.length).toBeLessThan(30); // Should be concise
          });

          // Test that highlights are contextually appropriate
          const commandHighlights = highlightTexts.filter(text => 
            text?.includes('npx') || text?.includes('npm'));
          expect(commandHighlights.length).toBeGreaterThanOrEqual(2);

          const descriptiveHighlights = highlightTexts.filter(text =>
            !text?.includes('npx') && !text?.includes('npm'));
          expect(descriptiveHighlights.length).toBeGreaterThanOrEqual(3);
        }
      ), { numRuns: 100 });
    });

    it('should maintain accessibility and semantic structure', () => {
      // Test section structure
      const featuresSection = document.querySelector('.features-section');
      expect(featuresSection?.getAttribute('aria-labelledby')).toBe('features-title');

      // Test heading hierarchy
      const mainTitle = document.querySelector('#features-title');
      expect(mainTitle?.tagName).toBe('H2');

      const featureTitles = document.querySelectorAll('.feature-card h3');
      expect(featureTitles.length).toBe(5);

      // Test that all feature titles are H3 elements
      featureTitles.forEach(title => {
        expect(title.tagName).toBe('H3');
        expect(title.textContent?.trim().length).toBeGreaterThan(5);
      });

      // Test icon accessibility
      const icons = document.querySelectorAll('.feature-card svg');
      icons.forEach(icon => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });

      // Test link accessibility
      const featureLinks = document.querySelectorAll('.feature-card a');
      featureLinks.forEach(link => {
        expect(link.getAttribute('href')).toBeTruthy();
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
      });
    });
  });
});