/**
 * Error handling utilities for UEPM
 */

export type ErrorLevel = 'error' | 'warning' | 'info';

export interface ErrorMessage {
  level: ErrorLevel;
  code: string;
  message: string;
  details?: string;
  suggestion?: string;
}

/**
 * Exit codes for UEPM commands
 */
export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  INVALID_ARGUMENTS = 2,
  FILE_NOT_FOUND = 3,
  PERMISSION_DENIED = 4,
  VALIDATION_FAILED = 5,
}

/**
 * Custom error class for UEPM errors
 */
export class UEPMError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly exitCode: ExitCode = ExitCode.GENERAL_ERROR,
    public readonly details?: string,
    public readonly suggestion?: string
  ) {
    super(message);
    this.name = 'UEPMError';
  }

  toErrorMessage(): ErrorMessage {
    return {
      level: 'error',
      code: this.code,
      message: this.message,
      details: this.details,
      suggestion: this.suggestion,
    };
  }
}

/**
 * Format an error message for display
 */
export function formatErrorMessage(error: ErrorMessage): string {
  const parts: string[] = [];

  // Level prefix
  const prefix = error.level === 'error' ? 'Error' : error.level === 'warning' ? 'Warning' : 'Info';
  parts.push(`${prefix}: ${error.message}`);

  // Details
  if (error.details) {
    parts.push(`Details: ${error.details}`);
  }

  // Suggestion
  if (error.suggestion) {
    parts.push(`Suggestion: ${error.suggestion}`);
  }

  return parts.join('\n');
}

/**
 * Create a UEPMError for file not found
 */
export function createFileNotFoundError(
  filePath: string,
  suggestion?: string
): UEPMError {
  return new UEPMError(
    'FILE_NOT_FOUND',
    `File not found: ${filePath}`,
    ExitCode.FILE_NOT_FOUND,
    undefined,
    suggestion || 'Please check that the file exists and the path is correct.'
  );
}

/**
 * Create a UEPMError for permission denied
 */
export function createPermissionDeniedError(
  filePath: string,
  operation: string
): UEPMError {
  return new UEPMError(
    'PERMISSION_DENIED',
    `Permission denied: Cannot ${operation} ${filePath}`,
    ExitCode.PERMISSION_DENIED,
    undefined,
    'Please check file permissions and ensure you have the necessary access rights.'
  );
}

/**
 * Create a UEPMError for JSON parsing failure
 */
export function createJSONParseError(
  filePath: string,
  parseError: Error
): UEPMError {
  return new UEPMError(
    'JSON_PARSE_ERROR',
    `Failed to parse JSON file: ${filePath}`,
    ExitCode.GENERAL_ERROR,
    parseError.message,
    'Please ensure the file contains valid JSON syntax.'
  );
}

/**
 * Create a UEPMError for invalid schema
 */
export function createSchemaValidationError(
  filePath: string,
  missingFields: string[]
): UEPMError {
  return new UEPMError(
    'SCHEMA_VALIDATION_ERROR',
    `Invalid file schema: ${filePath}`,
    ExitCode.VALIDATION_FAILED,
    `Missing required fields: ${missingFields.join(', ')}`,
    'Please ensure the file contains all required fields.'
  );
}

/**
 * Create a UEPMError for no .uproject file found
 */
export function createNoProjectFileError(directory: string): UEPMError {
  return new UEPMError(
    'UPROJECT_NOT_FOUND',
    `No .uproject file found in directory: ${directory}`,
    ExitCode.FILE_NOT_FOUND,
    undefined,
    'Please run this command in your Unreal Engine project root directory.'
  );
}
