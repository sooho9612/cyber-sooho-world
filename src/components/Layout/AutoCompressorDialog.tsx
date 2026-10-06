import { useEffect, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_COMPRESSOR,
  loadCompressorSettings,
  saveCompressorSettings,
} from '../../utils/imageCompressor';
import type { CompressorSettings } from '../../types';

interface AutoCompressorDialogProps {
  open: boolean;
  onClose: () => void;
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

const fieldStyle: CSSProperties = {
  width: '80px',
  background: '#fff',
  border: '2px inset #dfdfdf',
  padding: '4px 6px',
  fontSize: '13px',
  fontFamily: 'inherit',
};

export function AutoCompressorDialog({ open, onClose }: AutoCompressorDialogProps) {
  const [draft, setDraft] = useState<CompressorSettings>(DEFAULT_COMPRESSOR);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    loadCompressorSettings(true)
      .then((s) => {
        if (!cancelled) setDraft(s);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const qualityPercent = Math.round(draft.quality * 100);

  const persist = async () => {
    setBusy(true);
    try {
      await saveCompressorSettings(draft);
      onClose();
    } catch {
      alert('저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
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
        zIndex: 11000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Auto Compressor"
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
          <span>Auto Compressor 속성</span>
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
          {loading ? (
            <p style={{ fontSize: '12px', color: '#666' }}>Loading...</p>
          ) : (
            <>
              <fieldset
                style={{
                  border: '2px groove #dfdfdf',
                  padding: '10px 12px',
                  marginBottom: '12px',
                }}
              >
                <legend style={{ fontSize: '12px', padding: '0 4px' }}>일반</legend>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                  />
                  업로드 시 자동 압축 사용
                </label>
              </fieldset>

              <fieldset
                style={{
                  border: '2px groove #dfdfdf',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  opacity: draft.enabled ? 1 : 0.55,
                }}
              >
                <legend style={{ fontSize: '12px', padding: '0 4px' }}>압축 옵션</legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ width: '100px' }}>최대 변 (px)</span>
                    <input
                      type="number"
                      min={32}
                      max={4096}
                      disabled={!draft.enabled}
                      value={draft.maxEdge}
                      onChange={(e) =>
                        setDraft({ ...draft, maxEdge: Number(e.target.value) || 300 })
                      }
                      style={fieldStyle}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ width: '100px' }}>품질 (%)</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      disabled={!draft.enabled}
                      value={qualityPercent}
                      onChange={(e) => {
                        const pct = Number(e.target.value) || 70;
                        setDraft({
                          ...draft,
                          quality: Math.max(0.1, Math.min(1, pct / 100)),
                        });
                      }}
                      style={fieldStyle}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '11px', color: '#404040', marginTop: '10px', lineHeight: 1.4 }}>
                  사이트 전체에 적용됩니다. 기본값: 300px / 70%.
                </p>
              </fieldset>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              disabled={busy || loading}
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
    </div>
  );
}
