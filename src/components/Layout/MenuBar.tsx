import { useState } from 'react';

interface MenuBarProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onControlPanelClick: () => void;
  onHelpClick: () => void;
}

interface MenuItem {
  label: string;
  key: string;
  onClick?: () => void;
}

export function MenuBar({
  onHomeClick,
  onProfileClick,
  onSettingsClick,
  onControlPanelClick,
  onHelpClick,
}: MenuBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuItems: MenuItem[] = [
    { label: '홈', key: 'A', onClick: onHomeClick },
    { label: '내정보', key: 'M', onClick: onProfileClick },
    { label: '환경설정', key: 'S', onClick: onSettingsClick },
    { label: '제어판', key: 'C', onClick: onControlPanelClick },
    { label: '도움말', key: 'H', onClick: onHelpClick },
  ];

  return (
    <div
      className="flex w-full"
      style={{
        background: '#c0c0c0',
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        userSelect: 'none',
        fontSize: '14px',
      }}
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
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
  );
}