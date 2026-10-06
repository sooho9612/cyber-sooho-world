interface NavigationProps {
  activeTab: 'intro' | 'home' | 'diary' | 'guestbook' | 'food' | 'music' | 'movie' | 'travel' | 'toy';
  onTabChange: (tab: 'intro' | 'home' | 'diary' | 'guestbook' | 'food' | 'music' | 'movie' | 'travel' | 'toy') => void;
  isPlaying: boolean;
}

export function Navigation({ activeTab, onTabChange, isPlaying }: NavigationProps) {
  // 버튼 스타일 정의
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
    color: 'black', // [수정] 기본 색상을 버튼에 지정 (평소엔 블랙)
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
    color: 'inherit', // [수정] 부모(버튼)의 색상을 따라가도록 변경 -> 호버 시 흰색 적용됨
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
          gap: '2px' 
        }}
      >
        {/* 공지 (Notice) */}
        <button 
          onClick={() => onTabChange('home')} 
          style={buttonStyle(activeTab === 'home')}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
          onMouseUp={(e) => e.currentTarget.style.border = activeTab === 'home' ? '2px inset #dfdfdf' : '2px outset #dfdfdf'}
        >
          <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/tap/notice.png" alt="공지" style={iconStyle} />
          <span style={textStyle}>공지</span>
        </button>

        {/* 음악 (Music) */}
        <button 
          onClick={() => onTabChange('music')} 
          style={{
            ...buttonStyle(activeTab === 'music'),
            ...(isPlaying ? {
              background: 'linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
              backgroundSize: '1200% 1200%',
              animation: 'rainbow-move 4s ease infinite',
              textShadow: '0px 0px 2px white'
            } : {})
          }}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
          onMouseUp={(e) => e.currentTarget.style.border = activeTab === 'music' ? '2px inset #dfdfdf' : '2px outset #dfdfdf'}
        >
          <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/tap/music.png" alt="음악" style={iconStyle} />
          <span style={textStyle}>음악</span>
        </button>

        {/* 방명록 (Guestbook) */}
        <button 
          onClick={() => onTabChange('guestbook')} 
          style={buttonStyle(activeTab === 'guestbook')}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
          onMouseUp={(e) => e.currentTarget.style.border = activeTab === 'guestbook' ? '2px inset #dfdfdf' : '2px outset #dfdfdf'}
        >
          <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/tap/guestbook.png" alt="방명록" style={iconStyle} />
          <span style={textStyle}>방명록</span>
        </button>

        {/* 기록 (Diary) */}
        <button 
          onClick={() => onTabChange('diary')} 
          style={buttonStyle(activeTab === 'diary')}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
          onMouseUp={(e) => e.currentTarget.style.border = activeTab === 'diary' ? '2px inset #dfdfdf' : '2px outset #dfdfdf'}
        >
          <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/tap/entries.png" alt="기록" style={iconStyle} />
          <span style={textStyle}>기록</span>
        </button>

        {/* 장난감 (Toy) */}
        <button 
          onClick={() => onTabChange('toy')} 
          style={buttonStyle(activeTab === 'toy')}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
          onMouseUp={(e) => e.currentTarget.style.border = activeTab === 'toy' ? '2px inset #dfdfdf' : '2px outset #dfdfdf'}
        >
          <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/toybox/toybox.png" alt="장난감" style={iconStyle} />
          <span style={textStyle}>장난감</span>
        </button>
      </div>
    </>
  );
}