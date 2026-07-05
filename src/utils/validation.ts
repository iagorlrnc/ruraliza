const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4 format.
 * Use this to validate route parameters and API inputs before sending to Supabase.
 */
export const isValidUUID = (value: string): boolean => {
  return UUID_REGEX.test(value);
};
