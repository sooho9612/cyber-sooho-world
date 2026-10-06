import { useState, useEffect } from 'react';
import { Power, CircleOff } from 'lucide-react'; // 아이콘 추가

export function ToyTab() {
  const icons = [
    { 
      id: 1, 
      name: '내컴퓨터', 
      iconUrl: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/toybox/mycomputer.png' 
    },
    { 
      id: 2, 
      name: '인터넷 익스플로러', 
      iconUrl: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/toybox/internet.png' 
    },
    { 
      id: 3, 
      name: 'starcraft', 
      iconUrl: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/toybox/starcraft.png' 
    },
    { 
      id: 4, 
      name: '3D 핀볼', 
      iconUrl: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/toybox/pinball.png' 
    },
    { 
      id: 5, 
      name: '휴지통', 
      iconUrl: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/toybox/recyclebin.png' 
    },
  ];

  const [selectedIconId, setSelectedIconId] = useState<number | null>(null);
  
  // [New] 전원 상태 관리 ('OFF' | 'BOOTING' | 'ON')
  // 초기 상태는 'OFF' (검정 화면)
  const [powerState, setPowerState] = useState<'OFF' | 'BOOTING' | 'ON'>('OFF');

  const playClickSound = () => {
    const sound = new Audio('https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/SoundEffect/click.mp3');
    sound.volume = 0.5;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const handleIconClick = (id: number) => {
    if (powerState !== 'ON') return; // 켜져있을 때만 클릭 가능
    playClickSound();
    setSelectedIconId(id);
  };

  const handleIconDoubleClick = (name: string) => {
    if (powerState !== 'ON') return;
    playClickSound();
    if (name === '3D 핀볼') {
      window.open(
        'https://pinball.alula.me/', 
        'PinballGame', 
        'width=600,height=480,resizable=yes,scrollbars=no,status=no,toolbar=no'
      );
    } else {
      alert(`'${name}' 실행! (준비 중...)`);
    }
  };

  // [New] 시작(전원 ON) 핸들러
  const handlePowerOn = () => {
    playClickSound();
    if (powerState === 'OFF') {
      setPowerState('BOOTING');
      
      // 1초 뒤에 'ON' 상태로 변경 (이때 부트스크린 페이드 아웃 시작)
      setTimeout(() => {
        setPowerState('ON');
      }, 2500);
    }
  };

  // [New] 종료(전원 OFF) 핸들러
  const handlePowerOff = () => {
    playClickSound();
    if (powerState === 'ON') {
      setPowerState('OFF'); // 즉시 검정 화면으로 페이드 아웃(CSS transition)
    }
  };

  return (
    <div style={{
      width: '100%',
      aspectRatio: '4 / 3', 
      backgroundColor: '#386fa6', 
      position: 'relative',
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column', 
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      gap: '20px', 
      overflow: 'hidden', 
      fontFamily: '"DotMatrix", sans-serif'
    }}
    onClick={() => setSelectedIconId(null)}
    >
      
      {/* 1. 바탕화면 아이콘들 (기존 코드) */}
      {icons.map((icon) => (
        <div 
          key={icon.id}
          onClick={(e) => {
            e.stopPropagation();
            handleIconClick(icon.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleIconDoubleClick(icon.name);
          }}
          style={{
            width: '70px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: powerState === 'ON' ? 'pointer' : 'default', // 꺼져있으면 커서 변경
            gap: '4px',
            opacity: powerState === 'ON' ? 1 : 0.5 // 꺼져있으면 흐릿하게(어차피 검정화면에 가려짐)
          }}
        >
          <img 
            src={icon.iconUrl}
            alt={icon.name}
            style={{ 
              width: '32px', 
              height: '32px', 
              imageRendering: 'pixelated', 
              objectFit: 'contain',
              opacity: selectedIconId === icon.id ? 0.5 : 1 
            }}
          />
          
          <span style={{
            color: 'white',
            fontSize: '11px',
            textShadow: '1px 1px 0px black', 
            background: selectedIconId === icon.id ? '#000080' : 'transparent', 
            padding: '1px 2px',
            border: selectedIconId === icon.id ? '1px dotted yellow' : '1px solid transparent', 
            textAlign: 'center',
            lineHeight: '1.2',
            wordBreak: 'keep-all' 
          }}>
            {icon.name}
          </span>
        </div>
      ))}

      {/* 2. 부트 스크린 레이어 (Boot Screen) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url('https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/bootscreen.jpg')`,
        backgroundSize: '100% 100%', // 박스에 늘이기 (Stretch)
        backgroundRepeat: 'no-repeat',
        zIndex: 20, // 아이콘보다 위, 검정화면보다 아래(혹은 위 상황에 따라)
        opacity: powerState === 'BOOTING' ? 1 : 0, // BOOTING일 때 보이고, 그 외엔 투명
        transition: 'opacity 1s ease-out', // 1초 동안 서서히 사라짐
        pointerEvents: 'none' // 클릭 통과
      }} />

      {/* 3. 전원 OFF 검정 화면 레이어 (Black Screen) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        zIndex: 30, // 부트스크린보다 위 (꺼질 때 덮어야 함)
        opacity: powerState === 'OFF' ? 1 : 0, // OFF면 불투명(1), 아니면 투명(0)
        transition: 'opacity 1.5s ease-in-out', // 켜질 땐 부트스크린이 보이도록 빨리 투명해지거나 조정 가능하지만, 여기선 심플하게 페이드
        pointerEvents: powerState === 'OFF' ? 'auto' : 'none' // 꺼져있을 땐 클릭 차단
      }} />

      {/* 4. 우측 하단 컨트롤 패널 (시작/종료 버튼) */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        zIndex: 40, // 모든 레이어보다 최상위 (항상 눌려야 함)
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={handlePowerOn}
          title="시스템 시작 (Boot)"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#008000', // 녹색
            border: '2px outset #00ff00',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
          }}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #00ff00'}
          onMouseUp={(e) => e.currentTarget.style.border = '2px outset #00ff00'}
        >
          <Power size={18} color="white" />
        </button>

        <button
          onClick={handlePowerOff}
          title="시스템 종료 (Shutdown)"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#800000', // 적색
            border: '2px outset #ff0000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
          }}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #ff0000'}
          onMouseUp={(e) => e.currentTarget.style.border = '2px outset #ff0000'}
        >
          <CircleOff size={18} color="white" />
        </button>
      </div>

    </div>
  );
}