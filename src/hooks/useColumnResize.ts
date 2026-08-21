'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_WIDTH = 60;

export function useColumnResize(storageKey: string, defaults: number[]) {
  const [widths, setWidths] = useState<number[]>(defaults);
  const dragRef = useRef<{ index: number; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaults.length) {
          setWidths(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    const { index, startX, startWidth } = dragRef.current;
    const delta = e.clientX - startX;
    setWidths((prev) => {
      const next = [...prev];
      next[index] = Math.max(MIN_WIDTH, startWidth + delta);
      return next;
    });
  }, []);

  const onMouseUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    setWidths((current) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(current));
      } catch {
        // ignore quota errors
      }
      return current;
    });
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove, storageKey]);

  const startResize = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { index, startX: e.clientX, startWidth: widths[index] };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [widths, onMouseMove, onMouseUp]
  );

  const resetWidths = useCallback(() => {
    setWidths(defaults);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return { widths, startResize, resetWidths };
}
