export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debouncedFn = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };

  debouncedFn.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return debouncedFn as typeof debouncedFn & { cancel: () => void };
}
