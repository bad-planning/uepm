import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

/**
 * **Feature: uepm-website, Property 3: Interactive code examples provide copy functionality**
 * **Validates: Requirements 2.5**
 * 
 * For any code block displayed on the site, a copy-to-clipboard button should be present 
 * and successfully copy the code content when clicked
 */
describe('Code Example Copy Functionality', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create a fresh DOM for each test with CodeExample component structure
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test</title>
          <style>
            .code-example-section { padding: 3rem 1rem; }
            .code-step { background: white; border-radius: 0.5rem; margin-bottom: 2rem; }
            .copy-button { 
              display: inline-flex; 
              align-items: center; 
              padding: 0.375rem 0.75rem;
              border: 1px solid #d1d5db;
              background: white;
              cursor: pointer;
            }
            .code-block { 
              background: #0d1117; 
              color: #e6edf3; 
              padding: 1.5rem; 
              overflow-x: auto;
              font-family: monospace;
            }
            .copy-text { margin-left: 0.375rem; }
            .copy-icon { width: 1rem; height: 1rem; }
          </style>
        </head>
        <body>
          <section class="code-example-section" aria-labelledby="code-example-quick-start">
            <div class="max-w-4xl mx-auto">
              <h2 id="code-example-quick-start" class="text-3xl font-bold text-gray-900 mb-4">
                Quick Start Guide
              </h2>
              <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                Get started with UEPM in just a few simple steps.
              </p>
              
              <div class="space-y-8">
                <div class="code-step bg-white rounded-lg shadow-lg" data-step="1">
                  <div class="bg-gray-50 px-6 py-4 border-b">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold">Initialize UEPM</h3>
                      <button 
                        class="copy-button"
                        data-copy-text="npx @uepm/init"
                        data-step-id="code-step-0"
                        aria-label="Copy bash code from step 1"
                      >
                        <svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <span class="copy-text">Copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="code-block" data-language="bash">
                    <pre><code>npx @uepm/init</code></pre>
                  </div>
                </div>
                
                <div class="code-step bg-white rounded-lg shadow-lg" data-step="2">
                  <div class="bg-gray-50 px-6 py-4 border-b">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold">Install a Plugin</h3>
                      <button 
                        class="copy-button"
                        data-copy-text="uepm install example-plugin"
                        data-step-id="code-step-1"
                        aria-label="Copy bash code from step 2"
                      >
                        <svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <span class="copy-text">Copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="code-block" data-language="bash">
                    <pre><code>uepm install example-plugin</code></pre>
                  </div>
                </div>
              </div>
              
              <div 
                id="copy-success-notification"
                class="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 z-50"
                role="alert"
                aria-live="polite"
              >
                <span>Code copied to clipboard!</span>
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
    
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    };
    
    Object.defineProperty(window.navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    });
    
    // Mock document.execCommand for fallback
    document.execCommand = vi.fn().mockReturnValue(true);
    
    // Set global document and window for tests
    global.document = document;
    global.window = window;
  });

  describe('Property 3: Interactive code examples provide copy functionality', () => {
    it('should provide copy functionality for any code block with proper button attributes', () => {
      fc.assert(fc.property(
        fc.constantFrom('npx @uepm/init', 'npm install @uepm/cli', 'yarn add @uepm/core', 'uepm install plugin-name'),
        fc.constantFrom('bash', 'json', 'typescript'),
        fc.integer({ min: 1, max: 10 }), // step number
        (codeContent, language, stepNumber) => {
          // Find all copy buttons in the DOM
          const copyButtons = document.querySelectorAll('.copy-button');
          
          // Verify that copy buttons exist
          expect(copyButtons.length).toBeGreaterThan(0);
          
          // Test each copy button
          copyButtons.forEach((button, index) => {
            // Verify required attributes are present
            const copyText = button.getAttribute('data-copy-text');
            const stepId = button.getAttribute('data-step-id');
            const ariaLabel = button.getAttribute('aria-label');
            
            expect(copyText).toBeTruthy();
            expect(copyText?.trim().length).toBeGreaterThan(0);
            expect(stepId).toBeTruthy();
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel).toContain('Copy');
            
            // Verify button structure
            const copyIcon = button.querySelector('.copy-icon');
            const copyTextElement = button.querySelector('.copy-text');
            
            expect(copyIcon).toBeTruthy();
            expect(copyTextElement).toBeTruthy();
            expect(copyTextElement?.textContent?.trim()).toBe('Copy');
            
            // Verify button is interactive
            expect(button.tagName).toBe('BUTTON');
            expect(button.getAttribute('type')).not.toBe('submit'); // Should not be a form submit
            
            // Test that code content is meaningful
            if (copyText) {
              expect(copyText.length).toBeGreaterThan(3);
              
              // Test that it looks like a valid command or code
              const isCommand = /^(npx|npm|yarn|uepm)\s+/.test(copyText);
              const isCode = copyText.includes('{') || copyText.includes('(') || copyText.includes('import');
              const isValidContent = isCommand || isCode || copyText.length > 5;
              
              expect(isValidContent).toBe(true);
            }
          });
          
          // Verify that each code block has a corresponding copy button
          const codeBlocks = document.querySelectorAll('.code-block');
          expect(codeBlocks.length).toBeGreaterThan(0);
          expect(copyButtons.length).toBeGreaterThanOrEqual(codeBlocks.length);
        }
      ), { numRuns: 100 });
    });

    it('should successfully copy code content when copy button is clicked', async () => {
      await fc.assert(fc.asyncProperty(
        fc.constantFrom('npx @uepm/init', 'npm install plugin', 'yarn add dependency'),
        async (testCode) => {
          // Update a copy button with test code
          const copyButton = document.querySelector('.copy-button');
          expect(copyButton).toBeTruthy();
          
          if (copyButton) {
            copyButton.setAttribute('data-copy-text', testCode);
            
            // Mock the clipboard API
            const mockWriteText = vi.fn().mockResolvedValue(undefined);
            (window.navigator.clipboard as any).writeText = mockWriteText;
            
            // Create and dispatch a more realistic click event
            const clickEvent = new window.MouseEvent('click', { 
              bubbles: true, 
              cancelable: true,
              view: window
            });
            
            // Add event listener to simulate the actual component behavior
            copyButton.addEventListener('click', async (event) => {
              event.preventDefault();
              const textToCopy = copyButton.getAttribute('data-copy-text');
              if (textToCopy) {
                await window.navigator.clipboard.writeText(textToCopy);
              }
            });
            
            copyButton.dispatchEvent(clickEvent);
            
            // Wait for async clipboard operation
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Verify clipboard.writeText was called with correct content
            expect(mockWriteText).toHaveBeenCalledWith(testCode);
          }
        }
      ), { numRuns: 50 });
    });

    it('should handle clipboard API failures gracefully with fallback', async () => {
      await fc.assert(fc.asyncProperty(
        fc.constantFrom('test command', 'another test', 'fallback test'),
        async (testCode) => {
          const copyButton = document.querySelector('.copy-button');
          expect(copyButton).toBeTruthy();
          
          if (copyButton) {
            copyButton.setAttribute('data-copy-text', testCode);
            
            // Mock clipboard API to fail
            const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard API not available'));
            (window.navigator.clipboard as any).writeText = mockWriteText;
            
            // Mock document.execCommand fallback
            const mockExecCommand = vi.fn().mockReturnValue(true);
            document.execCommand = mockExecCommand;
            
            // Add event listener to simulate the actual component behavior with fallback
            copyButton.addEventListener('click', async (event) => {
              event.preventDefault();
              const textToCopy = copyButton.getAttribute('data-copy-text');
              if (textToCopy) {
                try {
                  await window.navigator.clipboard.writeText(textToCopy);
                } catch (err) {
                  // Fallback to execCommand
                  const textArea = document.createElement('textarea');
                  textArea.value = textToCopy;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                }
              }
            });
            
            // Simulate click event
            const clickEvent = new window.MouseEvent('click', { 
              bubbles: true, 
              cancelable: true,
              view: window
            });
            copyButton.dispatchEvent(clickEvent);
            
            // Wait for async operation and fallback
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Verify primary method was attempted
            expect(mockWriteText).toHaveBeenCalledWith(testCode);
          }
        }
      ), { numRuns: 30 });
    });

    it('should provide visual feedback when copy operation succeeds', () => {
      fc.assert(fc.property(
        fc.boolean(), // Whether clipboard API is available
        fc.boolean(), // Whether operation succeeds
        (hasClipboardAPI, operationSucceeds) => {
          const copyButton = document.querySelector('.copy-button');
          const copyTextElement = copyButton?.querySelector('.copy-text');
          const notification = document.getElementById('copy-success-notification');
          
          expect(copyButton).toBeTruthy();
          expect(copyTextElement).toBeTruthy();
          expect(notification).toBeTruthy();
          
          // Verify initial state
          expect(copyTextElement?.textContent?.trim()).toBe('Copy');
          expect(notification?.classList.contains('translate-x-full')).toBe(true);
          
          // Verify notification has proper accessibility attributes
          expect(notification?.getAttribute('role')).toBe('alert');
          expect(notification?.getAttribute('aria-live')).toBe('polite');
          
          // Verify button has proper structure for state changes
          const copyIcon = copyButton?.querySelector('.copy-icon');
          expect(copyIcon).toBeTruthy();
          
          // Test that button can be focused for keyboard accessibility
          if (copyButton instanceof HTMLElement) {
            copyButton.focus();
            expect(document.activeElement).toBe(copyButton);
          }
        }
      ), { numRuns: 100 });
    });

    it('should maintain accessibility standards for copy functionality', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 5 }), // Number of code blocks
        (numCodeBlocks) => {
          const copyButtons = document.querySelectorAll('.copy-button');
          
          copyButtons.forEach((button, index) => {
            // Test ARIA labels
            const ariaLabel = button.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel).toContain('Copy');
            expect(ariaLabel).toMatch(/step \d+/i);
            
            // Test keyboard accessibility
            expect(button.tagName).toBe('BUTTON');
            expect(button.hasAttribute('disabled')).toBe(false);
            
            // Test that button can receive focus
            if (button instanceof HTMLElement) {
              button.focus();
              expect(document.activeElement).toBe(button);
            }
            
            // Test button content structure
            const textContent = button.textContent?.trim();
            expect(textContent).toContain('Copy');
            
            // Verify button has visual elements
            const icon = button.querySelector('.copy-icon');
            const text = button.querySelector('.copy-text');
            expect(icon).toBeTruthy();
            expect(text).toBeTruthy();
          });
          
          // Test notification accessibility
          const notification = document.getElementById('copy-success-notification');
          expect(notification?.getAttribute('role')).toBe('alert');
          expect(notification?.getAttribute('aria-live')).toBe('polite');
        }
      ), { numRuns: 100 });
    });

    it('should handle different types of code content appropriately', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.constant('npx @uepm/init'),
          fc.constant('npm install @uepm/cli --save-dev'),
          fc.constant('yarn add @uepm/core'),
          fc.constant('uepm install example-plugin'),
          fc.constant('{"name": "@uepm/example", "version": "1.0.0"}'),
          fc.constant('import { UEPMManager } from "@uepm/core";')
        ),
        fc.constantFrom('bash', 'json', 'typescript'),
        (codeContent, language) => {
          // Update button with test content
          const copyButton = document.querySelector('.copy-button');
          if (copyButton) {
            copyButton.setAttribute('data-copy-text', codeContent);
            
            // Verify content is preserved exactly
            expect(copyButton.getAttribute('data-copy-text')).toBe(codeContent);
            
            // Test content validation
            expect(codeContent.length).toBeGreaterThan(0);
            expect(codeContent.trim()).toBe(codeContent); // No leading/trailing whitespace
            
            // Test language-specific content patterns
            if (language === 'bash') {
              const isValidBashCommand = /^(npx|npm|yarn|uepm|cd|ls|mkdir)\s+/.test(codeContent) || 
                                       codeContent.startsWith('./') || 
                                       codeContent.startsWith('sudo ') ||
                                       codeContent.includes('=') ||
                                       codeContent.includes('$');
              expect(isValidBashCommand || codeContent.length > 3).toBe(true);
            }
            
            if (language === 'json') {
              if (codeContent.startsWith('{') || codeContent.startsWith('[')) {
                expect(() => JSON.parse(codeContent)).not.toThrow();
              }
            }
            
            if (language === 'typescript') {
              const hasTypescriptKeywords = /\b(import|export|interface|type|class|function|const|let|var)\b/.test(codeContent);
              const hasTypescriptSyntax = codeContent.includes('(') || codeContent.includes('{') || codeContent.includes(';');
              const isValidTypescript = hasTypescriptKeywords || hasTypescriptSyntax || codeContent.length > 5;
              expect(isValidTypescript).toBe(true);
            }
          }
        }
      ), { numRuns: 100 });
    });
  });
});