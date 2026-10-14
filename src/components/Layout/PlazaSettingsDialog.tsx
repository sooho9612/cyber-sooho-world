import { useEffect, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_PLAZA_BG_ID,
  PLAZA_BACKGROUNDS,
  isPlazaBgId,
  type PlazaBgId,
} from '../../config/assets';
import { DEFAULT_PLAZA_SETTINGS } from '../../hooks/usePlazaSettings';
import { classicAlert } from '../../lib/messageBox';
import type { PlazaSettings } from '../../types';
import { useLocale } from '../../i18n/LocaleContext';

interface PlazaSettingsDialogProps {
  open: boolean;
  draft: PlazaSettings;
  onClose: () => void;
  onSave: (next: PlazaSettings) => void | Promise<void>;
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

export function PlazaSettingsDialog({
  open,
  draft,
  onClose,
  onSave,
}: PlazaSettingsDialogProps) {
  const { t } = useLocale();
  const [bgId, setBgId] = useState<PlazaBgId>(DEFAULT_PLAZA_BG_ID);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const id = draft?.bgId ?? DEFAULT_PLAZA_SETTINGS.bgId;
    setBgId(isPlazaBgId(id) ? id : DEFAULT_PLAZA_BG_ID);
  }, [open, draft]);

  if (!open) return null;

  const persist = async () => {
    setBusy(true);
    try {
      await onSave({ bgId });
      onClose();
    } catch {
      void classicAlert(t('msg.saveFailed'), t('common.alert'), 'error');
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
        zIndex: 10001,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={t('plaza.settingsTitle')}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
          maxWidth: '94vw',
          background: '#c0c0c0',
          border: '3px outset #dfdfdf',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.45)',
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          color: '#000',
          display: 'flex',
          flexDirection: 'column',
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
          <span>{t('plaza.settingsTitle')}</span>
          <button
            type="button"
            aria-label={t('common.close')}
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
            <X size={10} />
          </button>
        </div>

        <div style={{ padding: '10px 12px 8px' }}>
          <fieldset
            style={{
              border: '2px groove #dfdfdf',
              padding: '8px 10px 10px',
              margin: 0,
            }}
          >
            <legend style={{ fontSize: '12px', padding: '0 4px' }}>
              {t('plaza.settingsBg')}
            </legend>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              {PLAZA_BACKGROUNDS.map((bg) => {
                const selected = bgId === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    title={t(bg.labelKey)}
                    aria-label={t(bg.labelKey)}
                    aria-pressed={selected}
                    onClick={() => setBgId(bg.id)}
                    style={{
                      padding: '3px',
                      background: '#c0c0c0',
                      border: selected ? '2px inset #808080' : '2px outset #dfdfdf',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '800 / 520',
                        border: '1px solid #808080',
                        backgroundImage: `url(${bg.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        imageRendering: 'pixelated',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        textAlign: 'center',
                        background: selected ? '#000080' : 'transparent',
                        color: selected ? '#fff' : 'inherit',
                        padding: '1px 2px',
                      }}
                    >
                      {t(bg.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '4px 12px 10px',
          }}
        >
          <button type="button" style={chromeBtn} disabled={busy} onClick={() => void persist()}>
            {t('common.ok')}
          </button>
          <button type="button" style={chromeBtn} disabled={busy} onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
