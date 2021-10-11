import { useRef, useLayoutEffect } from 'react';

export const useRunAfterUpdate = () => {
  const afterPaintRef = useRef<any>(undefined);
  useLayoutEffect(() => {
    if (afterPaintRef.current) {
      afterPaintRef.current();
      afterPaintRef.current = undefined;
    }
  });
  const runAfterUpdate = (callback: () => void) =>
    (afterPaintRef.current = callback);
  return runAfterUpdate;
};
