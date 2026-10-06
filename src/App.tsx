import { useState } from 'react';
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
import { ASSETS } from './config/assets';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useNickname } from './hooks/useNickname';
import type { AppTab } from './types';

function App() {
  const audio = useAudioPlayer();
  const profile = useNickname();
  const [activeTab, setActiveTab] = useState<AppTab>('intro');

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'DotMatrix';
            src: url('${ASSETS.fontDotMatrix}') format('truetype');
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

      <audio
        ref={audio.audioRef}
        onTimeUpdate={audio.handleTimeUpdate}
        onEnded={audio.handleAudioEnded}
        style={{ display: 'none' }}
      />

      <WindowFrame>
        <WindowsTitleBar />
        <MenuBar onHomeClick={() => setActiveTab('intro')} onProfileClick={profile.openProfile} />

        <div className="content-area" style={{ padding: '24px' }}>
          <Header onBannerClick={() => setActiveTab('intro')} />
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isPlaying={audio.isPlaying}
          />

          {activeTab === 'intro' && <IntroTab />}
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'diary' && <DiaryTab />}
          {activeTab === 'food' && <FoodTab />}
          {activeTab === 'guestbook' && <GuestbookTab userNickname={profile.userNickname} />}

          {activeTab === 'music' && (
            <MusicTab
              isPlaying={audio.isPlaying}
              currentTime={audio.currentTime}
              duration={audio.duration}
              formatTime={audio.formatTime}
              onPlayPause={audio.togglePlayPause}
              onStop={audio.handleStop}
              onNext={audio.handleNext}
              onPrev={audio.handlePrev}
              volume={audio.volume}
              onVolumeChange={audio.handleVolumeChange}
              currentTrackTitle={audio.playlist[audio.currentTrackIndex]?.title || 'No Title'}
              onSetPlaylist={audio.handleSetPlaylist}
            />
          )}

          {activeTab === 'movie' && <MovieTab />}
          {activeTab === 'travel' && <TravelTab />}
          {activeTab === 'toy' && <ToyTab />}

          {profile.showProfilePopup && (
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
                      cursor: 'default',
                    }}
                    onClick={() => {}}
                  >
                    <X size={10} color="black" />
                  </button>
                </div>

                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6', fontWeight: 'bold', color: '#000' }}>
                    당신을 알려주세요!<br />
                    <span style={{ fontSize: '12px', fontWeight: 'normal' }}>여기서 정한 닉네임으로 활동하게 됩니다.</span>
                  </p>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>NICKNAME:</label>
                    <input
                      type="text"
                      value={profile.tempNickname}
                      onChange={(e) => profile.setTempNickname(e.target.value)}
                      placeholder="한글/영문 최대 8글자"
                      maxLength={8}
                      style={{ background: 'white', border: '2px inset #dfdfdf', padding: '8px', width: '100%', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold', boxSizing: 'border-box' }}
                      onKeyDown={(e) => e.key === 'Enter' && profile.saveProfile()}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={profile.saveProfile}
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
                        gap: '6px',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.border = '3px inset #dfdfdf')}
                      onMouseUp={(e) => (e.currentTarget.style.border = '3px outset #dfdfdf')}
                    >
                      <Save size={14} /> 저장
                    </button>
                    <button
                      onClick={profile.closeProfile}
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
                        gap: '6px',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.border = '3px inset #dfdfdf')}
                      onMouseUp={(e) => (e.currentTarget.style.border = '3px outset #dfdfdf')}
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
