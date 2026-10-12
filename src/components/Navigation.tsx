import { ASSETS } from '../config/assets';
import { useLocale } from '../i18n/LocaleContext';
import type { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isPlaying: boolean;
}

export function Navigation({ activeTab, onTabChange, isPlaying }: NavigationProps) {
  const { t } = useLocale();

  const buttonStyle = (isActive: boolean) => ({
    flex: 1,
    background: isActive ? 'white' : '#c0c0c0',
    border: isActive ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
    padding: '6px 2px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: 0,
    color: 'black',
  });

  const iconStyle = {
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated' as const,
    objectFit: 'contain' as const,
  };

  const textStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'inherit',
    letterSpacing: '-0.5px',
  };

  return (
    <>
      <style>
        {`
          @keyframes rainbow-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <div
        className="main-tab-container"
        style={{
          display: 'flex',
          background: '#c0c0c0',
          border: '3px outset #dfdfdf',
          padding: '4px',
          marginBottom: '20px',
          maxWidth: '400px',
          width: '100%',
          margin: '0 auto 20px auto',
          boxSizing: 'border-box',
          gap: '2px',
        }}
      >
        <button
          onClick={() => onTabChange('home')}
          style={buttonStyle(activeTab === 'home')}
          onMouseDown={(e) => (e.currentTarget.style.border = '2px inset #dfdfdf')}
          onMouseUp={(e) =>
            (e.currentTarget.style.border =
              activeTab === 'home' ? '2px inset #dfdfdf' : '2px outset #dfdfdf')
          }
        >
          <img src={ASSETS.tabNotice} alt={t('nav.notice')} style={iconStyle} />
          <span style={textStyle}>{t('nav.notice')}</span>
        </button>

        <button
          onClick={() => onTabChange('music')}
          style={{
            ...buttonStyle(activeTab === 'music'),
            ...(isPlaying
              ? {
                  background:
                    'linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
                  backgroundSize: '1200% 1200%',
                  animation: 'rainbow-move 4s ease infinite',
                  textShadow: '0px 0px 2px white',
                }
              : {}),
          }}
          onMouseDown={(e) => (e.currentTarget.style.border = '2px inset #dfdfdf')}
          onMouseUp={(e) =>
            (e.currentTarget.style.border =
              activeTab === 'music' ? '2px inset #dfdfdf' : '2px outset #dfdfdf')
          }
        >
          <img src={ASSETS.tabMusic} alt={t('nav.music')} style={iconStyle} />
          <span style={textStyle}>{t('nav.music')}</span>
        </button>

        <button
          onClick={() => onTabChange('guestbook')}
          style={buttonStyle(activeTab === 'guestbook')}
          onMouseDown={(e) => (e.currentTarget.style.border = '2px inset #dfdfdf')}
          onMouseUp={(e) =>
            (e.currentTarget.style.border =
              activeTab === 'guestbook' ? '2px inset #dfdfdf' : '2px outset #dfdfdf')
          }
        >
          <img src={ASSETS.tabGuestbook} alt={t('nav.guestbook')} style={iconStyle} />
          <span style={textStyle}>{t('nav.guestbook')}</span>
        </button>

        <button
          onClick={() => onTabChange('diary')}
          style={buttonStyle(activeTab === 'diary')}
          onMouseDown={(e) => (e.currentTarget.style.border = '2px inset #dfdfdf')}
          onMouseUp={(e) =>
            (e.currentTarget.style.border =
              activeTab === 'diary' ? '2px inset #dfdfdf' : '2px outset #dfdfdf')
          }
        >
          <img src={ASSETS.tabEntries} alt={t('nav.diary')} style={iconStyle} />
          <span style={textStyle}>{t('nav.diary')}</span>
        </button>

        <button
          onClick={() => onTabChange('toy')}
          style={buttonStyle(activeTab === 'toy')}
          onMouseDown={(e) => (e.currentTarget.style.border = '2px inset #dfdfdf')}
          onMouseUp={(e) =>
            (e.currentTarget.style.border =
              activeTab === 'toy' ? '2px inset #dfdfdf' : '2px outset #dfdfdf')
          }
        >
          <img src={ASSETS.tabToybox} alt={t('nav.toys')} style={iconStyle} />
          <span style={textStyle}>{t('nav.toys')}</span>
        </button>
      </div>
    </>
  );
}
