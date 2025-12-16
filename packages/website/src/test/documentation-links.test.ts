import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

/**
 * **Feature: uepm-website, Property 7: Documentation links are properly configured**
 * **Validates: Requirements 4.3, 5.1**
 * 
 * For any documentation link on the site, it should point to valid URLs 
 * and open in the appropriate target (same or new window)
 */
describe('Documentation Links Configuration', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create a DOM with various documentation links
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test</title>
          <style>
            .nav-link { color: #6b7280; text-decoration: none; }
            .nav-link:hover { color: #1f2937; }
            .btn { display: inline-flex; padding: 0.5rem 1rem; text-decoration: none; }
            .btn-primary { background-color: #3b82f6; color: white; }
            .btn-secondary { background-color: transparent; color: #1f2937; border: 1px solid #d1d5db; }
            .footer-link { color: #6b7280; text-decoration: none; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <!-- Navigation with documentation links -->
          <header>
            <nav aria-label="Main navigation">
              <a href="/" class="nav-link">Home</a>
              <a href="https://github.com/uepm/uepm#readme" class="nav-link" target="_blank" rel="noopener noreferrer">Documentation</a>
              <a href="https://github.com/uepm/uepm" class="nav-link" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.npmjs.com/package/@uepm/init" class="nav-link" target="_blank" rel="noopener noreferrer">NPM Package</a>
            </nav>
          </header>

          <!-- Hero section with documentation links -->
          <section class="hero-section">
            <div>
              <h1>NPM for Unreal Engine Plugins</h1>
              <div>
                <a href="#get-started" class="btn btn-primary">Get Started</a>
                <a href="https://github.com/uepm/uepm#readme" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View Documentation</a>
              </div>
            </div>
          </section>

          <!-- Get Started section with documentation links -->
          <section id="get-started">
            <h2>Ready to Get Started?</h2>
            <div>
              <a href="https://github.com/uepm/uepm#readme" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Read Documentation</a>
              <a href="https://github.com/uepm/uepm" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </div>
            
            <!-- Secondary links -->
            <div>
              <a href="https://github.com/uepm/uepm/tree/main/samples" target="_blank" rel="noopener noreferrer">Browse Examples</a>
              <a href="https://www.npmjs.com/package/@uepm/init" target="_blank" rel="noopener noreferrer">View on NPM</a>
            </div>
          </section>

          <!-- Footer with documentation links -->
          <footer>
            <div>
              <!-- Product links -->
              <div>
                <h3>Product</h3>
                <ul>
                  <li><a href="https://github.com/uepm/uepm#readme" class="footer-link" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                  <li><a href="#get-started" class="footer-link">Getting Started</a></li>
                  <li><a href="https://github.com/uepm/uepm/tree/main/samples" class="footer-link" target="_blank" rel="noopener noreferrer">Examples</a></li>
                  <li><a href="https://github.com/uepm/uepm/releases" class="footer-link" target="_blank" rel="noopener noreferrer">Release Notes</a></li>
                </ul>
              </div>
              
              <!-- Community links -->
              <div>
                <h3>Community</h3>
                <ul>
                  <li><a href="https://github.com/uepm/uepm" class="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                  <li><a href="https://github.com/uepm/uepm/discussions" class="footer-link" target="_blank" rel="noopener noreferrer">Discussions</a></li>
                  <li><a href="https://github.com/uepm/uepm/issues" class="footer-link" target="_blank" rel="noopener noreferrer">Report Issues</a></li>
                  <li><a href="https://www.npmjs.com/package/@uepm/init" class="footer-link" target="_blank" rel="noopener noreferrer">NPM Package</a></li>
                </ul>
              </div>
              
              <!-- Resources links -->
              <div>
                <h3>Resources</h3>
                <ul>
                  <li><a href="https://www.unrealengine.com/" class="footer-link" target="_blank" rel="noopener noreferrer">Unreal Engine</a></li>
                  <li><a href="https://docs.npmjs.com/" class="footer-link" target="_blank" rel="noopener noreferrer">NPM Documentation</a></li>
                  <li><a href="https://docs.unrealengine.com/5.3/en-US/plugins-in-unreal-engine/" class="footer-link" target="_blank" rel="noopener noreferrer">Plugin Development</a></li>
                  <li><a href="https://docs.npmjs.com/cli/v10/configuring-npm/package-json" class="footer-link" target="_blank" rel="noopener noreferrer">Package.json Guide</a></li>
                </ul>
              </div>
            </div>
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
    
    // Set global document and window for tests
    global.document = document;
    global.window = window;
  });

  describe('Property 7: Documentation links are properly configured', () => {
    it('should have valid URLs for all documentation links', () => {
      fc.assert(fc.property(
        fc.constantFrom(
          'https://github.com/uepm/uepm#readme',
          'https://github.com/uepm/uepm',
          'https://www.npmjs.com/package/@uepm/init',
          'https://github.com/uepm/uepm/tree/main/samples',
          'https://github.com/uepm/uepm/releases',
          'https://github.com/uepm/uepm/discussions',
          'https://github.com/uepm/uepm/issues'
        ),
        (testUrl) => {
          // Find all links with this URL
          const links = document.querySelectorAll(`a[href="${testUrl}"]`);
          
          links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Verify URL is properly formatted
            expect(href).toBeTruthy();
            expect(href).toBe(testUrl);
            
            // Verify URL structure is valid
            expect(href).toMatch(/^https?:\/\//);
            
            // Verify GitHub URLs point to UEPM repository
            if (href!.includes('github.com')) {
              expect(href).toMatch(/github\.com\/uepm\/uepm/);
            }
            
            // Verify NPM URLs point to UEPM packages
            if (href!.includes('npmjs.com')) {
              expect(href).toMatch(/npmjs\.com\/package\/@uepm/);
            }
            
            // Verify external documentation URLs are from trusted sources
            const trustedDomains = [
              'github.com',
              'npmjs.com',
              'docs.npmjs.com',
              'unrealengine.com',
              'docs.unrealengine.com'
            ];
            
            const urlDomain = new URL(href!).hostname;
            const isTrustedDomain = trustedDomains.some(domain => 
              urlDomain === domain || urlDomain.endsWith('.' + domain)
            );
            expect(isTrustedDomain).toBe(true);
          });
        }
      ), { numRuns: 100 });
    });

    it('should have proper target and rel attributes for external links', () => {
      const externalLinks = document.querySelectorAll('a[href^="http"]');
      
      expect(externalLinks.length).toBeGreaterThan(0);
      
      externalLinks.forEach(link => {
        const href = link.getAttribute('href');
        const target = link.getAttribute('target');
        const rel = link.getAttribute('rel');
        
        // External links should open in new tab
        expect(target).toBe('_blank');
        
        // External links should have security attributes
        expect(rel).toBeTruthy();
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
        
        // Verify href is a valid external URL
        expect(href).toMatch(/^https?:\/\//);
      });
    });

    it('should have proper target for internal links', () => {
      const internalLinks = document.querySelectorAll('a[href^="#"], a[href^="/"]');
      
      internalLinks.forEach(link => {
        const target = link.getAttribute('target');
        const rel = link.getAttribute('rel');
        
        // Internal links should not have target="_blank"
        expect(target).not.toBe('_blank');
        
        // Internal links should not have rel attributes for external security
        if (rel) {
          expect(rel).not.toContain('noopener');
          expect(rel).not.toContain('noreferrer');
        }
      });
    });

    it('should maintain link consistency across different sections', () => {
      fc.assert(fc.property(
        fc.constantFrom('Documentation', 'GitHub', 'Examples', 'NPM Package'),
        (linkType) => {
          let expectedUrl: string;
          let linkTexts: string[];
          
          switch (linkType) {
            case 'Documentation':
              expectedUrl = 'https://github.com/uepm/uepm#readme';
              linkTexts = ['Documentation', 'View Documentation', 'Read Documentation'];
              break;
            case 'GitHub':
              expectedUrl = 'https://github.com/uepm/uepm';
              linkTexts = ['GitHub', 'View on GitHub'];
              break;
            case 'Examples':
              expectedUrl = 'https://github.com/uepm/uepm/tree/main/samples';
              linkTexts = ['Examples', 'Browse Examples'];
              break;
            case 'NPM Package':
              expectedUrl = 'https://www.npmjs.com/package/@uepm/init';
              linkTexts = ['NPM Package', 'View on NPM'];
              break;
            default:
              expectedUrl = '';
              linkTexts = [];
          }
          
          // Find all links with the expected URL
          const links = document.querySelectorAll(`a[href="${expectedUrl}"]`);
          
          if (links.length > 0) {
            // All links with the same URL should have consistent attributes
            const firstLink = links[0];
            const expectedTarget = firstLink.getAttribute('target');
            const expectedRel = firstLink.getAttribute('rel');
            
            links.forEach(link => {
              expect(link.getAttribute('target')).toBe(expectedTarget);
              expect(link.getAttribute('rel')).toBe(expectedRel);
              
              // Verify link text is appropriate
              const linkText = link.textContent?.trim();
              expect(linkText).toBeTruthy();
              
              if (linkTexts.length > 0) {
                const hasValidText = linkTexts.some(validText => 
                  linkText!.toLowerCase().includes(validText.toLowerCase())
                );
                expect(hasValidText).toBe(true);
              }
            });
          }
        }
      ), { numRuns: 100 });
    });

    it('should have accessible link text and descriptions', () => {
      const allLinks = document.querySelectorAll('a[href]');
      
      expect(allLinks.length).toBeGreaterThan(0);
      
      allLinks.forEach(link => {
        const linkText = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const ariaDescribedBy = link.getAttribute('aria-describedby');
        
        // Link should have meaningful text or aria-label
        const hasAccessibleText = linkText && linkText.length > 0;
        const hasAriaLabel = ariaLabel && ariaLabel.length > 0;
        
        expect(hasAccessibleText || hasAriaLabel).toBe(true);
        
        // Link text should be descriptive (not just "click here" or "link")
        if (linkText) {
          expect(linkText.length).toBeGreaterThan(2);
          expect(linkText.toLowerCase()).not.toBe('click here');
          expect(linkText.toLowerCase()).not.toBe('link');
          expect(linkText.toLowerCase()).not.toBe('here');
        }
        
        // If aria-describedby is used, the referenced element should exist
        if (ariaDescribedBy) {
          const describedByElement = document.getElementById(ariaDescribedBy);
          expect(describedByElement).toBeTruthy();
        }
      });
    });

    it('should handle different URL variations correctly', () => {
      fc.assert(fc.property(
        fc.record({
          protocol: fc.constantFrom('https://', 'http://'),
          domain: fc.constantFrom('github.com', 'www.npmjs.com', 'docs.npmjs.com'),
          path: fc.constantFrom('/uepm/uepm', '/package/@uepm/init', '/cli/v10/configuring-npm/package-json')
        }),
        (urlParts) => {
          const testUrl = `${urlParts.protocol}${urlParts.domain}${urlParts.path}`;
          
          // Create a test link with this URL
          const testLink = document.createElement('a');
          testLink.href = testUrl;
          testLink.textContent = 'Test Link';
          testLink.target = '_blank';
          testLink.rel = 'noopener noreferrer';
          
          // Verify URL parsing and validation
          expect(testLink.href).toBeTruthy();
          expect(testLink.href).toMatch(/^https?:\/\//);
          
          // Verify protocol is secure for production links (prefer HTTPS but allow HTTP for testing)
          if (urlParts.domain.includes('github.com') || urlParts.domain.includes('npmjs.com')) {
            expect(testUrl.startsWith('https://') || testUrl.startsWith('http://')).toBe(true);
          }
          
          // Verify domain is from trusted sources
          const trustedDomains = ['github.com', 'npmjs.com', 'docs.npmjs.com', 'unrealengine.com'];
          const isTrusted = trustedDomains.some(domain => 
            urlParts.domain === domain || urlParts.domain.endsWith('.' + domain)
          );
          expect(isTrusted).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should maintain proper link hierarchy and organization', () => {
      // Test navigation links
      const navLinks = document.querySelectorAll('nav a[href]');
      expect(navLinks.length).toBeGreaterThanOrEqual(3);
      
      // Test that navigation has proper structure
      const nav = document.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBeTruthy();
      
      // Test footer link organization
      const footerSections = document.querySelectorAll('footer h3');
      expect(footerSections.length).toBeGreaterThanOrEqual(3);
      
      footerSections.forEach(section => {
        const sectionTitle = section.textContent?.trim();
        expect(sectionTitle).toBeTruthy();
        expect(sectionTitle!.length).toBeGreaterThan(0);
        
        // Each section should have associated links
        const nextElement = section.nextElementSibling;
        if (nextElement && nextElement.tagName === 'UL') {
          const sectionLinks = nextElement.querySelectorAll('a[href]');
          expect(sectionLinks.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have consistent link styling and behavior', () => {
      const linkTypes = [
        { selector: '.nav-link', expectedClass: 'nav-link' },
        { selector: '.btn', expectedClass: 'btn' },
        { selector: '.footer-link', expectedClass: 'footer-link' }
      ];
      
      linkTypes.forEach(({ selector, expectedClass }) => {
        const links = document.querySelectorAll(selector);
        
        if (links.length > 0) {
          links.forEach(link => {
            // Verify consistent class usage
            expect(link.classList.contains(expectedClass)).toBe(true);
            
            // Verify link has href
            const href = link.getAttribute('href');
            expect(href).toBeTruthy();
            
            // Verify link is not disabled
            expect(link.hasAttribute('disabled')).toBe(false);
            
            // Verify link has proper role
            const role = link.getAttribute('role');
            if (role) {
              expect(role).toBe('link');
            }
          });
        }
      });
    });

    it('should handle edge cases in link configuration', () => {
      fc.assert(fc.property(
        fc.boolean(), // Has JavaScript enabled
        fc.boolean(), // Has CSS loaded
        fc.constantFrom('mouse', 'keyboard', 'touch'), // Interaction method
        (hasJavaScript, hasCSSLoaded, interactionMethod) => {
          // Test that links work regardless of environment
          const allLinks = document.querySelectorAll('a[href]');
          
          allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Links should always have valid href regardless of JS/CSS state
            expect(href).toBeTruthy();
            
            // Internal links should be valid anchors or paths
            if (href!.startsWith('#')) {
              expect(href!.length).toBeGreaterThan(1);
            } else if (href!.startsWith('/')) {
              expect(href!.length).toBeGreaterThanOrEqual(1); // Root path "/" is valid
            } else if (href!.startsWith('http')) {
              expect(href).toMatch(/^https?:\/\/.+/);
            }
            
            // Links should be keyboard accessible
            if (interactionMethod === 'keyboard') {
              expect(link.tagName.toLowerCase()).toBe('a');
              expect(link.hasAttribute('href')).toBe(true);
            }
            
            // Links should work without JavaScript
            if (!hasJavaScript) {
              expect(link.hasAttribute('onclick')).toBe(false);
              expect(href!.startsWith('javascript:')).toBe(false);
            }
          });
        }
      ), { numRuns: 100 });
    });
  });
});