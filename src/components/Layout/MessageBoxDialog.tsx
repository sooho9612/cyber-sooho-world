import { useEffect, useRef, type CSSProperties, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';

export type MessageBoxKind = 'alert' | 'confirm' | 'prompt';
export type MessageBoxIcon = 'info' | 'question' | 'warning' | 'error';

export type MessageBoxRequest = {
  id: number;
  kind: MessageBoxKind;
  title: string;
  message: string;
  icon: MessageBoxIcon;
  defaultValue?: string;
  resolve: (value: boolean | string | null) => void;
};

const ICON_SRC: Record<MessageBoxIcon, string> = {
  info: `${import.meta.env.BASE_URL}icons/msg-info.png`,
  question: `${import.meta.env.BASE_URL}icons/msg-question.png`,
  warning: `${import.meta.env.BASE_URL}icons/msg-warning.png`,
  error: `${import.meta.env.BASE_URL}icons/msg-error.png`,
};

const chromeBtn: CSSProperties = {
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  padding: '6px 18px',
  fontSize: '13px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  cursor: 'pointer',
  minWidth: '75px',
  minHeight: '32px',
};

interface MessageBoxDialogProps {
  request: MessageBoxRequest | null;
}

export function MessageBoxDialog({ request }: MessageBoxDialogProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (request?.kind === 'prompt') {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [request?.id, request?.kind]);

  if (!request) return null;

  const close = (value: boolean | string | null) => {
    request.resolve(value);
  };

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (request.kind === 'prompt') {
      close(inputRef.current?.value ?? '');
      return;
    }
    close(true);
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
        zIndex: 20000,
        padding: '12px',
      }}
      onClick={() => close(request.kind === 'confirm' || request.kind === 'prompt' ? null : true)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={request.title}
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
          <span>{request.title}</span>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() =>
              close(request.kind === 'confirm' || request.kind === 'prompt' ? null : true)
            }
            style={{
              background: '#c0c0c0',
              border: '2px outset #dfdfdf',
              width: '18px',
              height: '18px',
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

        <form onSubmit={onSubmit} style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              marginBottom: request.kind === 'prompt' ? '12px' : '18px',
            }}
          >
            <img
              src={ICON_SRC[request.icon]}
              alt=""
              width={32}
              height={32}
              aria-hidden
              style={{
                width: '32px',
                height: '32px',
                flexShrink: 0,
                imageRendering: 'pixelated',
              }}
            />
            <div
              style={{
                fontSize: '13px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                paddingTop: '4px',
              }}
            >
              {request.message}
            </div>
          </div>

          {request.kind === 'prompt' && (
            <input
              ref={inputRef}
              defaultValue={request.defaultValue ?? ''}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#fff',
                border: '2px inset #dfdfdf',
                padding: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                marginBottom: '16px',
              }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {request.kind === 'confirm' || request.kind === 'prompt' ? (
              <>
                <button type="submit" style={chromeBtn}>
                  {t('common.ok')}
                </button>
                <button
                  type="button"
                  style={chromeBtn}
                  onClick={() => close(request.kind === 'prompt' ? null : false)}
                >
                  {t('common.cancel')}
                </button>
              </>
            ) : (
              <button type="submit" style={chromeBtn} autoFocus>
                {t('common.ok')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
