import { useState, useEffect, useRef } from 'react';
import { Save, X } from 'lucide-react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { WindowsTitleBar } from './components/Layout/WindowsTitleBar';
import { MenuBar } from './components/Layout/MenuBar';
import { WindowFrame } from './components/Layout/WindowFrame';
import { IntroTab } from './components/tabs/IntroTab';
import { HomeTab } from './components/tabs/HomeTab';
import { DiaryTab } from './components/tabs/DiaryTab';
import { FoodTab } from './components/tabs/FoodTab';
import { GuestbookTab } from './components/tabs/GuestbookTab';
import { MusicTab } from './components/tabs/MusicTab';
import { MovieTab } from './components/tabs/MovieTab';
import { TravelTab } from './components/tabs/TravelTab';
import { ToyTab } from './components/tabs/ToyTab';
import { MusicTrack } from './types'; // types 파일 경로 확인 필요

function App() {
  // --- Audio Logic ---
  
  // [수정] 고정된 playlist 제거하고 State로 변경
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]); 
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 볼륨 초기값: 로컬 스토리지에서 불러오기
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('player_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- Tab Logic ---
  const [activeTab, setActiveTab] = useState<'intro' | 'home' | 'diary' | 'guestbook' | 'food' | 'music' | 'movie' | 'travel' | 'toy'>('intro');

  // --- Profile & Popup Logic ---
  const [userNickname, setUserNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    // 1. Load Nickname
    const savedNickname = localStorage.getItem('user_nickname');
    if (savedNickname) setUserNickname(savedNickname);
    else setShowProfilePopup(true);

    // 2. Audio Setup
    if (audioRef.current && playlist.length > 0) {
      // 현재 트랙이 유효한지 확인
      if (playlist[currentTrackIndex]) {
        audioRef.current.src = playlist[currentTrackIndex].url;
        audioRef.current.volume = volume;
        if (isPlaying) {
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }
    }

    // 3. Click Sound
    clickSoundRef.current = new Audio('https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/SoundEffect/click.mp3');
    clickSoundRef.current.volume = 0.5;
    const handleClick = () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [currentTrackIndex, playlist]); // playlist가 바뀌어도 실행되도록 추가

  // --- Audio Handlers ---
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current && playlist.length > 0) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true); 
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('player_volume', newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    handleNext(); 
  };

  // [New] MusicTab에서 플레이리스트를 변경하고 특정 곡을 재생하도록 요청하는 함수
  const handleSetPlaylist = (newTracks: MusicTrack[], startIndex: number = 0) => {
    setPlaylist(newTracks);
    setCurrentTrackIndex(startIndex);
    setIsPlaying(true);
  };

  // --- Profile Handlers ---
  const handleOpenProfile = () => { setTempNickname(userNickname); setShowProfilePopup(true); };
  const handleSaveProfile = () => {
    if (!tempNickname.trim()) { alert("닉네임을 입력해주세요!"); return; }
    const finalNickname = tempNickname.trim();
    setUserNickname(finalNickname);
    localStorage.setItem('user_nickname', finalNickname);
    setShowProfilePopup(false);
    alert(`반가워요, ${finalNickname}님! 설정이 저장되었습니다.`);
  };

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'DotMatrix';
            src: url('https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/ETC/DOTMATRI.TTF') format('truetype');
            font-weight: normal; font-style: normal;
          }
          body { font-family: "Courier New", Courier, monospace; }
          button:hover { background: #000080 !important; color: white !important; }
          @media (min-width: 801px) { .diary-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media (max-width: 800px) { .diary-grid { grid-template-columns: 1fr !important; } }
          .tab-container { display: flex; gap: 5px; }
          .tab-button { flex: 1; min-width: 0; padding: 10px 20px; fontSize: 14px; white-space: nowrap; }
          .sub-tab-container { display: flex; gap: 0px; margin-bottom: 20px; }
          .sub-tab-button { flex: 1; padding: 6px; background: #c0c0c0; border: 2px outset #dfdfdf; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; }
          .sub-tab-button:active { border: 2px inset #dfdfdf; }
        `}
      </style>

      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleAudioEnded} style={{ display: 'none' }} />

      <WindowFrame>
        <WindowsTitleBar />
        <MenuBar onHomeClick={() => setActiveTab('intro')} onProfileClick={handleOpenProfile} />

        <div className="content-area" style={{ padding: '24px' }}>
          <Header onBannerClick={() => setActiveTab('intro')} />
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            isPlaying={isPlaying} 
          />

          {activeTab === 'intro' && <IntroTab />}
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'diary' && <DiaryTab />}
          {activeTab === 'food' && <FoodTab />}
          {activeTab === 'guestbook' && <GuestbookTab userNickname={userNickname} />}
          
          {activeTab === 'music' && (
            <MusicTab 
              isPlaying={isPlaying} 
              currentTime={currentTime} 
              duration={duration} 
              formatTime={formatTime}
              onPlayPause={togglePlayPause}
              onStop={handleStop}
              onNext={handleNext}
              onPrev={handlePrev}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              currentTrackTitle={playlist[currentTrackIndex]?.title || "No Title"} // 안전하게 접근
              onSetPlaylist={handleSetPlaylist} // [New] Prop 전달
            />
          )}
          
          {activeTab === 'movie' && <MovieTab />}
          {activeTab === 'travel' && <TravelTab />}
          {activeTab === 'toy' && <ToyTab />}

          {showProfilePopup && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ width: '380px', background: '#c0c0c0', border: '3px outset #dfdfdf', boxShadow: '6px 6px 0px rgba(0,0,0,0.5)' }}>
                <div style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: 'white', padding: '4px 8px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>내 정보</span>
                  <button 
                    style={{
                      background: '#c0c0c0',
                      border: '2px outset #dfdfdf',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      cursor: 'default'
                    }}
                    onClick={() => {}} 
                  >
                    <X size={10} color="black" />
                  </button>
                </div>

                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6', fontWeight: 'bold', color: '#000' }}>
                    당신을 알려주세요!<br/>
                    <span style={{ fontSize: '12px', fontWeight: 'normal' }}>여기서 정한 닉네임으로 활동하게 됩니다.</span>
                  </p>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>NICKNAME:</label>
                    <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} placeholder="한글/영문 최대 8글자" maxLength={8} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '8px', width: '100%', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold', boxSizing: 'border-box' }} onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()} />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleSaveProfile} 
                      style={{ 
                        flex: 1, 
                        background: '#c0c0c0', 
                        border: '3px outset #dfdfdf', 
                        padding: '10px 0', 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }} 
                      onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} 
                      onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}
                    >
                      <Save size={14} /> 저장
                    </button>
                    <button 
                      onClick={() => setShowProfilePopup(false)} 
                      style={{ 
                        flex: 1, 
                        background: '#c0c0c0', 
                        border: '3px outset #dfdfdf', 
                        padding: '10px 0', 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }} 
                      onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} 
                      onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}
                    >
                      <X size={14} /> 취소
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>
                    * 이후 수정은 상단 메뉴에서 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#ffff00' }}>
            <p>~*~ since 2025.12.04 ~*~</p>
            <p>Best viewed in Internet Explorer 6.0 at 800x600</p>
          </div>
        </div>
      </WindowFrame>
    </>
  );
}

export default App;