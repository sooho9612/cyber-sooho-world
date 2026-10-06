import { useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';

interface ControlPanelProps {
  open: boolean;
  onClose: () => void;
  onOpenCompressor: () => void;
  onOpenMarquee: () => void;
}

const items = [
  {
    id: 'compressor',
    label: 'Auto Compressor',
    icon: `${import.meta.env.BASE_URL}icons/compressor.ico`,
  },
  {
    id: 'marquee',
    label: '현수막',
    icon: `${import.meta.env.BASE_URL}icons/marquee.ico`,
  },
] as const;

export function ControlPanel({
  open,
  onClose,
  onOpenCompressor,
  onOpenMarquee,
}: ControlPanelProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!open) return null;

  const openItem = (id: string) => {
    if (id === 'compressor') onOpenCompressor();
    if (id === 'marquee') onOpenMarquee();
  };

  const iconBtn = (id: string): CSSProperties => ({
    width: '90px',
    background: 'transparent',
    border: selected === id ? '1px dotted #000' : '1px solid transparent',
    padding: '6px 4px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
    color: selected === id ? '#fff' : '#000',
  });

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
        aria-label="제어판"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '420px',
          maxWidth: '94vw',
          height: '320px',
          maxHeight: '80vh',
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
          <span>제어판</span>
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

        <div
          style={{
            background: '#c0c0c0',
            borderBottom: '1px solid #808080',
            padding: '2px 6px',
            fontSize: '12px',
            display: 'flex',
            gap: '12px',
            userSelect: 'none',
          }}
        >
          <span><u>F</u>ile</span>
          <span><u>E</u>dit</span>
          <span><u>V</u>iew</span>
          <span><u>H</u>elp</span>
        </div>

        <div
          style={{
            flex: 1,
            background: '#fff',
            border: '2px inset #808080',
            margin: '4px',
            padding: '16px',
            overflow: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            gap: '12px',
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              style={iconBtn(item.id)}
              onClick={() => setSelected(item.id)}
              onDoubleClick={() => openItem(item.id)}
            >
              <img
                src={item.icon}
                alt=""
                width={32}
                height={32}
                style={{
                  imageRendering: 'pixelated',
                  width: 32,
                  height: 32,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  background: selected === item.id ? '#000080' : 'transparent',
                  color: selected === item.id ? '#fff' : '#000',
                  padding: '1px 2px',
                  maxWidth: '84px',
                  wordBreak: 'break-word',
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div
          style={{
            height: '22px',
            borderTop: '1px solid #808080',
            display: 'flex',
            alignItems: 'center',
            padding: '0 6px',
            fontSize: '11px',
            background: '#c0c0c0',
          }}
        >
          {items.length} object(s)
        </div>
      </div>
    </div>
  );
}
