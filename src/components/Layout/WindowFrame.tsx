import { ReactNode } from 'react';

const WINDOW_WIDTH = 'max-w-[800px]';
const WINDOW_MIN_HEIGHT = 'min-h-[600px]';

interface WindowFrameProps {
  children: ReactNode;
}

export function WindowFrame({ children }: WindowFrameProps) {
  return (
    <div
      className="min-h-screen desktop-bg bg-cover bg-center bg-fixed md:py-10 md:px-4 flex justify-center items-start"
      style={{
        // 바깥쪽: 윈도우 바탕화면 (Bliss)
        backgroundImage: 'url(https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/bg_008080.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-bg {
              background-image: none !important;
              padding: 0 !important;
            }
            .window-frame {
              border-width: 2px !important;
            }
          }
        `}
      </style>

      <div
        // 변경사항: flex flex-col 추가하여 하단 상태바 배치 준비
        className={`window-frame ${WINDOW_WIDTH} ${WINDOW_MIN_HEIGHT} w-full bg-cover bg-center bg-no-repeat flex flex-col relative`}
        style={{
          // 안쪽: 응용 프로그램 배경화면 (Sunrising)
          backgroundImage: 'url(https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/bg_008080.jpg)',
          
          // 테두리: Windows Classic 스타일 (4px)
          border: '4px solid',
          borderTopColor: '#dfdfdf',
          borderLeftColor: '#dfdfdf',
          borderBottomColor: '#404040',
          borderRightColor: '#404040',
          boxSizing: 'border-box'
        }}
      >
        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          {children}
        </div>

        {/* Status Bar (Always Fixed at Bottom) */}
        <div 
          style={{
            height: '26px',
            background: '#c0c0c0',
            borderTop: '1px solid #808080',
            display: 'flex',
            alignItems: 'center',
            padding: '2px 4px',
            gap: '4px',
            position: 'sticky', // 화면 하단에 고정
            bottom: 0,
            zIndex: 50,
            fontFamily: 'Tahoma, sans-serif',
            userSelect: 'none'
          }}
        >
          {/* Left Panel: Status Info */}
          <div style={{
            flex: 1,
            height: '18px',
            border: '1px solid',
            borderColor: '#808080 #dfdfdf #dfdfdf #808080', // Inset effect
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px',
            gap: '6px',
            background: '#c0c0c0'
          }}>
            <img 
              src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/internet01.gif" 
              alt="net" 
              style={{ height: '12px', width: 'auto' }} 
            />
            <span style={{ fontSize: '11px', color: 'black' }}>Status : Online</span>
          </div>

          {/* Right Panel 1 (Decorative) */}
          <div style={{
            width: '20px',
            height: '18px',
            border: '1px solid',
            borderColor: '#808080 #dfdfdf #dfdfdf #808080',
            background: '#c0c0c0'
          }}></div>

          {/* Right Panel 2 (Decorative) */}
          <div style={{
            width: '20px',
            height: '18px',
            border: '1px solid',
            borderColor: '#808080 #dfdfdf #dfdfdf #808080',
            background: '#c0c0c0'
          }}></div>
        </div>

      </div>
    </div>
  );
}