import { ReactNode, type CSSProperties } from 'react';
import { ASSETS } from '../../config/assets';

const WINDOW_WIDTH = 'max-w-[800px]';
/** Floor height so classic window doesn't collapse when switching short/tall tabs */
const WINDOW_MIN_HEIGHT = 'min-h-[640px]';

interface WindowFrameProps {
  children: ReactNode;
  /** Outer desktop background styles only (.desktop-bg) */
  desktopStyle?: CSSProperties;
}

export function WindowFrame({ children, desktopStyle }: WindowFrameProps) {
  const outerStyle: CSSProperties = {
    backgroundImage: `url(${ASSETS.bgTeal})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    ...desktopStyle,
  };

  return (
    <div
      className="min-h-screen desktop-bg bg-cover bg-center bg-fixed md:py-10 md:px-4 flex justify-center items-start"
      style={outerStyle}
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
        className={`window-frame ${WINDOW_WIDTH} ${WINDOW_MIN_HEIGHT} w-full bg-cover bg-center bg-no-repeat flex flex-col relative`}
        style={{
          // 안쪽: 응용 프로그램 배경화면 (기존 유지 — 이번 설정 대상 아님)
          backgroundImage: `url(${ASSETS.bgTeal})`,
          border: '4px solid',
          borderTopColor: '#dfdfdf',
          borderLeftColor: '#dfdfdf',
          borderBottomColor: '#404040',
          borderRightColor: '#404040',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: 1 }}>
          {children}
        </div>

        <div
          style={{
            height: '26px',
            background: '#c0c0c0',
            borderTop: '1px solid #808080',
            display: 'flex',
            alignItems: 'center',
            padding: '2px 4px',
            gap: '4px',
            position: 'sticky',
            bottom: 0,
            zIndex: 50,
            fontFamily: 'Tahoma, sans-serif',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '18px',
              border: '1px solid',
              borderColor: '#808080 #dfdfdf #dfdfdf #808080',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              gap: '6px',
              background: '#c0c0c0',
            }}
          >
            <img
              src={ASSETS.internetGif}
              alt="net"
              style={{ height: '12px', width: 'auto' }}
            />
            <span style={{ fontSize: '11px', color: 'black' }}>Status : Online</span>
          </div>

          <div
            style={{
              width: '20px',
              height: '18px',
              border: '1px solid',
              borderColor: '#808080 #dfdfdf #dfdfdf #808080',
              background: '#c0c0c0',
            }}
          />

          <div
            style={{
              width: '20px',
              height: '18px',
              border: '1px solid',
              borderColor: '#808080 #dfdfdf #dfdfdf #808080',
              background: '#c0c0c0',
            }}
          />
        </div>
      </div>
    </div>
  );
}
