/**
 * Sanitizes a name (for categories, subcategories, brands, etc.) by:
 * 1. Blocking all numbers (0-9).
 * 2. Blocking emojis and common symbols.
 * 3. Ensuring it starts with a letter (A-Z or a-z).
 * 4. Allowing other special characters everywhere else.
 */
export const sanitizeName = (value: string): string => {
  return value
    .replace(/[0-9]/g, "") // Block numbers
    .replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, "") // Block emojis
    .replace(/^[^a-zA-Z]+/, ""); // Must start with a letter
};
