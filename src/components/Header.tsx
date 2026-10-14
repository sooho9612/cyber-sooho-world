import { useLocale } from '../i18n/LocaleContext';

interface HeaderProps {
  onBannerClick: () => void;
}

/**
 * FIGlet "Larry 3D" — Amiga/BBS 3D outline (closest match to ALF attachment).
 * Only SOOHO.LOVE. No stars, no "missing…", no CRT.
 */
/**
 * FIGlet "Larry 3D" — Amiga/BBS 3D outline (closest match to ALF attachment).
 * Only SOOHO.LOVE. No stars, no "missing…", no CRT.
 */
const ASCII_BANNER = [
  ' ____    _____   _____   __  __  _____        __       _____   __  __  ____',
  '/\\  _`\\ /\\  __`\\/\\  __`\\/\\ \\/\\ \\/\\  __`\\     /\\ \\     /\\  __`\\/\\ \\/\\ \\/\\  _`\\',
  '\\ \\,\\L\\_\\ \\ \\/\\ \\ \\ \\/\\ \\ \\ \\_\\ \\ \\ \\/\\ \\    \\ \\ \\    \\ \\ \\/\\ \\ \\ \\ \\ \\ \\ \\L\\_\\',
  ' \\/_\\__ \\\\ \\ \\ \\ \\ \\ \\ \\ \\ \\  _  \\ \\ \\ \\ \\    \\ \\ \\  __\\ \\ \\ \\ \\ \\ \\ \\ \\ \\  _\\L',
  '   /\\ \\L\\ \\ \\ \\_\\ \\ \\ \\_\\ \\ \\ \\ \\ \\ \\ \\_\\ \\  __\\ \\ \\L\\ \\\\ \\ \\_\\ \\ \\ \\_/ \\ \\ \\L\\ \\',
  '   \\ `\\____\\ \\_____\\ \\_____\\ \\_\\ \\_\\ \\_____\\/\\_\\\\ \\____/ \\ \\_____\\ `\\___/\\ \\____/',
  '    \\/_____/\\/_____/\\/_____/\\/_/\\/_/\\/_____/\\/_/ \\/___/   \\/_____/`\\/__/  \\/___/',
].join('\n');

export function Header({ onBannerClick }: HeaderProps) {
  const { t } = useLocale();

  return (
    <div style={{ marginBottom: '8px', width: '100%' }}>
      <style>
        {`
          .ascii-banner-btn {
            display: block;
            width: 100%;
            margin: 0;
            padding: 0;
            border: 2px inset #808080;
            background: #000;
            cursor: pointer;
            text-align: left;
            box-sizing: border-box;
            overflow: hidden;
          }
          .ascii-banner-btn:focus-visible {
            outline: 1px dotted #ffff00;
            outline-offset: 2px;
          }
          .ascii-banner-pre {
            margin: 0;
            padding: 12px 8px;
            background: #000;
            color: #39ff14;
            font-family: "Courier New", Courier, ui-monospace, monospace;
            font-size: clamp(5.5px, 1.4vw, 12px);
            line-height: 1.1;
            letter-spacing: 0;
            white-space: pre;
            overflow-x: auto;
            overflow-y: hidden;
            text-shadow: 0 0 3px rgba(57, 255, 20, 0.35);
            -webkit-text-size-adjust: 100%;
          }
          @media (max-width: 768px) {
            .ascii-banner-pre {
              font-size: clamp(4px, 1.55vw, 9px);
              padding: 8px 4px;
            }
          }
        `}
      </style>

      <button
        type="button"
        className="ascii-banner-btn"
        onClick={onBannerClick}
        aria-label={t('banner.aria')}
        title={t('banner.aria')}
      >
        <pre className="ascii-banner-pre">{ASCII_BANNER}</pre>
      </button>
    </div>
  );
}
