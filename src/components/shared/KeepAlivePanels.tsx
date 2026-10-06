import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/** Shared content-shell floor so tab switches don't collapse the classic window */
export const SECTION_CONTENT_MIN_HEIGHT = 520;

type KeepAlivePanelsProps<T extends string> = {
  active: T;
  panels: Partial<Record<T, ReactNode>>;
  /** Keys to consider for mount-once (defaults to Object.keys(panels)) */
  keys?: T[];
  style?: CSSProperties;
  className?: string;
};

/**
 * Visit-once keep-alive: first open mounts the panel; later switches only toggle
 * display so React state + in-memory caches stay warm (no remount Loading flash).
 */
export function KeepAlivePanels<T extends string>({
  active,
  panels,
  keys,
  style,
  className,
}: KeepAlivePanelsProps<T>) {
  const panelKeys = keys ?? (Object.keys(panels) as T[]);
  const [mounted, setMounted] = useState<Set<T>>(() => new Set([active]));

  useEffect(() => {
    setMounted((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  return (
    <div
      className={className}
      style={{
        minHeight: SECTION_CONTENT_MIN_HEIGHT,
        ...style,
      }}
    >
      {panelKeys.map((key) => {
        if (!mounted.has(key) || panels[key] === undefined) return null;
        return (
          <div
            key={key}
            style={{ display: key === active ? 'block' : 'none' }}
            aria-hidden={key !== active}
          >
            {panels[key]}
          </div>
        );
      })}
    </div>
  );
}
