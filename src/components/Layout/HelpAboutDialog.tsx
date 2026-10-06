import type { CSSProperties } from 'react';
import { ASSETS } from '../../config/assets';

interface HelpAboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const chromeBtn: CSSProperties = {
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  padding: '4px 22px',
  fontSize: '13px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  cursor: 'pointer',
  minWidth: '75px',
};

export function HelpAboutDialog({ open, onClose }: HelpAboutDialogProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-label="도움말"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '320px',
          maxWidth: '92vw',
          background: '#c0c0c0',
          border: '3px outset #dfdfdf',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.45)',
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          color: '#000',
          padding: '16px 18px 14px',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <img
            src={ASSETS.star}
            alt="즐겨찾기"
            width={32}
            height={32}
            style={{
              width: 32,
              height: 32,
              imageRendering: 'pixelated',
              flexShrink: 0,
              marginTop: 2,
            }}
          />
          <div
            style={{
              fontSize: '13px',
              lineHeight: 1.55,
              flex: 1,
              paddingTop: 2,
            }}
          >
            <div>sooho.love</div>
            <div>since 2025.12.04</div>
            <div>missing scent of human</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '18px' }}>
          <button
            type="button"
            autoFocus
            style={chromeBtn}
            onClick={onClose}
            onMouseDown={(e) => {
              e.currentTarget.style.border = '2px inset #dfdfdf';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.border = '2px outset #dfdfdf';
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
