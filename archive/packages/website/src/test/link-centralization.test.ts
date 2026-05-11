/**
 * Property-based test for link centralization
 * **Feature: uepm-website, Property 11: External links are centralized for maintenance**
 * **Validates: Requirements 7.4**
 */

import { describe, it, expect } from 'vitest';
import { getSiteConfig, homePageContent, navigationLinks, footerLinks } from '../config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

describe('Link Centralization Property Tests', () => {
  const siteConfig = getSiteConfig();
  
  describe('Property 11: External links are centralized for maintenance', () => {
    // Get all component files to scan for hardcoded URLs
    const componentFiles = [
      'src/components/Navigation.astro',
      'src/components/Footer.astro',
      'src/components/GetStarted.astro',
      'src/components/Hero.astro',
      'src/components/Features.astro',
      'src/components/CodeExample.astro'
    ];

    it('should not have hardcoded external URLs in component files', () => {
      componentFiles.forEach(componentFile => {
        const filePath = join(projectRoot, componentFile);
        let fileContent: string;
        
        try {
          fileContent = readFileSync(filePath, 'utf-8');
        } catch (error) {
          // If file doesn't exist, skip this test
          return;
        }

        // List of external URLs that should be centralized
        const externalUrlPatterns = [
          /https:\/\/github\.com\/uepm\/uepm(?!.*import|.*from)/,
          /https:\/\/www\.npmjs\.com\/package\/@uepm\/init(?!.*import|.*from)/,
          /https:\/\/docs\.unrealengine\.com(?!.*import|.*from)/,
          /https:\/\/docs\.npmjs\.com(?!.*import|.*from)/,
          /https:\/\/www\.unrealengine\.com(?!.*import|.*from)/
        ];

        // Check for hardcoded external URLs (excluding imports)
        for (const pattern of externalUrlPatterns) {
          const lines = fileContent.split('\n');
          let hasHardcodedUrl = false;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (pattern.test(line)) {
              // Skip if it's an import line or within config import section
              if (!line.includes('import') && 
                  !line.includes('from \'../config') && 
                  !line.includes('getSiteConfig') &&
                  !line.includes('homePageContent') &&
                  !line.includes('navigationLinks') &&
                  !line.includes('footerLinks')) {
                hasHardcodedUrl = true;
                console.log(`Found hardcoded URL in ${componentFile} line ${i + 1}: ${line.trim()}`);
                break;
              }
            }
          }
          
          expect(hasHardcodedUrl, `Component ${componentFile} should not contain hardcoded URLs`).toBe(false);
        }
      });
    });

    it('should have all external link types accessible through centralized configuration', () => {
      const linkTypes = ['github', 'npm', 'documentation', 'examples', 'issues', 'discussions', 'releases'];
      
      linkTypes.forEach(linkType => {
        switch (linkType) {
          case 'github':
            expect(siteConfig.github.url, 'GitHub URL should be defined').toBeDefined();
            expect(siteConfig.social.github, 'Social GitHub URL should be defined').toBeDefined();
            expect(siteConfig.github.url, 'GitHub URL should be valid').toMatch(/^https:\/\/github\.com/);
            break;
          
          case 'npm':
            expect(siteConfig.npm.url, 'NPM URL should be defined').toBeDefined();
            expect(siteConfig.social.npm, 'Social NPM URL should be defined').toBeDefined();
            expect(siteConfig.npm.url, 'NPM URL should be valid').toMatch(/^https:\/\/www\.npmjs\.com/);
            break;
          
          case 'documentation':
            expect(siteConfig.documentation.url, 'Documentation URL should be defined').toBeDefined();
            expect(siteConfig.documentation.url, 'Documentation URL should be valid').toMatch(/^https:/);
            break;
          
          case 'examples':
            expect(siteConfig.externalLinks.examples, 'Examples URL should be defined').toBeDefined();
            expect(siteConfig.externalLinks.examples, 'Examples URL should be valid').toMatch(/^https:/);
            break;
          
          case 'issues':
            expect(siteConfig.externalLinks.issues, 'Issues URL should be defined').toBeDefined();
            expect(siteConfig.externalLinks.issues, 'Issues URL should be valid').toMatch(/^https:\/\/github\.com/);
            break;
          
          case 'discussions':
            expect(siteConfig.externalLinks.discussions, 'Discussions URL should be defined').toBeDefined();
            expect(siteConfig.externalLinks.discussions, 'Discussions URL should be valid').toMatch(/^https:\/\/github\.com/);
            break;
          
          case 'releases':
            expect(siteConfig.externalLinks.releases, 'Releases URL should be defined').toBeDefined();
            expect(siteConfig.externalLinks.releases, 'Releases URL should be valid').toMatch(/^https:\/\/github\.com/);
            break;
        }
      });
    });

    it('should have properly structured navigation and footer links using centralized configuration', () => {
      const linkSections = ['navigation', 'footer'];
      
      linkSections.forEach(linkSection => {
        if (linkSection === 'navigation') {
          // Check that navigation links are properly structured
          expect(Array.isArray(navigationLinks), 'Navigation links should be an array').toBe(true);
          expect(navigationLinks.length, 'Navigation should have links').toBeGreaterThan(0);
          
          navigationLinks.forEach((link, index) => {
            expect(link, `Navigation link ${index} should have text property`).toHaveProperty('text');
            expect(link, `Navigation link ${index} should have href property`).toHaveProperty('href');
            expect(link, `Navigation link ${index} should have internal property`).toHaveProperty('internal');
            
            if (!link.internal) {
              expect(link.href, `External navigation link ${index} should be HTTPS`).toMatch(/^https:/);
            }
          });
        } else if (linkSection === 'footer') {
          // Check that footer links are properly structured
          expect(typeof footerLinks, 'Footer links should be an object').toBe('object');
          expect(footerLinks.product, 'Footer should have product section').toBeDefined();
          expect(footerLinks.community, 'Footer should have community section').toBeDefined();
          expect(footerLinks.resources, 'Footer should have resources section').toBeDefined();
          
          Object.entries(footerLinks).forEach(([sectionName, section]) => {
            expect(section, `Footer section ${sectionName} should have title`).toHaveProperty('title');
            expect(section, `Footer section ${sectionName} should have links`).toHaveProperty('links');
            expect(Array.isArray(section.links), `Footer section ${sectionName} links should be array`).toBe(true);
            
            section.links.forEach((link, index) => {
              expect(link, `Footer ${sectionName} link ${index} should have text`).toHaveProperty('text');
              expect(link, `Footer ${sectionName} link ${index} should have href`).toHaveProperty('href');
              expect(link, `Footer ${sectionName} link ${index} should have external flag`).toHaveProperty('external');
              
              if (link.external) {
                expect(link.href, `External footer ${sectionName} link ${index} should be HTTPS`).toMatch(/^https:/);
              }
            });
          });
        }
      });
    });

    it('should have centralized content configuration for link management', () => {
      const contentSections = ['hero', 'getStarted'];
      
      contentSections.forEach(contentSection => {
        if (contentSection === 'hero') {
          const heroContent = homePageContent.hero;
          expect(heroContent.primaryCTA, 'Hero should have primary CTA').toHaveProperty('href');
          expect(heroContent.secondaryCTA, 'Hero should have secondary CTA').toHaveProperty('href');
          
          // Secondary CTA should use external documentation link
          if (heroContent.secondaryCTA.href.startsWith('http')) {
            expect(heroContent.secondaryCTA.href, 'Hero secondary CTA should be HTTPS').toMatch(/^https:/);
          }
        } else if (contentSection === 'getStarted') {
          const getStartedContent = homePageContent.getStarted;
          expect(getStartedContent, 'Get started should have title').toHaveProperty('title');
          expect(getStartedContent, 'Get started should have subtitle').toHaveProperty('subtitle');
          expect(getStartedContent, 'Get started should have quick start command').toHaveProperty('quickStartCommand');
        }
      });
    });

    it('should have consistent URL formats across all external links', () => {
      const allExternalUrls = [
        siteConfig.github.url,
        siteConfig.npm.url,
        siteConfig.documentation.url,
        siteConfig.social.github,
        siteConfig.social.npm,
        ...Object.values(siteConfig.externalLinks)
      ];

      allExternalUrls.forEach(url => {
        expect(url, 'URL should be HTTPS').toMatch(/^https:/);
        expect(url, 'URL should not end with trailing slash').not.toMatch(/\/$/);
        expect(url, 'URL should not contain spaces').not.toContain(' ');
      });
    });

    it('should have all required configuration properties defined', () => {
      // Site config validation
      expect(siteConfig.title, 'Site title should be defined').toBeDefined();
      expect(siteConfig.description, 'Site description should be defined').toBeDefined();
      expect(siteConfig.url, 'Site URL should be defined').toBeDefined();
      
      // GitHub config validation
      expect(siteConfig.github.url, 'GitHub URL should be defined').toBeDefined();
      expect(siteConfig.github.text, 'GitHub text should be defined').toBeDefined();
      
      // NPM config validation
      expect(siteConfig.npm.packageName, 'NPM package name should be defined').toBeDefined();
      expect(siteConfig.npm.url, 'NPM URL should be defined').toBeDefined();
      expect(siteConfig.npm.text, 'NPM text should be defined').toBeDefined();
      
      // Documentation config validation
      expect(siteConfig.documentation.url, 'Documentation URL should be defined').toBeDefined();
      expect(siteConfig.documentation.text, 'Documentation text should be defined').toBeDefined();
      
      // External links validation
      expect(siteConfig.externalLinks.issues, 'Issues URL should be defined').toBeDefined();
      expect(siteConfig.externalLinks.discussions, 'Discussions URL should be defined').toBeDefined();
      expect(siteConfig.externalLinks.releases, 'Releases URL should be defined').toBeDefined();
      expect(siteConfig.externalLinks.examples, 'Examples URL should be defined').toBeDefined();
    });

    it('should maintain consistency between related URL configurations', () => {
      // GitHub URLs should be consistent
      expect(siteConfig.github.url, 'GitHub URLs should be consistent').toBe(siteConfig.social.github);
      
      // NPM URLs should be consistent
      expect(siteConfig.npm.url, 'NPM URLs should be consistent').toBe(siteConfig.social.npm);
      
      // All GitHub-related URLs should use the same base domain
      const githubUrls = [
        siteConfig.github.url,
        siteConfig.externalLinks.issues,
        siteConfig.externalLinks.discussions,
        siteConfig.externalLinks.releases,
        siteConfig.externalLinks.examples
      ];
      
      githubUrls.forEach(url => {
        expect(url, 'GitHub URLs should use consistent domain').toMatch(/^https:\/\/github\.com\/uepm\/uepm/);
      });
    });
  });
});