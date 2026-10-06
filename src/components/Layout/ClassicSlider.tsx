import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';

interface ClassicSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Track width; default fills parent via flex */
  width?: number | string;
}

/**
 * Windows Classic trackbar: inset groove + square outset thumb.
 * No blue Material/iOS circular thumbs.
 */
export function ClassicSlider({
  min,
  max,
  value,
  onChange,
  disabled = false,
  width = '100%',
}: ClassicSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const range = Math.max(1, max - min);
  const ratio = (Math.min(max, Math.max(min, value)) - min) / range;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return value;
      const rect = el.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.round(min + x * range);
    },
    [min, range, value]
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(valueFromClientX(e.clientX));
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || e.buttons !== 1) return;
    onChange(valueFromClientX(e.clientX));
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(Math.max(min, value - 1));
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(Math.min(max, value + 1));
        }
      }}
      style={{
        position: 'relative',
        width,
        height: '22px',
        flex: width === '100%' ? 1 : undefined,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        userSelect: 'none',
      }}
    >
      {/* Groove */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '9px',
          height: '4px',
          background: '#c0c0c0',
          border: '1px solid',
          borderColor: '#808080 #dfdfdf #dfdfdf #808080',
          boxSizing: 'border-box',
        }}
      />
      {/* Thumb */}
      <div
        style={{
          position: 'absolute',
          left: `calc(${ratio * 100}% - 6px)`,
          top: '2px',
          width: '12px',
          height: '18px',
          background: '#c0c0c0',
          border: '2px outset #dfdfdf',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
