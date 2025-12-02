type DateFormatOptions = {
  month?: 'short' | 'long' | 'numeric' | '2-digit' | 'narrow';
  includeTime?: boolean;
};

/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string to format
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: DateFormatOptions = {}
): string => {
  const { month = 'short', includeTime = true } = options;
  const date = new Date(dateString);

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month,
    day: 'numeric',
  };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
};

