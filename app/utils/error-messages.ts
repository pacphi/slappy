// M1: User-friendly error messages with recovery guidance

export interface ErrorContext {
  message: string
  solution: string
  helpLink?: string
}

export const ERROR_MESSAGES: Record<string, ErrorContext> = {
  GOOGLE_SHEETS_FAILED: {
    message: 'Unable to access Google Sheet',
    solution:
      'Make sure your sheet is published:\n1. Open your sheet\n2. Click File → Share → Publish to web\n3. Click "Publish" and copy the URL',
    helpLink: 'https://support.google.com/docs/answer/183965',
  },
  GOOGLE_SHEETS_INVALID_URL: {
    message: 'Invalid Google Sheets URL',
    solution: 'URL should look like:\nhttps://docs.google.com/spreadsheets/d/SHEET_ID/edit',
    helpLink: 'https://support.google.com/docs/answer/183965',
  },
  GOOGLE_SHEETS_PRIVATE: {
    message: 'Google Sheet is private',
    solution:
      'The sheet must be publicly accessible. Click "Share" and set to "Anyone with the link"',
  },
  CSV_PARSE_FAILED: {
    message: 'Unable to parse CSV file',
    solution:
      'Please check:\n• File is valid CSV format\n• Encoding is UTF-8\n• Quotes are properly escaped\n• No binary data in file',
  },
  FILE_TOO_LARGE: {
    message: 'File is too large',
    solution:
      'Maximum file size is 5MB. Try:\n• Removing unnecessary columns\n• Splitting data into multiple files\n• Compressing the file',
  },
}

/**
 * Maps API error messages to user-friendly error contexts
 */
export function getErrorMessage(apiError: string): ErrorContext {
  // Map API errors to user-friendly messages
  if (apiError.includes('Google Sheet')) {
    if (apiError.includes('403') || apiError.includes('private')) {
      return ERROR_MESSAGES.GOOGLE_SHEETS_PRIVATE
    }
    return ERROR_MESSAGES.GOOGLE_SHEETS_FAILED
  }

  if (apiError.includes('Invalid Google Sheets URL')) {
    return ERROR_MESSAGES.GOOGLE_SHEETS_INVALID_URL
  }

  if (apiError.includes('parse') || apiError.includes('CSV')) {
    return ERROR_MESSAGES.CSV_PARSE_FAILED
  }

  if (apiError.includes('too large') || apiError.includes('size')) {
    return ERROR_MESSAGES.FILE_TOO_LARGE
  }

  // Default fallback
  return {
    message: 'An error occurred',
    solution: apiError,
  }
}
