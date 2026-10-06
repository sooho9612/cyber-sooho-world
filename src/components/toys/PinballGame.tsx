import { X } from 'lucide-react';

interface PinballGameProps {
  onClose: () => void;
}

export function PinballGame({ onClose }: PinballGameProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경 어둡게
      zIndex: 9999, // 최상위 레이어
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      
      {/* 핀볼 게임 창 */}
      <div 
        className="pinball-window"
        style={{
          backgroundColor: '#c0c0c0',
          border: '2px outset #dfdfdf',
          boxShadow: '10px 10px 20px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          width: '600px',
          height: '480px',
          maxWidth: '100%',
          maxHeight: '100%',
          position: 'relative' // 닫기 버튼 절대 위치 기준점
        }}
      >
        {/* 모바일 스타일링 */}
        <style>
          {`
            @media (max-width: 768px) {
              .pinball-window {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
              }
              .pinball-frame {
                touch-action: none; 
              }
            }
          `}
        </style>

        {/* 1. 커스텀 닫기 버튼 (타이틀바 대신 우측 상단에 띄움) */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            zIndex: 50, // Iframe 위에 표시되도록
            background: '#c0c0c0',
            border: '2px outset #dfdfdf',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0
          }}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
          onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
          title="Close Game"
        >
          <X size={14} color="black" />
        </button>

        {/* 2. 게임 영역 (Iframe) */}
        {/* 커스텀 타이틀바 div는 삭제하고 iframe을 바로 보여줍니다. */}
        <div style={{ flex: 1, background: 'black', position: 'relative' }}>
          <iframe
            className="pinball-frame"
            src="https://pinball.alula.me/" 
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
            title="3D Pinball"
            allow="autoplay; fullscreen"
          />
          
          {/* 로딩 팁 */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: '#666',
            fontSize: '10px',
            pointerEvents: 'none', 
            zIndex: 0
          }}>
            Controls: [Z] Left / [/] Right / [Space] Launch
          </div>
        </div>
      </div>
    </div>
  );
}