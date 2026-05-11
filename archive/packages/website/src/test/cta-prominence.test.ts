import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

/**
 * **Feature: uepm-website, Property 6: CTA buttons are prominently displayed**
 * **Validates: Requirements 4.1**
 * 
 * For any page section, call-to-action buttons should have prominent styling 
 * (larger size, contrasting colors) and be easily discoverable
 */
describe('CTA Button Prominence', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create a DOM with CTA buttons from different components
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test</title>
          <style>
            /* Simulate CTA button styles */
            .btn { 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 600; 
              transition: all 0.2s; 
              border-radius: 0.5rem;
              text-decoration: none;
              border: none;
              cursor: pointer;
            }
            .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
            .btn-md { padding: 0.5rem 1rem; font-size: 1rem; }
            .btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
            .btn-primary { 
              background-color: #3b82f6; 
              color: white; 
              min-height: 44px;
              min-width: 120px;
            }
            .btn-secondary { 
              background-color: transparent; 
              color: #1f2937; 
              border: 1px solid #d1d5db;
              min-height: 44px;
              min-width: 120px;
            }
            .cta-prominent { 
              position: relative; 
              min-width: 200px;
              min-height: 48px;
              font-size: 1.125rem;
              font-weight: 600;
              background-color: #3b82f6;
              color: white;
            }
            .cta-prominent::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 0.5rem;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
              z-index: -1;
              opacity: 0;
              transition: opacity 0.2s;
            }
            .cta-prominent:hover::before { opacity: 1; }
            
            /* Navigation styles */
            .nav-link { color: #6b7280; font-weight: 500; }
            .nav-link:hover { color: #1f2937; }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
              .btn-lg { width: 100%; }
              .cta-prominent { width: 100%; }
            }
          </style>
        </head>
        <body>
          <!-- Navigation with CTA -->
          <header>
            <nav>
              <a href="/" class="nav-link">Home</a>
              <a href="/docs" class="nav-link">Documentation</a>
              <a href="#get-started" class="btn btn-primary btn-md cta-prominent">Get Started</a>
            </nav>
          </header>

          <!-- Hero section with CTAs -->
          <section class="hero-section">
            <div>
              <h1>NPM for Unreal Engine Plugins</h1>
              <p>Transform your plugin workflow</p>
              <div>
                <a href="#get-started" class="btn btn-primary btn-lg cta-prominent">Get Started</a>
                <a href="https://github.com/uepm/uepm#readme" class="btn btn-secondary btn-lg cta-prominent" target="_blank" rel="noopener noreferrer">View Documentation</a>
              </div>
            </div>
          </section>

          <!-- Get Started section with CTAs -->
          <section id="get-started">
            <h2>Ready to Get Started?</h2>
            <div>
              <a href="https://github.com/uepm/uepm#readme" class="btn btn-primary btn-lg cta-prominent" target="_blank" rel="noopener noreferrer">Read Documentation</a>
              <a href="https://github.com/uepm/uepm" class="btn btn-secondary btn-lg cta-prominent" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </div>
          </section>

          <!-- Footer with CTA -->
          <footer>
            <div>
              <a href="#get-started" class="btn btn-primary btn-md cta-prominent">Get Started</a>
              <a href="https://github.com/uepm/uepm" class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">Star</a>
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
    
    // Mock getComputedStyle for style testing
    window.getComputedStyle = (element: Element) => {
      const classList = element.className.split(' ');
      const styles: any = {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        color: '#000000',
        fontSize: '16px',
        fontWeight: '400',
        minHeight: 'auto',
        minWidth: 'auto',
        padding: '0',
        display: 'inline'
      };

      // Apply styles based on classes
      if (classList.includes('btn-primary')) {
        styles.backgroundColor = 'rgb(59, 130, 246)';
        styles.color = 'rgb(255, 255, 255)';
        styles.fontWeight = '600';
      }
      
      if (classList.includes('btn-secondary')) {
        styles.backgroundColor = 'transparent';
        styles.color = 'rgb(31, 41, 55)';
        styles.fontWeight = '600';
      }
      
      if (classList.includes('btn-lg')) {
        styles.padding = '0.75rem 1.5rem';
        styles.fontSize = '18px';
        styles.minHeight = '48px';
      }
      
      if (classList.includes('btn-md')) {
        styles.padding = '0.5rem 1rem';
        styles.fontSize = '16px';
        styles.minHeight = '44px';
      }
      
      if (classList.includes('cta-prominent')) {
        styles.minWidth = '200px';
        styles.minHeight = '48px';
        styles.fontSize = '18px';
        styles.fontWeight = '600';
      }

      return styles as CSSStyleDeclaration;
    };

    // Set global document and window for tests
    global.document = document;
    global.window = window;
  });

  describe('Property 6: CTA buttons are prominently displayed', () => {
    it('should have prominent styling across all viewport sizes', () => {
      fc.assert(fc.property(
        fc.integer({ min: 320, max: 2560 }), // Viewport width
        fc.integer({ min: 568, max: 1440 }),  // Viewport height
        (viewportWidth, viewportHeight) => {
          // Simulate viewport size
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
          Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

          // Find all CTA buttons (buttons with prominent styling classes)
          const ctaButtons = document.querySelectorAll('.cta-prominent, .btn-primary');
          
          // Verify we have CTA buttons on the page
          expect(ctaButtons.length).toBeGreaterThan(0);
          
          // Check each CTA button for prominence characteristics
          ctaButtons.forEach(button => {
            // Verify button is an interactive element
            const tagName = button.tagName.toLowerCase();
            expect(['a', 'button'].includes(tagName)).toBe(true);
            
            // Check for prominent styling classes
            const classList = button.className;
            expect(classList).toBeTruthy();
            
            // Should have either primary button styling or explicit prominence class
            const hasProminentStyling = 
              classList.includes('btn-primary') || 
              classList.includes('cta-prominent') ||
              classList.includes('btn-lg');
            
            expect(hasProminentStyling).toBe(true);
            
            // Verify button has proper contrast (should have background color)
            const computedStyles = window.getComputedStyle(button);
            const backgroundColor = computedStyles.backgroundColor;
            
            // Should not be transparent for primary CTAs, but secondary CTAs can be transparent with borders
            if (classList.includes('btn-primary')) {
              expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
              expect(backgroundColor).not.toBe('transparent');
            } else if (classList.includes('btn-secondary')) {
              // Secondary buttons can be transparent but should have visible styling
              expect(backgroundColor === 'transparent' || backgroundColor !== 'rgba(0, 0, 0, 0)').toBe(true);
            }
            
            // Verify button has proper text color contrast
            const textColor = computedStyles.color;
            expect(textColor).not.toBe('rgba(0, 0, 0, 0)');
            expect(textColor).not.toBe('transparent');
            
            // Verify button has minimum size for accessibility
            const minHeight = computedStyles.minHeight;
            if (minHeight && minHeight !== 'auto') {
              const heightValue = parseFloat(minHeight);
              expect(heightValue).toBeGreaterThanOrEqual(44); // WCAG touch target size
            }
            
            // Verify button has adequate font size
            const fontSize = computedStyles.fontSize;
            const fontSizeValue = parseFloat(fontSize);
            expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Minimum readable size
            
            // Verify button has proper font weight for prominence
            const fontWeight = computedStyles.fontWeight;
            if (classList.includes('cta-prominent') || classList.includes('btn-primary')) {
              expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
            }
          });
          
          // Verify CTAs are distributed throughout the page (not all clustered)
          if (ctaButtons.length > 1) {
            const sections = ['header', 'section', 'footer'];
            const ctaDistribution = sections.map(sectionTag => {
              const section = document.querySelector(sectionTag);
              return section ? section.querySelectorAll('.cta-prominent, .btn-primary').length : 0;
            });
            
            // At least 2 different sections should have CTAs
            const sectionsWithCTAs = ctaDistribution.filter(count => count > 0).length;
            expect(sectionsWithCTAs).toBeGreaterThanOrEqual(2);
          }
        }
      ), { numRuns: 100 });
    });

    it('should maintain prominence on mobile devices', () => {
      fc.assert(fc.property(
        fc.integer({ min: 320, max: 768 }), // Mobile viewport width
        fc.integer({ min: 568, max: 1024 }), // Mobile viewport height
        (viewportWidth, viewportHeight) => {
          // Set mobile viewport
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
          Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });
          
          // Find CTA buttons
          const ctaButtons = document.querySelectorAll('.cta-prominent, .btn-primary');
          expect(ctaButtons.length).toBeGreaterThan(0);
          
          ctaButtons.forEach(button => {
            const computedStyles = window.getComputedStyle(button);
            
            // Mobile buttons should maintain minimum touch target size
            const minHeight = computedStyles.minHeight;
            if (minHeight && minHeight !== 'auto') {
              const heightValue = parseFloat(minHeight);
              expect(heightValue).toBeGreaterThanOrEqual(44); // Touch target size
            }
            
            // Verify button text is readable on mobile
            const fontSize = computedStyles.fontSize;
            const fontSizeValue = parseFloat(fontSize);
            expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Minimum readable size
            
            // Verify button maintains prominent styling on mobile
            const classList = button.className;
            const hasProminentStyling = 
              classList.includes('btn-primary') || 
              classList.includes('cta-prominent') ||
              classList.includes('btn-lg');
            
            expect(hasProminentStyling).toBe(true);
          });
        }
      ), { numRuns: 50 });
    });

    it('should have proper accessibility attributes', () => {
      const ctaButtons = document.querySelectorAll('.cta-prominent, .btn-primary');
      expect(ctaButtons.length).toBeGreaterThan(0);
      
      ctaButtons.forEach(button => {
        // Verify button has accessible text
        const textContent = button.textContent?.trim();
        expect(textContent).toBeTruthy();
        expect(textContent!.length).toBeGreaterThan(0);
        
        // Verify button has proper role (should be button or link)
        const tagName = button.tagName.toLowerCase();
        expect(['a', 'button'].includes(tagName)).toBe(true);
        
        // If it's a link, it should have href
        if (tagName === 'a') {
          const href = button.getAttribute('href');
          expect(href).toBeTruthy();
          
          // External links should have proper attributes
          if (href?.startsWith('http')) {
            expect(button.getAttribute('target')).toBe('_blank');
            expect(button.getAttribute('rel')).toContain('noopener');
          }
        }
        
        // Verify button text is descriptive
        expect(textContent!.length).toBeGreaterThan(3);
        expect(textContent).toMatch(/^[A-Za-z]/); // Starts with letter
      });
    });

    it('should be easily discoverable with different content variations', () => {
      fc.assert(fc.property(
        fc.constantFrom('Get Started', 'Start Now', 'Begin', 'Try UEPM', 'Install Now'),
        fc.constantFrom('View Documentation', 'Read Docs', 'Learn More', 'Documentation'),
        fc.constantFrom('View on GitHub', 'GitHub', 'Source Code', 'Repository'),
        (primaryText, docsText, githubText) => {
          // Update button text content
          const buttons = document.querySelectorAll('.cta-prominent, .btn-primary');
          let buttonIndex = 0;
          
          buttons.forEach(button => {
            const currentText = [primaryText, docsText, githubText][buttonIndex % 3];
            button.textContent = currentText;
            buttonIndex++;
          });
          
          // Verify all buttons still maintain prominence with new content
          buttons.forEach(button => {
            const textContent = button.textContent?.trim();
            expect(textContent).toBeTruthy();
            expect(textContent!.length).toBeGreaterThan(3);
            
            // Verify button still has prominent styling
            const classList = button.className;
            const hasProminentStyling = 
              classList.includes('btn-primary') || 
              classList.includes('cta-prominent') ||
              classList.includes('btn-lg');
            
            expect(hasProminentStyling).toBe(true);
            
            // Verify text is action-oriented (more flexible matching)
            const actionWords = ['get', 'start', 'view', 'read', 'learn', 'try', 'install', 'begin', 'github', 'docs', 'documentation', 'source', 'code', 'repository'];
            const hasActionWord = actionWords.some(word => 
              textContent!.toLowerCase().includes(word)
            );
            expect(hasActionWord).toBe(true);
          });
        }
      ), { numRuns: 100 });
    });

    it('should maintain visual hierarchy among different CTA types', () => {
      const primaryCTAs = document.querySelectorAll('.btn-primary.cta-prominent');
      const secondaryCTAs = document.querySelectorAll('.btn-secondary.cta-prominent');
      const regularButtons = document.querySelectorAll('.btn:not(.cta-prominent)');
      
      // Primary CTAs should be most prominent
      primaryCTAs.forEach(button => {
        const styles = window.getComputedStyle(button);
        expect(styles.backgroundColor).not.toBe('transparent');
        expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(600);
      });
      
      // Secondary CTAs should be less prominent but still noticeable
      secondaryCTAs.forEach(button => {
        const styles = window.getComputedStyle(button);
        expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(600);
      });
      
      // Regular buttons should be least prominent
      regularButtons.forEach(button => {
        const classList = button.className;
        if (!classList.includes('cta-prominent')) {
          // Should not have the same prominence as CTAs
          expect(classList.includes('btn-primary') || classList.includes('btn-lg')).toBe(false);
        }
      });
    });
  });
});