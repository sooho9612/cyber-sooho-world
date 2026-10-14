import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Save, Trash2 } from 'lucide-react';
import { ASSETS } from '../../config/assets';
import { useAuthContext } from '../../context/AuthContext';
import { useLocale } from '../../i18n/LocaleContext';
import { classicAlert, classicConfirm } from '../../lib/messageBox';
import {
  clampBubbleFontZoom,
  layoutPlazaBubbles,
  plazaStageScale,
  readBubbleFontZoom,
  writeBubbleFontZoom,
  PLAZA_AVATAR_BASE,
  PLAZA_BUBBLE_FONT_BASE,
  PLAZA_BUBBLE_FONT_ZOOM_MAX,
  PLAZA_BUBBLE_FONT_ZOOM_MIN,
  PLAZA_BUBBLE_FONT_ZOOM_STEP,
  PLAZA_BUBBLE_MAX,
  type BubbleTail,
} from '../../lib/plazaGeometry';
import { usePlazaPresence } from '../../hooks/usePlazaPresence';
import { SECTION_CONTENT_MIN_HEIGHT, SECTION_MIN_H_CLASS } from '../shared/KeepAlivePanels';

const chromeBtn: CSSProperties = {
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  padding: '4px 10px',
  fontSize: '12px',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  cursor: 'pointer',
  minHeight: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const zoomBtn: CSSProperties = {
  width: '22px',
  height: '22px',
  padding: 0,
  background: '#c0c0c0',
  border: '2px outset #dfdfdf',
  fontSize: '14px',
  fontWeight: 'bold',
  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
  lineHeight: 1,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#000',
};

function bubbleTailSpans(tail: BubbleTail, scale: number) {
  const s = (n: number) => Math.max(2, Math.round(n * scale));
  if (tail === 'bottom') {
    return (
      <>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            bottom: `-${s(10)}px`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: `${s(8)}px solid transparent`,
            borderRight: `${s(8)}px solid transparent`,
            borderTop: `${s(10)}px solid #000`,
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            bottom: `-${s(7)}px`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: `${s(6)}px solid transparent`,
            borderRight: `${s(6)}px solid transparent`,
            borderTop: `${s(8)}px solid #fff`,
          }}
        />
      </>
    );
  }
  if (tail === 'left') {
    return (
      <>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: `-${s(10)}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: `${s(8)}px solid transparent`,
            borderBottom: `${s(8)}px solid transparent`,
            borderRight: `${s(10)}px solid #000`,
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: `-${s(7)}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: `${s(6)}px solid transparent`,
            borderBottom: `${s(6)}px solid transparent`,
            borderRight: `${s(8)}px solid #fff`,
          }}
        />
      </>
    );
  }
  return (
    <>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: `-${s(10)}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: `${s(8)}px solid transparent`,
          borderBottom: `${s(8)}px solid transparent`,
          borderLeft: `${s(10)}px solid #000`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: `-${s(7)}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: `${s(6)}px solid transparent`,
          borderBottom: `${s(6)}px solid transparent`,
          borderLeft: `${s(8)}px solid #fff`,
        }}
      />
    </>
  );
}

const plazaFont =
  '"DungGeunMo", "ThinRounded", "Noto Sans KR", "Noto Sans", "Apple SD Gothic Neo", sans-serif';

interface PlazaTabProps {
  onRequestLogin?: () => void;
  /** Resolved plaza stage background URL (from Control Panel settings) */
  bgUrl?: string;
}

export function PlazaTab({ onRequestLogin, bgUrl }: PlazaTabProps) {
  const { t } = useLocale();
  const auth = useAuthContext();
  const plazaRootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [bubbleDraft, setBubbleDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bubbleFontZoom, setBubbleFontZoom] = useState(() => readBubbleFontZoom());

  const plaza = usePlazaPresence({
    userId: auth.user?.id,
    nickname: auth.profile?.nickname,
  });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setStageSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (plaza.mine?.bubble_text != null) {
      setBubbleDraft(plaza.mine.bubble_text);
    }
  }, [plaza.mine?.bubble_text]);

  /** Yellow selection ring clears when clicking outside the plaza frame */
  useEffect(() => {
    if (!selectedId) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = plazaRootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setSelectedId(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [selectedId]);

  const stageScale = plazaStageScale(stageSize.w);
  const avatarPx = Math.max(20, Math.round(PLAZA_AVATAR_BASE * stageScale));
  const bubbleFontPx = Math.max(
    8,
    Math.round(PLAZA_BUBBLE_FONT_BASE * stageScale * bubbleFontZoom)
  );
  const bubbleUiScale = (PLAZA_BUBBLE_FONT_BASE * stageScale * bubbleFontZoom) / PLAZA_BUBBLE_FONT_BASE;

  const bubbleLayouts = useMemo(() => {
    const withText = plaza.list.filter((p) => p.bubble_text && p.bubble_text.trim());
    return layoutPlazaBubbles(
      withText.map((p) => ({
        id: p.user_id,
        x: p.x,
        y: p.y,
        text: p.bubble_text!.trim(),
      })),
      stageSize.w,
      stageSize.h,
      { avatarPx, bubbleFontPx }
    );
  }, [avatarPx, bubbleFontPx, plaza.list, stageSize.h, stageSize.w]);

  const bumpBubbleFont = (dir: 1 | -1) => {
    setBubbleFontZoom((prev) =>
      writeBubbleFontZoom(clampBubbleFontZoom(prev + dir * PLAZA_BUBBLE_FONT_ZOOM_STEP))
    );
  };

  const layoutById = useMemo(() => {
    const m = new Map(bubbleLayouts.map((b) => [b.id, b]));
    return m;
  }, [bubbleLayouts]);

  const handleStagePointer = useCallback(
    async (clientX: number, clientY: number) => {
      const el = stageRef.current;
      if (!el) return;
      if (!auth.isLoggedIn || !auth.user) {
        void classicAlert(t('plaza.loginToPlace'), t('common.alert'), 'warning');
        onRequestLogin?.();
        return;
      }
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      setBusy(true);
      try {
        const result = await plaza.upsertPosition({ x, y });
        if (result === 'crowded') {
          void classicAlert(t('plaza.tooCrowded'), t('common.alert'), 'warning');
        } else if (result === 'error') {
          void classicAlert(t('plaza.saveFailed'), t('common.alert'), 'error');
        }
      } finally {
        setBusy(false);
      }
    },
    [auth.isLoggedIn, auth.user, onRequestLogin, plaza, t]
  );

  const saveBubble = async () => {
    if (!auth.isLoggedIn) {
      void classicAlert(t('plaza.loginToPlace'), t('common.alert'), 'warning');
      onRequestLogin?.();
      return;
    }
    setBusy(true);
    try {
      const result = await plaza.upsertBubble(bubbleDraft);
      if (result === 'needPlace') {
        void classicAlert(t('plaza.needPlace'), t('common.alert'), 'warning');
      } else if (result === 'error') {
        void classicAlert(t('plaza.saveFailed'), t('common.alert'), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteMyBubble = async () => {
    if (!(await classicConfirm(t('plaza.deleteBubbleConfirm'), t('common.confirm'), 'warning'))) {
      return;
    }
    setBusy(true);
    try {
      const result = await plaza.clearBubble();
      if (result === 'ok') setBubbleDraft('');
      else void classicAlert(t('plaza.saveFailed'), t('common.alert'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const adminRemove = async (userId: string) => {
    if (!(await classicConfirm(t('plaza.adminRemoveConfirm'), t('common.confirm'), 'warning'))) {
      return;
    }
    setBusy(true);
    try {
      const result = await plaza.removePresence(userId);
      if (result === 'error') {
        void classicAlert(t('plaza.saveFailed'), t('common.alert'), 'error');
      } else {
        setSelectedId(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const remaining = PLAZA_BUBBLE_MAX - [...bubbleDraft].length;

  return (
    <div
      className={SECTION_MIN_H_CLASS}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        minHeight: SECTION_CONTENT_MIN_HEIGHT,
        fontFamily: plazaFont,
      }}
    >
      <div
        ref={plazaRootRef}
        style={{
          width: '100%',
          maxWidth: '752px',
          margin: '0 auto',
          border: '1px solid #000',
          boxSizing: 'border-box',
          background: '#c0c0c0',
        }}
      >
      <div
        ref={stageRef}
        role="application"
        aria-label={t('plaza.title')}
        onClick={(e) => {
          if (busy) return;
          setSelectedId(null);
          void handleStagePointer(e.clientX, e.clientY);
        }}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '800 / 520',
          border: 'none',
          background: '#000',
          overflow: 'hidden',
          cursor: auth.isLoggedIn ? 'crosshair' : 'default',
          userSelect: 'none',
          touchAction: 'manipulation',
          boxSizing: 'border-box',
          lineHeight: 0,
        }}
      >
        <img
          src={bgUrl || ASSETS.plazaBgHalloween}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />

        {plaza.list.map((p) => {
          const isMine = p.user_id === auth.user?.id;
          const isSelected = selectedId === p.user_id;
          const bubble = p.bubble_text?.trim()
            ? layoutById.get(p.user_id)
            : undefined;
          return (
            <div key={p.user_id}>
              {bubble && p.bubble_text && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${bubble.leftPct}%`,
                    top: `${bubble.topPct}%`,
                    transform: 'translate(-50%, 0)',
                    zIndex: isSelected ? 3500 : bubble.z,
                    maxWidth: '42%',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      background: '#fff',
                      border: `${Math.max(1, Math.round(2 * bubbleUiScale))}px solid #000`,
                      boxShadow: `${Math.max(1, Math.round(2 * bubbleUiScale))}px ${Math.max(1, Math.round(2 * bubbleUiScale))}px 0 #808080`,
                      padding: `${Math.max(2, Math.round(4 * bubbleUiScale))}px ${Math.max(3, Math.round(8 * bubbleUiScale))}px`,
                      fontSize: `${bubbleFontPx}px`,
                      lineHeight: 1.3,
                      color: '#000',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontFamily: plazaFont,
                    }}
                  >
                    {p.bubble_text}
                    {bubbleTailSpans(bubble.tail, bubbleUiScale)}
                  </div>
                </div>
              )}

              <button
                type="button"
                title={p.nickname}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(p.user_id);
                }}
                style={{
                  position: 'absolute',
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  zIndex: 4000 + Math.round(p.y * 1000) + (isSelected ? 500 : 0),
                  background: 'transparent',
                  border: isSelected ? '1px dotted #ffff00' : '1px solid transparent',
                  padding: 0,
                  cursor: 'pointer',
                  width: avatarPx,
                  height: avatarPx,
                }}
              >
                <img
                  src={ASSETS.plazaAvatar}
                  alt=""
                  width={avatarPx}
                  height={avatarPx}
                  draggable={false}
                  style={{
                    width: avatarPx,
                    height: avatarPx,
                    imageRendering: 'pixelated',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: `${Math.max(1, Math.round(2 * stageScale))}px`,
                    fontSize: `${Math.max(10, Math.round(15 * stageScale))}px`,
                    color: '#fff',
                    textShadow: '1px 1px 0 #000',
                    background: isMine ? '#000080' : 'rgba(0,0,0,0.55)',
                    padding: `${Math.max(1, Math.round(1 * stageScale))}px ${Math.max(2, Math.round(4 * stageScale))}px`,
                    maxWidth: `${Math.round(90 * stageScale)}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: plazaFont,
                    lineHeight: 1.2,
                    pointerEvents: 'none',
                  }}
                >
                  {p.nickname}
                </span>
              </button>
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: '4px',
            bottom: '4px',
            zIndex: 6000,
            display: 'flex',
            gap: '3px',
            lineHeight: 'normal',
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            style={zoomBtn}
            title={t('plaza.fontSmaller')}
            aria-label={t('plaza.fontSmaller')}
            disabled={bubbleFontZoom <= PLAZA_BUBBLE_FONT_ZOOM_MIN + 1e-6}
            onClick={() => bumpBubbleFont(-1)}
          >
            −
          </button>
          <button
            type="button"
            style={zoomBtn}
            title={t('plaza.fontLarger')}
            aria-label={t('plaza.fontLarger')}
            disabled={bubbleFontZoom >= PLAZA_BUBBLE_FONT_ZOOM_MAX - 1e-6}
            onClick={() => bumpBubbleFont(1)}
          >
            +
          </button>
        </div>
      </div>

      {auth.isLoggedIn && (
        <div
          style={{
            border: 'none',
            borderTop: '1px solid #000',
            background: '#c0c0c0',
            padding: '6px',
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
            boxSizing: 'border-box',
            lineHeight: 'normal',
            fontSize: '12px',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: '140px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={bubbleDraft}
              maxLength={PLAZA_BUBBLE_MAX}
              disabled={busy}
              placeholder={t('plaza.bubblePlaceholder')}
              onChange={(e) => setBubbleDraft(e.target.value.slice(0, PLAZA_BUBBLE_MAX))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void saveBubble();
                }
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#fff',
                border: '2px inset #dfdfdf',
                padding: '6px 36px 6px 8px',
                fontSize: '14px',
                fontFamily: plazaFont,
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                color: remaining <= 3 ? '#a00' : '#808080',
                pointerEvents: 'none',
                fontFamily: plazaFont,
              }}
            >
              {Math.max(0, remaining)}
            </span>
          </div>
          <button type="button" style={chromeBtn} disabled={busy} onClick={() => void saveBubble()}>
            <Save size={14} strokeWidth={2} />
            {t('plaza.saveBubble')}
          </button>
          <button
            type="button"
            style={chromeBtn}
            disabled={busy || !plaza.mine?.bubble_text}
            onClick={() => void deleteMyBubble()}
          >
            <Trash2 size={14} strokeWidth={2} />
            {t('plaza.deleteBubble')}
          </button>
          {auth.isOwner && selectedId && selectedId !== auth.user?.id && (
            <button
              type="button"
              style={{ ...chromeBtn, color: '#800000' }}
              disabled={busy}
              onClick={() => void adminRemove(selectedId)}
            >
              {t('plaza.adminRemove')}
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
