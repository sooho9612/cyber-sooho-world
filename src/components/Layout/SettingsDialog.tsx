import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import { storageUrl } from '../../config/assets';
import { supabase } from '../../supabaseClient';
import type { DesktopBg } from '../../types';
import { ColorPickerDialog } from './ColorPickerDialog';

interface SettingsDialogProps {
  open: boolean;
  draft: DesktopBg;
  onClose: () => void;
  onApply: (bg: DesktopBg) => void | Promise<void>;
  onConfirm: (bg: DesktopBg) => void | Promise<void>;
}

/** Win95 classic desktop color swatches */
const COLOR_SWATCHES = [
  '#008080',
  '#000080',
  '#800080',
  '#008000',
  '#808000',
  '#800000',
  '#000000',
  '#c0c0c0',
  '#0000ff',
  '#00ffff',
  '#ff00ff',
  '#00ff00',
  '#ffff00',
  '#ff0000',
  '#ffffff',
  '#808080',
];

/** Fallback when Storage list('user') is empty/fails */
const USER_WALLPAPER_FALLBACKS = [
  { name: 'atume.gif', url: storageUrl('Image/user/atume.gif') },
  { name: 'space.gif', url: storageUrl('Image/user/space.gif') },
  { name: 'bg_bliss.png', url: storageUrl('Image/user/bg_bliss.png') },
  { name: 'bg_sunrising_01.jpg', url: storageUrl('Image/user/bg_sunrising_01.jpg') },
];

interface WallpaperOption {
  name: string;
  url: string;
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

export function SettingsDialog({
  open,
  draft,
  onClose,
  onApply,
  onConfirm,
}: SettingsDialogProps) {
  const [local, setLocal] = useState<DesktopBg>(draft);
  const [wallpapers, setWallpapers] = useState<WallpaperOption[]>(USER_WALLPAPER_FALLBACKS);
  const [busy, setBusy] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (open) setLocal(draft);
  }, [open, draft]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.storage.from('Image').list('user', {
          limit: 40,
          sortBy: { column: 'name', order: 'asc' },
        });

        if (cancelled) return;

        if (error || !data?.length) {
          setWallpapers(USER_WALLPAPER_FALLBACKS);
          return;
        }

        const files = data.filter(
          (f) => f.name && /\.(jpe?g|png|gif|webp|bmp)$/i.test(f.name)
        );

        if (!files.length) {
          setWallpapers(USER_WALLPAPER_FALLBACKS);
          return;
        }

        setWallpapers(
          files.map((f) => ({
            name: f.name,
            url: storageUrl(`Image/user/${f.name}`),
          }))
        );
      } catch {
        if (!cancelled) setWallpapers(USER_WALLPAPER_FALLBACKS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const previewStyle = useMemo(() => {
    if (local.mode === 'color') {
      return {
        backgroundColor: local.color,
        backgroundImage: 'none' as const,
      };
    }
    const stretch = local.imageStyle === 'stretch';
    return {
      backgroundColor: '#008080',
      backgroundImage: `url(${local.imageUrl})`,
      backgroundSize: stretch ? '100% 100%' : 'auto',
      backgroundRepeat: stretch ? 'no-repeat' : 'repeat',
      backgroundPosition: 'center',
    };
  }, [local]);

  if (!open) return null;

  const setColorMode = (color: string) => {
    setLocal({ mode: 'color', color });
  };

  const setImageMode = (imageUrl: string, imageStyle: 'tile' | 'stretch' = 'stretch') => {
    setLocal({ mode: 'image', imageUrl, imageStyle });
  };

  const run = async (fn: (bg: DesktopBg) => void | Promise<void>) => {
    setBusy(true);
    try {
      await fn(local);
    } finally {
      setBusy(false);
    }
  };

  const currentColor = local.mode === 'color' ? local.color : '#008080';

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
        aria-label="디스플레이 속성"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
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
          <span>디스플레이 속성</span>
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

        <div style={{ padding: '12px 14px 10px' }}>
          <div
            style={{
              borderBottom: '2px solid #dfdfdf',
              marginBottom: '12px',
              display: 'flex',
            }}
          >
            <div
              style={{
                background: '#c0c0c0',
                border: '2px solid',
                borderColor: '#dfdfdf #808080 #c0c0c0 #dfdfdf',
                padding: '4px 14px',
                fontSize: '12px',
                marginBottom: '-2px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              배경
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <div
              style={{
                width: '220px',
                background: '#c0c0c0',
                border: '2px outset #dfdfdf',
                padding: '10px 10px 6px',
              }}
            >
              <div
                style={{
                  height: '120px',
                  border: '3px inset #808080',
                  ...previewStyle,
                }}
              />
              <div
                style={{
                  height: '14px',
                  margin: '0 auto',
                  width: '60%',
                  background: '#808080',
                  marginTop: '4px',
                }}
              />
              <div
                style={{
                  height: '8px',
                  margin: '0 auto',
                  width: '80%',
                  background: '#404040',
                }}
              />
            </div>
          </div>

          <fieldset
            style={{
              border: '2px groove #dfdfdf',
              padding: '8px 10px 10px',
              marginBottom: '10px',
            }}
          >
            <legend style={{ fontSize: '12px', padding: '0 4px' }}>단색</legend>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px' }}>색:</label>
              <button
                type="button"
                title="색 선택"
                onClick={() => setShowColorPicker(true)}
                style={{
                  width: '40px',
                  height: '24px',
                  border: '2px inset #dfdfdf',
                  background: currentColor,
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', color: '#404040' }}>
                {local.mode === 'color' ? local.color : '(그림 선택 중)'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center' }}>
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => setColorMode(c)}
                  style={{
                    width: '18px',
                    height: '18px',
                    background: c,
                    border:
                      local.mode === 'color' && local.color.toLowerCase() === c.toLowerCase()
                        ? '2px inset #000'
                        : '1px solid #000',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                />
              ))}
              <button
                type="button"
                title="사용자 지정 색"
                aria-label="사용자 지정 색"
                onClick={() => setShowColorPicker(true)}
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
            </div>
          </fieldset>

          <fieldset
            style={{
              border: '2px groove #dfdfdf',
              padding: '8px 10px 10px',
              marginBottom: '12px',
            }}
          >
            <legend style={{ fontSize: '12px', padding: '0 4px' }}>그림</legend>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '10px',
                maxHeight: '220px',
                overflowY: 'auto',
                paddingRight: '2px',
              }}
            >
              {wallpapers.map((wp) => {
                const selected = local.mode === 'image' && local.imageUrl === wp.url;
                return (
                  <button
                    key={wp.name}
                    type="button"
                    title={wp.name}
                    aria-label={wp.name}
                    onClick={() =>
                      setImageMode(
                        wp.url,
                        local.mode === 'image' ? local.imageStyle : 'stretch'
                      )
                    }
                    style={{
                      padding: '3px',
                      background: '#c0c0c0',
                      border: selected ? '2px inset #808080' : '2px outset #dfdfdf',
                      cursor: 'pointer',
                      height: '88px',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #808080',
                        backgroundImage: `url(${wp.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="radio"
                  name="imageStyle"
                  checked={local.mode === 'image' && local.imageStyle === 'tile'}
                  disabled={local.mode !== 'image'}
                  onChange={() => {
                    if (local.mode === 'image') {
                      setLocal({ ...local, imageStyle: 'tile' });
                    }
                  }}
                />
                바둑판식(타일)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="radio"
                  name="imageStyle"
                  checked={local.mode === 'image' && local.imageStyle === 'stretch'}
                  disabled={local.mode !== 'image'}
                  onChange={() => {
                    if (local.mode === 'image') {
                      setLocal({ ...local, imageStyle: 'stretch' });
                    }
                  }}
                />
                늘이기(스트레치)
              </label>
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              disabled={busy}
              style={chromeBtn}
              onClick={() => run(onConfirm)}
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
            <button
              type="button"
              disabled={busy}
              style={chromeBtn}
              onClick={() => run(onApply)}
              onMouseDown={(e) => {
                e.currentTarget.style.border = '2px inset #dfdfdf';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.border = '2px outset #dfdfdf';
              }}
            >
              적용
            </button>
          </div>
        </div>
      </div>

      <ColorPickerDialog
        open={showColorPicker}
        color={currentColor}
        onClose={() => setShowColorPicker(false)}
        onConfirm={(picked) => {
          setColorMode(picked);
          setShowColorPicker(false);
        }}
      />
    </div>
  );
}
