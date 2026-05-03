// general use of the throttle for performance.
export const throttle = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay: number
) => {
  let last = 0;

  return (...args: Args): R | undefined => {
    const now = Date.now();

    if (now - last >= delay) {
      last = now;
      return fn(...args);
    }
  };
};
