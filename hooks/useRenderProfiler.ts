import { useEffect, useRef } from 'react';

export function useRenderProfiler(name: string) {
  const started = useRef(0);
  const renders = useRef(0);
  started.current = globalThis.performance?.now?.() ?? Date.now();
  renders.current += 1;

  useEffect(() => {
    if (!__DEV__) return;
    const elapsed = (globalThis.performance?.now?.() ?? Date.now()) - started.current;
    if (elapsed > 32 || renders.current > 30) {
      console.warn(`${name} commit ${elapsed.toFixed(1)}ms after ${renders.current} renders`);
    }
  });
}
