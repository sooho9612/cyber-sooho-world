import { useEffect, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_MARQUEE } from '../../hooks/useMarqueeSettings';
import type { MarqueeSettings } from '../../types';
import { ClassicSlider } from './ClassicSlider';
import { ColorPickerDialog } from './ColorPickerDialog';

interface MarqueeSettingsDialogProps {
  open: boolean;
  draft: MarqueeSettings;
  onClose: () => void;
  onSave: (next: MarqueeSettings) => void | Promise<void>;
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

type ColorTarget = 'backgroundColor' | 'textColor' | null;

export function MarqueeSettingsDialog({
  open,
  draft,
  onClose,
  onSave,
}: MarqueeSettingsDialogProps) {
  const [local, setLocal] = useState<MarqueeSettings>(draft);
  const [busy, setBusy] = useState(false);
  const [colorTarget, setColorTarget] = useState<ColorTarget>(null);

  useEffect(() => {
    if (open) {
      setLocal(draft ?? DEFAULT_MARQUEE);
      setColorTarget(null);
    }
  }, [open, draft]);

  if (!open) return null;

  const persist = async () => {
    setBusy(true);
    try {
      await onSave(local);
      onClose();
    } catch {
      alert('저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const colorSwatch = (target: 'backgroundColor' | 'textColor', label: string) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '72px' }}>{label}</span>
      <button
        type="button"
        title={`${label} 선택`}
        onClick={() => setColorTarget(target)}
        style={{
          width: '40px',
          height: '24px',
          border: '2px inset #dfdfdf',
          background: local[target],
          padding: 0,
          cursor: 'pointer',
        }}
      />
      <button
        type="button"
        title="사용자 지정 색"
        aria-label={`${label} 사용자 지정`}
        onClick={() => setColorTarget(target)}
        style={{
          width: '18px',
          height: '18px',
          border: '1px solid #000',
          padding: 0,
          cursor: 'pointer',
          backgroundImage:
            'linear-gradient(135deg, #ff0000 0%, #ffff00 20%, #00ff00 40%, #00ffff 60%, #0000ff 80%, #ff00ff 100%)',
        }}
      />
      <span style={{ fontSize: '11px', color: '#404040' }}>{local[target]}</span>
    </label>
  );

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
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="현수막 속성"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
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
          <span>현수막 속성</span>
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

        <div style={{ padding: '14px' }}>
          <fieldset
            style={{
              border: '2px groove #dfdfdf',
              padding: '10px 12px',
              marginBottom: '12px',
            }}
          >
            <legend style={{ fontSize: '12px', padding: '0 4px' }}>표시</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '72px' }}>속도</span>
                <ClassicSlider
                  min={1}
                  max={10}
                  value={local.speed}
                  onChange={(speed) => setLocal({ ...local, speed })}
                />
                <span style={{ width: '24px', textAlign: 'right' }}>{local.speed}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '72px' }}>글자 크기</span>
                <ClassicSlider
                  min={10}
                  max={32}
                  value={local.fontSize || 14}
                  onChange={(fontSize) => setLocal({ ...local, fontSize })}
                />
                <span style={{ width: '32px', textAlign: 'right' }}>{local.fontSize || 14}</span>
              </div>
              {colorSwatch('backgroundColor', '배경색')}
              <div style={{ opacity: local.rainbow ? 0.45 : 1 }}>
                {colorSwatch('textColor', '글자색')}
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '2px',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(local.rainbow)}
                  onChange={(e) => setLocal({ ...local, rainbow: e.target.checked })}
                />
                <span>레인보우 글자</span>
                <span style={{ fontSize: '11px', color: '#404040' }}>
                  (채도 100% · Hue 순환)
                </span>
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '4px',
                  paddingTop: '6px',
                  borderTop: '1px solid #808080',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={local.bold !== false}
                    onChange={(e) => setLocal({ ...local, bold: e.target.checked })}
                  />
                  <b>굵게</b>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(local.underline)}
                    onChange={(e) => setLocal({ ...local, underline: e.target.checked })}
                  />
                  <span style={{ textDecoration: 'underline' }}>밑줄</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(local.italic)}
                    onChange={(e) => setLocal({ ...local, italic: e.target.checked })}
                  />
                  <i>기울임</i>
                </label>
              </div>
            </div>
          </fieldset>

          <div
            style={{
              border: '2px inset #808080',
              background: local.backgroundColor,
              color: local.rainbow ? undefined : local.textColor,
              minHeight: '28px',
              height: `${Math.max(28, (local.fontSize || 14) + 14)}px`,
              overflow: 'hidden',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              whiteSpace: 'nowrap',
            }}
          >
            {local.rainbow && (
              <style>
                {`
                  @keyframes marquee-preview-rainbow {
                    0% { color: hsl(0, 100%, 50%); }
                    50% { color: hsl(180, 100%, 50%); }
                    100% { color: hsl(360, 100%, 50%); }
                  }
                  .marquee-preview-rainbow {
                    animation: marquee-preview-rainbow 3s linear infinite;
                  }
                `}
              </style>
            )}
            <span
              className={local.rainbow ? 'marquee-preview-rainbow' : undefined}
              style={{
                fontSize: `${local.fontSize || 14}px`,
                fontWeight: local.bold !== false ? 'bold' : 'normal',
                fontStyle: local.italic ? 'italic' : 'normal',
                textDecoration: local.underline ? 'underline' : 'none',
              }}
            >
              {local.text || DEFAULT_MARQUEE.text}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              disabled={busy}
              style={chromeBtn}
              onClick={persist}
              onMouseDown={(e) => {
                e.currentTarget.style.border = '2px inset #dfdfdf';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.border = '2px outset #dfdfdf';
              }}
            >
              확인
            </button>
            <button
              type="button"
              disabled={busy}
              style={chromeBtn}
              onClick={onClose}
              onMouseDown={(e) => {
                e.currentTarget.style.border = '2px inset #dfdfdf';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.border = '2px outset #dfdfdf';
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>

      <ColorPickerDialog
        open={colorTarget !== null}
        color={colorTarget ? local[colorTarget] : '#000000'}
        onClose={() => setColorTarget(null)}
        onConfirm={(picked) => {
          if (colorTarget) {
            setLocal({ ...local, [colorTarget]: picked });
          }
          setColorTarget(null);
        }}
      />
    </div>
  );
}
