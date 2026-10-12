import { useState, type CSSProperties } from 'react';
import { useLocale } from '../../i18n/LocaleContext';

interface MenuBarProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onControlPanelClick: () => void;
  onHelpClick: () => void;
  isLoggedIn: boolean;
  isOwner: boolean;
  displayName?: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoutClick: () => void;
}

interface MenuItem {
  label: string;
  key: string;
  onClick?: () => void;
  hidden?: boolean;
}

const flagBtnBase: CSSProperties = {
  width: '28px',
  height: '22px',
  padding: '1px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: '#c0c0c0',
};

export function MenuBar({
  onHomeClick,
  onProfileClick,
  onSettingsClick,
  onControlPanelClick,
  onHelpClick,
  isLoggedIn,
  isOwner,
  displayName,
  onLoginClick,
  onSignupClick,
  onLogoutClick,
}: MenuBarProps) {
  const { locale, setLocale, t } = useLocale();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuItems: MenuItem[] = [
    { label: t('menu.home'), key: 'A', onClick: onHomeClick },
    {
      label: isLoggedIn
        ? `${t('menu.profile')}${displayName ? `(${displayName})` : ''}`
        : t('menu.profile'),
      key: 'M',
      onClick: isLoggedIn ? onProfileClick : onLoginClick,
    },
    { label: t('menu.login'), key: 'L', onClick: onLoginClick, hidden: isLoggedIn },
    { label: t('menu.signup'), key: 'R', onClick: onSignupClick, hidden: isLoggedIn },
    { label: t('menu.logout'), key: 'O', onClick: onLogoutClick, hidden: !isLoggedIn },
    { label: t('menu.settings'), key: 'S', onClick: onSettingsClick },
    { label: t('menu.controlPanel'), key: 'C', onClick: onControlPanelClick, hidden: !isOwner },
    { label: t('menu.help'), key: 'H', onClick: onHelpClick },
  ].filter((item) => !item.hidden);

  const flagSrc = (name: string) => `${import.meta.env.BASE_URL}icons/${name}`;

  return (
    <div
      className="flex w-full items-center"
      style={{
        background: '#c0c0c0',
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        userSelect: 'none',
        fontSize: '14px',
      }}
    >
      <div className="flex flex-wrap flex-1 min-w-0">
        {menuItems.map((item, index) => (
          <div
            key={`${item.key}-${item.label}`}
            className="px-2 py-1 cursor-pointer"
            style={{
              background: hoveredIndex === index ? '#000080' : '#c0c0c0',
              color: hoveredIndex === index ? 'white' : 'black',
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => item.onClick?.()}
          >
            {item.label}(<u>{item.key}</u>)
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        style={{ paddingRight: '6px', paddingLeft: '4px' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          title={t('menu.langKo')}
          aria-label={t('menu.langKo')}
          aria-pressed={locale === 'ko'}
          onClick={() => setLocale('ko')}
          style={{
            ...flagBtnBase,
            border: locale === 'ko' ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
          }}
        >
          <img
            src={flagSrc('south_korea.gif')}
            alt=""
            width={20}
            height={14}
            draggable={false}
            style={{ width: 20, height: 14, imageRendering: 'pixelated', display: 'block' }}
          />
        </button>
        <button
          type="button"
          title={t('menu.langEn')}
          aria-label={t('menu.langEn')}
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
          style={{
            ...flagBtnBase,
            border: locale === 'en' ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
          }}
        >
          <img
            src={flagSrc('united_kingdom.gif')}
            alt=""
            width={20}
            height={14}
            draggable={false}
            style={{ width: 20, height: 14, imageRendering: 'pixelated', display: 'block' }}
          />
        </button>
      </div>
    </div>
  );
}
