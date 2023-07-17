const MAX_32_SIGNED = 2 ** 31 - 1;

export function AppendingQueueController<T>() {
  let nextInLine: (() => Promise<T>) | null = null;
  let resolver: ((value: unknown) => void) | null = null;
  let timeoutId: number | null = null;
  
  const createInfinitePromise = () =>
    new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolver = resolve;
      timeoutId = setTimeout(resolve, MAX_32_SIGNED);
    });
  let stallIndefinitely = createInfinitePromise();
  
  return {
    iterator: async function* nextJob() {
      while (true) {
        if (nextInLine == null) await stallIndefinitely;
        if (nextInLine == null) continue;
        const jobPromise = nextInLine();
        nextInLine = null;
        stallIndefinitely = createInfinitePromise();
        yield await jobPromise;
      }
    },
    add: (job: () => Promise<T>) => {
      nextInLine = job;
      if (resolver != null) {
        resolver(null);
      }
    },
    shutdown: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}
