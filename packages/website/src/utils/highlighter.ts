import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['bash', 'json', 'typescript']
    });
  }
  return highlighterInstance;
}

export function disposeHighlighter(): void {
  if (highlighterInstance) {
    highlighterInstance.dispose();
    highlighterInstance = null;
  }
}