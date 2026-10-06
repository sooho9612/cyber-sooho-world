import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { X } from 'lucide-react';

interface ColorPickerDialogProps {
  open: boolean;
  color: string;
  onClose: () => void;
  onConfirm: (color: string) => void;
}

const SPECTRUM_W = 200;
const SPECTRUM_H = 186;
const LUM_W = 14;
const LUM_H = SPECTRUM_H;

const chromeBtn: CSSProperties = {
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  padding: '3px 16px',
  fontSize: '12px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  cursor: 'pointer',
  minWidth: '75px',
};

const fieldStyle: CSSProperties = {
  width: '40px',
  height: '18px',
  background: '#fff',
  border: '2px inset #dfdfdf',
  fontSize: '12px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  padding: '0 2px',
  boxSizing: 'border-box',
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '').trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned.padEnd(6, '0').slice(0, 6);
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** H/S/L in Win classic 0–240 scale */
function rgbToHsl240(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 240),
    s: Math.round(s * 240),
    l: Math.round(l * 240),
  };
}

function hsl240ToRgb(h: number, s: number, l: number) {
  const hn = clamp(h, 0, 240) / 240;
  const sn = clamp(s, 0, 240) / 240;
  const ln = clamp(l, 0, 240) / 240;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

/** HSV → RGB (h,s,v in 0..1) — matches Win color-field look better than HSL */
function hsvToRgb(h: number, s: number, v: number) {
  const hh = ((h % 1) + 1) % 1;
  const i = Math.floor(hh * 6);
  const f = hh * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0;
  let g = 0;
  let b = 0;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/** Win-classic hue(x) × sat(y) at full value — sat full at top, white at bottom */
function drawSpectrum(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const img = ctx.createImageData(width, height);
  const data = img.data;
  for (let y = 0; y < height; y++) {
    const s = 1 - y / (height - 1);
    for (let x = 0; x < width; x++) {
      const h = x / (width - 1);
      const { r, g, b } = hsvToRgb(h, s, 1);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Vertical bar: white → pure hue@sat → black (Win luminosity strip) */
function drawLuminance(canvas: HTMLCanvasElement, hue240: number, sat240: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const img = ctx.createImageData(width, height);
  const data = img.data;
  const h = hue240 / 240;
  const s = sat240 / 240;
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1);
    // top half: white → color, bottom half: color → black
    let r: number;
    let g: number;
    let b: number;
    if (t < 0.5) {
      const k = t * 2;
      const pure = hsvToRgb(h, s, 1);
      r = Math.round(255 + (pure.r - 255) * k);
      g = Math.round(255 + (pure.g - 255) * k);
      b = Math.round(255 + (pure.b - 255) * k);
    } else {
      const k = (t - 0.5) * 2;
      const pure = hsvToRgb(h, s, 1);
      r = Math.round(pure.r * (1 - k));
      g = Math.round(pure.g * (1 - k));
      b = Math.round(pure.b * (1 - k));
    }
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function ColorPickerDialog({ open, color, onClose, onConfirm }: ColorPickerDialogProps) {
  const [rgb, setRgb] = useState(() => hexToRgb(color || '#008080'));
  const [hsl, setHsl] = useState(() => {
    const { r, g, b } = hexToRgb(color || '#008080');
    return rgbToHsl240(r, g, b);
  });
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const lumRef = useRef<HTMLCanvasElement>(null);
  const spectrumWrapRef = useRef<HTMLDivElement>(null);
  const lumWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const next = hexToRgb(color || '#008080');
    setRgb(next);
    setHsl(rgbToHsl240(next.r, next.g, next.b));
  }, [open, color]);

  useEffect(() => {
    if (!open || !spectrumRef.current) return;
    drawSpectrum(spectrumRef.current);
  }, [open]);

  useEffect(() => {
    if (!open || !lumRef.current) return;
    drawLuminance(lumRef.current, hsl.h, hsl.s);
  }, [open, hsl.h, hsl.s]);

  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);

  const applyRgb = (r: number, g: number, b: number) => {
    const next = { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) };
    setRgb(next);
    setHsl(rgbToHsl240(next.r, next.g, next.b));
  };

  const applyHsl = (h: number, s: number, l: number) => {
    const nextHsl = { h: clamp(h, 0, 240), s: clamp(s, 0, 240), l: clamp(l, 0, 240) };
    setHsl(nextHsl);
    setRgb(hsl240ToRgb(nextHsl.h, nextHsl.s, nextHsl.l));
  };

  const pickFromSpectrum = (clientX: number, clientY: number) => {
    const el = spectrumWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);
    // Spectrum is HSV (V=1); keep current HSL luminosity after conversion
    const picked = hsvToRgb(x, 1 - y, 1);
    const nextHsl = rgbToHsl240(picked.r, picked.g, picked.b);
    applyHsl(nextHsl.h, nextHsl.s, hsl.l);
  };

  const pickLum = (clientY: number) => {
    const el = lumWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);
    applyHsl(hsl.h, hsl.s, Math.round((1 - y) * 240));
  };

  if (!open) return null;

  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const crossX = hsv.h * SPECTRUM_W;
  const crossY = (1 - hsv.s) * SPECTRUM_H;
  const lumY = (1 - hsl.l / 240) * LUM_H;

  const labelCell: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 11000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="색"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#c0c0c0',
          border: '3px outset #dfdfdf',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.45)',
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          color: '#000',
          width: '268px',
          maxWidth: '96vw',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            color: 'white',
            padding: '3px 4px 3px 8px',
            fontWeight: 'bold',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
          }}
        >
          <span>색</span>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            style={{
              background: '#c0c0c0',
              border: '2px outset #dfdfdf',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'default',
            }}
          >
            <X size={10} color="black" />
          </button>
        </div>

        <div style={{ padding: '10px 10px 8px' }}>
          {/* Spectrum + luminance */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
            <div
              ref={spectrumWrapRef}
              onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                pickFromSpectrum(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) pickFromSpectrum(e.clientX, e.clientY);
              }}
              style={{
                position: 'relative',
                width: SPECTRUM_W,
                height: SPECTRUM_H,
                border: '2px inset #808080',
                boxSizing: 'content-box',
                cursor: 'crosshair',
                flexShrink: 0,
                background: '#000',
              }}
            >
              <canvas
                ref={spectrumRef}
                width={SPECTRUM_W}
                height={SPECTRUM_H}
                style={{ display: 'block', width: SPECTRUM_W, height: SPECTRUM_H, imageRendering: 'auto' }}
              />
              {/* Classic crosshair */}
              <div
                style={{
                  position: 'absolute',
                  left: crossX,
                  top: crossY,
                  width: 0,
                  height: 0,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: -7,
                    top: -1,
                    width: 14,
                    height: 2,
                    background: '#000',
                    boxShadow: '0 0 0 1px #fff',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: -1,
                    top: -7,
                    width: 2,
                    height: 14,
                    background: '#000',
                    boxShadow: '0 0 0 1px #fff',
                  }}
                />
              </div>
            </div>

            <div
              ref={lumWrapRef}
              onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                pickLum(e.clientY);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) pickLum(e.clientY);
              }}
              style={{
                position: 'relative',
                width: LUM_W + 10,
                height: LUM_H,
                flexShrink: 0,
                cursor: 'ns-resize',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: LUM_W,
                  height: LUM_H,
                  border: '2px inset #808080',
                  boxSizing: 'content-box',
                  background: '#000',
                }}
              >
                <canvas
                  ref={lumRef}
                  width={LUM_W}
                  height={LUM_H}
                  style={{ display: 'block', width: LUM_W, height: LUM_H }}
                />
              </div>
              {/* Arrow on the right of the bar */}
              <div
                style={{
                  position: 'absolute',
                  left: LUM_W + 4,
                  top: lumY,
                  marginTop: -5,
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderRight: '7px solid #000',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Preview + numeric fields below */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '8px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ width: '64px', flexShrink: 0 }}>
              <div
                style={{
                  width: '64px',
                  height: '40px',
                  border: '2px inset #808080',
                  background: hex,
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  fontSize: '11px',
                  marginTop: '2px',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                색|단색
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                columnGap: '8px',
                rowGap: '3px',
                flex: 1,
              }}
            >
              <label style={labelCell}>
                <span style={{ width: '28px' }}>색상</span>
                <input
                  style={fieldStyle}
                  value={hsl.h}
                  onChange={(e) => applyHsl(Number(e.target.value) || 0, hsl.s, hsl.l)}
                />
              </label>
              <label style={labelCell}>
                <span style={{ width: '28px' }}>빨강</span>
                <input
                  style={fieldStyle}
                  value={rgb.r}
                  onChange={(e) => applyRgb(Number(e.target.value) || 0, rgb.g, rgb.b)}
                />
              </label>
              <label style={labelCell}>
                <span style={{ width: '28px' }}>채도</span>
                <input
                  style={fieldStyle}
                  value={hsl.s}
                  onChange={(e) => applyHsl(hsl.h, Number(e.target.value) || 0, hsl.l)}
                />
              </label>
              <label style={labelCell}>
                <span style={{ width: '28px' }}>녹색</span>
                <input
                  style={fieldStyle}
                  value={rgb.g}
                  onChange={(e) => applyRgb(rgb.r, Number(e.target.value) || 0, rgb.b)}
                />
              </label>
              <label style={labelCell}>
                <span style={{ width: '28px' }}>명도</span>
                <input
                  style={fieldStyle}
                  value={hsl.l}
                  onChange={(e) => applyHsl(hsl.h, hsl.s, Number(e.target.value) || 0)}
                />
              </label>
              <label style={labelCell}>
                <span style={{ width: '28px' }}>파랑</span>
                <input
                  style={fieldStyle}
                  value={rgb.b}
                  onChange={(e) => applyRgb(rgb.r, rgb.g, Number(e.target.value) || 0)}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={chromeBtn}
              onClick={() => onConfirm(hex)}
              onMouseDown={(e) => {
                e.currentTarget.style.border = '2px inset #dfdfdf';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.border = '2px outset #dfdfdf';
              }}
            >
              확인
            </button>
            <button
              type="button"
              style={chromeBtn}
              onClick={onClose}
              onMouseDown={(e) => {
                e.currentTarget.style.border = '2px inset #dfdfdf';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.border = '2px outset #dfdfdf';
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
