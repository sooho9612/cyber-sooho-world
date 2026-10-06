import type { MarqueeSettings } from '../types';

interface MarqueeBannerProps {
  settings: MarqueeSettings;
}

/**
 * Horizontal 현수막 — text enters from the far right (sushi-belt),
 * then scrolls off to the left. speed 1–10. Optional rainbow hue cycle.
 */
export function MarqueeBanner({ settings }: MarqueeBannerProps) {
  const durationSec = 22 / Math.max(1, settings.speed);
  const text = settings.text || '가을을 만끽해요~~';
  const rainbow = Boolean(settings.rainbow);
  const fontSize = Math.max(10, Math.min(32, settings.fontSize || 14));
  const barHeight = Math.max(28, fontSize + 14);

  return (
    <div
      className="marquee-banner"
      style={{
        width: '100%',
        marginBottom: '10px',
        border: '2px inset #808080',
        background: settings.backgroundColor,
        color: rainbow ? undefined : settings.textColor,
        overflow: 'hidden',
        height: `${barHeight}px`,
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <style>
        {`
          @keyframes marquee-enter-rtl {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          @keyframes marquee-rainbow-hue {
            0% { color: hsl(0, 100%, 50%); }
            16.6% { color: hsl(60, 100%, 50%); }
            33.3% { color: hsl(120, 100%, 50%); }
            50% { color: hsl(180, 100%, 50%); }
            66.6% { color: hsl(240, 100%, 50%); }
            83.3% { color: hsl(300, 100%, 50%); }
            100% { color: hsl(360, 100%, 50%); }
          }
          .marquee-sushi {
            display: inline-block;
            padding-left: 100%;
            box-sizing: content-box;
            will-change: transform, color;
            animation-name: marquee-enter-rtl;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          .marquee-sushi.marquee-rainbow {
            animation-name: marquee-enter-rtl, marquee-rainbow-hue;
            animation-timing-function: linear, linear;
            animation-iteration-count: infinite, infinite;
          }
        `}
      </style>
      <div
        className={`marquee-sushi${rainbow ? ' marquee-rainbow' : ''}`}
        style={{
          animationDuration: rainbow ? `${durationSec}s, 3s` : `${durationSec}s`,
          fontSize: `${fontSize}px`,
          fontWeight: settings.bold ? 'bold' : 'normal',
          fontStyle: settings.italic ? 'italic' : 'normal',
          textDecoration: settings.underline ? 'underline' : 'none',
          lineHeight: `${barHeight - 4}px`,
          paddingTop: '0px',
        }}
      >
        {text}
      </div>
    </div>
  );
}
