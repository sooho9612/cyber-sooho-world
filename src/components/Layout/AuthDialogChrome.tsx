import type { CSSProperties, ReactNode } from 'react';
import { X } from 'lucide-react';

export const authChromeBtn: CSSProperties = {
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  padding: '8px 16px',
  fontSize: '13px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  cursor: 'pointer',
  minWidth: '75px',
  minHeight: '36px',
};

export const authInputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
  border: '2px inset #dfdfdf',
  padding: '8px',
  fontSize: '16px', // iOS zoom prevention
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
};

interface AuthDialogChromeProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function AuthDialogChrome({ title, onClose, children, width = 360 }: AuthDialogChromeProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 11000,
        padding: '12px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `${width}px`,
          maxWidth: '94vw',
          maxHeight: '90dvh',
          overflowY: 'auto',
          background: '#c0c0c0',
          border: '3px outset #dfdfdf',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.45)',
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          color: '#000',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            color: 'white',
            padding: '3px 4px 3px 8px',
            fontWeight: 'bold',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <span>{title}</span>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            style={{
              background: '#c0c0c0',
              border: '2px outset #dfdfdf',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'default',
            }}
          >
            <X size={10} color="black" />
          </button>
        </div>
        <div style={{ padding: '14px' }}>{children}</div>
      </div>
    </div>
  );
}
