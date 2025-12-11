/**
 * Deep equality check for arrays and objects.
 * Used to prevent unnecessary reactive updates.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if deeply equal, false otherwise
 */
export function deepEqual(a: any, b: any): boolean {
  // Strict equality check
  if (a === b) return true;

  // Check for null or undefined
  if (a == null || b == null) return false;

  // Check for different types
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(
      (key) => keysB.includes(key) && deepEqual(a[key], b[key])
    );
  }

  // Primitive types that aren't equal
  return false;
}
