import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  UEPMError,
  ExitCode,
  formatErrorMessage,
  createFileNotFoundError,
  createPermissionDeniedError,
  createJSONParseError,
  createSchemaValidationError,
  createNoProjectFileError,
} from './errors';
import { findProjectFile, readProject, writeProject } from './uproject-manager';
import { read as readPackageJson, write as writePackageJson } from './package-json-manager';

describe('Error Handling', () => {
  describe('UEPMError', () => {
    it('should create error with correct properties', () => {
      const error = new UEPMError(
        'TEST_ERROR',
        'Test message',
        ExitCode.GENERAL_ERROR,
        'Test details',
        'Test suggestion'
      );

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.exitCode).toBe(ExitCode.GENERAL_ERROR);
      expect(error.details).toBe('Test details');
      expect(error.suggestion).toBe('Test suggestion');
      expect(error.name).toBe('UEPMError');
    });

    it('should convert to ErrorMessage', () => {
      const error = new UEPMError('TEST', 'Message', ExitCode.GENERAL_ERROR);
      const errorMessage = error.toErrorMessage();

      expect(errorMessage.level).toBe('error');
      expect(errorMessage.code).toBe('TEST');
      expect(errorMessage.message).toBe('Message');
    });
  });

  describe('formatErrorMessage', () => {
    it('should format error with all fields', () => {
      const formatted = formatErrorMessage({
        level: 'error',
        code: 'TEST',
        message: 'Test message',
        details: 'Test details',
        suggestion: 'Test suggestion',
      });

      expect(formatted).toContain('Error: Test message');
      expect(formatted).toContain('Details: Test details');
      expect(formatted).toContain('Suggestion: Test suggestion');
    });

    it('should format warning', () => {
      const formatted = formatErrorMessage({
        level: 'warning',
        code: 'TEST',
        message: 'Test warning',
      });

      expect(formatted).toContain('Warning: Test warning');
    });
  });

  describe('Error factory functions', () => {
    it('should create file not found error', () => {
      const error = createFileNotFoundError('/path/to/file');
      expect(error.code).toBe('FILE_NOT_FOUND');
      expect(error.exitCode).toBe(ExitCode.FILE_NOT_FOUND);
      expect(error.message).toContain('/path/to/file');
    });

    it('should create permission denied error', () => {
      const error = createPermissionDeniedError('/path/to/file', 'read');
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.exitCode).toBe(ExitCode.PERMISSION_DENIED);
      expect(error.message).toContain('read');
    });

    it('should create JSON parse error', () => {
      const parseError = new SyntaxError('Unexpected token');
      const error = createJSONParseError('/path/to/file.json', parseError);
      expect(error.code).toBe('JSON_PARSE_ERROR');
      expect(error.details).toContain('Unexpected token');
    });

    it('should create schema validation error', () => {
      const error = createSchemaValidationError('/path/to/file', ['field1', 'field2']);
      expect(error.code).toBe('SCHEMA_VALIDATION_ERROR');
      expect(error.exitCode).toBe(ExitCode.VALIDATION_FAILED);
      expect(error.details).toContain('field1');
      expect(error.details).toContain('field2');
    });

    it('should create no project file error', () => {
      const error = createNoProjectFileError('/path/to/dir');
      expect(error.code).toBe('UPROJECT_NOT_FOUND');
      expect(error.exitCode).toBe(ExitCode.FILE_NOT_FOUND);
    });
  });
});

/**
 * Feature: uepm, Property 5: Error conditions produce non-zero exit codes
 * Validates: Requirements 7.4
 */
describe('Property 5: Error conditions produce non-zero exit codes', () => {
  // Generator for invalid directory paths
  const invalidDirectoryArb = fc.oneof(
    fc.constant('/nonexistent/directory/path'),
    fc.constant('/tmp/does-not-exist-' + Math.random()),
    fc.string().filter(s => s.length > 0 && !s.includes('\0'))
  );

  it('should produce non-zero exit code for missing .uproject file', async () => {
    await fc.assert(
      fc.asyncProperty(invalidDirectoryArb, async (directory) => {
        try {
          // Create a temporary directory that exists but has no .uproject file
          const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
          
          try {
            await findProjectFile(tempDir);
            // If we get here, the test should fail
            return false;
          } catch (error) {
            // Should throw UEPMError with non-zero exit code
            if (error instanceof UEPMError) {
              expect(error.exitCode).not.toBe(ExitCode.SUCCESS);
              expect(error.exitCode).toBeGreaterThan(0);
              return true;
            }
            return false;
          } finally {
            // Clean up
            await fs.rmdir(tempDir);
          }
        } catch {
          // If temp dir creation fails, skip this iteration
          return true;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should produce non-zero exit code for invalid JSON in .uproject', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => {
          // Generate strings that are NOT valid JSON
          try {
            JSON.parse(s);
            return false;
          } catch {
            return s.length > 0;
          }
        }),
        async (invalidJson) => {
          const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
          const uprojectPath = path.join(tempDir, 'Test.uproject');

          try {
            // Write invalid JSON
            await fs.writeFile(uprojectPath, invalidJson, 'utf-8');

            try {
              await readProject(uprojectPath);
              // Should not reach here
              return false;
            } catch (error) {
              // Should throw UEPMError with non-zero exit code
              if (error instanceof UEPMError) {
                expect(error.exitCode).not.toBe(ExitCode.SUCCESS);
                expect(error.exitCode).toBeGreaterThan(0);
                return true;
              }
              return false;
            }
          } finally {
            // Clean up
            await fs.unlink(uprojectPath).catch(() => {});
            await fs.rmdir(tempDir).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce non-zero exit code for missing required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate objects without EngineAssociation
          Category: fc.option(fc.string(), { nil: undefined }),
          Description: fc.option(fc.string(), { nil: undefined }),
        }),
        async (invalidProject) => {
          const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
          const uprojectPath = path.join(tempDir, 'Test.uproject');

          try {
            // Write project without required field
            await fs.writeFile(uprojectPath, JSON.stringify(invalidProject), 'utf-8');

            try {
              await readProject(uprojectPath);
              // Should not reach here
              return false;
            } catch (error) {
              // Should throw UEPMError with non-zero exit code
              if (error instanceof UEPMError) {
                expect(error.exitCode).not.toBe(ExitCode.SUCCESS);
                expect(error.exitCode).toBeGreaterThan(0);
                return true;
              }
              return false;
            }
          } finally {
            // Clean up
            await fs.unlink(uprojectPath).catch(() => {});
            await fs.rmdir(tempDir).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
