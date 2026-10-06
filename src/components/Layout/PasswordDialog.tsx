import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { X } from 'lucide-react';

interface PasswordDialogProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSuccess: () => void;
  /** Plain client-side gate password */
  expectedPassword: string;
}

const chromeBtn: CSSProperties = {
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  padding: '4px 16px',
  fontSize: '13px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  cursor: 'pointer',
  minWidth: '75px',
};

export function PasswordDialog({
  open,
  title = '제어판',
  onClose,
  onSuccess,
  expectedPassword,
}: PasswordDialogProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (value === expectedPassword) {
      onSuccess();
      return;
    }
    setError('비밀번호가 올바르지 않습니다.');
  };

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
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '320px',
          maxWidth: '94vw',
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
              width: '16px',
              height: '16px',
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

        <form onSubmit={submit} style={{ padding: '16px' }}>
          <p style={{ fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
            관리자 비밀번호를 입력하세요.
          </p>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
            비밀번호:
          </label>
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#fff',
              border: '2px inset #dfdfdf',
              padding: '6px 8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              marginBottom: '8px',
            }}
          />
          {error && (
            <p style={{ color: '#cc0000', fontSize: '12px', marginBottom: '8px' }}>{error}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="submit" style={chromeBtn}>
              확인
            </button>
            <button type="button" style={chromeBtn} onClick={onClose}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
