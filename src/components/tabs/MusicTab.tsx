import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, CornerUpLeft, Music } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { MusicTrack } from '../../types'; // 타입 import

interface MusicTabProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
  onPlayPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  currentTrackTitle: string;
  // [New] App.tsx에 재생목록 변경 요청
  onSetPlaylist: (tracks: MusicTrack[], startIndex: number) => void;
}

export function MusicTab({ 
  isPlaying, 
  currentTime, 
  duration, 
  formatTime, 
  onPlayPause, 
  onStop,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  currentTrackTitle,
  onSetPlaylist
}: MusicTabProps) {

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVisual = isPlaying || currentTime > 0;

  // --- [New] Folder & Playlist Logic ---
  const [viewMode, setViewMode] = useState<'folders' | 'playlist'>('folders');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 동기화: 재생 상태에 따라 영상 제어
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(e => console.log("Video play failed", e));
      else videoRef.current.pause();
    }
  }, [isPlaying, showVisual]);

  // [수정 1] 폴더 데이터 변경 ('발라드' -> 'old songs')
  const folders = [
    { name: 'old songs', id: 'ballad' },
    { name: '시티팝', id: 'citypop' },
    { name: 'FrutigerAero', id: 'frutiger' },
  ];

  // 폴더 클릭 시 -> 데이터 설정
  const handleFolderClick = async (folderId: string) => {
    setIsLoading(true);
    setCurrentFolder(folderId);
    setViewMode('playlist');

    // [수정 2] 'old songs' 선택 시 하드코딩된 리스트 로드 (DB 오류 방지 및 즉시 재생)
    if (folderId === 'ballad') {
      const fixedTracks: MusicTrack[] = [
        { id: 1, title: 'And July (2023 Ver.)', url: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Music/And%20July%20(2023%20Ver.).m4a', folder: 'ballad' },
        { id: 2, title: 'Clean & Dirty', url: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Music/Clean%20&%20Dirty.mp3', folder: 'ballad' },
        { id: 3, title: 'fairy of shampoo', url: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Music/fairy%20of%20shampoo.mp3', folder: 'ballad' },
        { id: 4, title: 'Happy me', url: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Music/Happy%20me.mp3', folder: 'ballad' },
        { id: 5, title: 'I Want to Be Closer to You', url: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Music/I%20Want%20to%20Be%20Closer%20to%20You.mp3', folder: 'ballad' },
        { id: 6, title: 'supernatural (winter)', url: 'https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Music/supernatural%20(winter).mp3', folder: 'ballad' },
      ];
      setTracks(fixedTracks);
      setIsLoading(false);
      return;
    }

    // [수정 3] 나머지 폴더는 빈 목록으로 처리
    setTracks([]);
    setIsLoading(false);
  };

  // 트랙 클릭 시 -> App.tsx로 재생 요청
  const handleTrackClick = (index: number) => {
    onSetPlaylist(tracks, index);
  };

  // 뒤로가기 버튼
  const handleBack = () => {
    setViewMode('folders');
    setCurrentFolder(null);
    setTracks([]);
  };

  return (
    <div style={{ 
      background: '#c0c0c0', 
      border: '2px outset #dfdfdf', 
      padding: '0px', 
      display: 'flex',
      justifyContent: 'center'
    }}>
      
      {/* [Windows Media Player 6.4 Style Main Body] */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        background: '#c0c0c0',
        borderTop: '2px solid white',
        borderLeft: '2px solid white',
        borderRight: '2px solid #404040',
        borderBottom: '2px solid #404040',
        padding: '2px', 
        boxSizing: 'border-box',
        boxShadow: '1px 1px 0px black'
      }}>
        
        {/* 1. 검정색 스크린 (Visualization & Info) */}
        <div style={{
          background: 'black',
          borderTop: '2px solid #404040',
          borderLeft: '2px solid #404040',
          borderRight: '2px solid white',
          borderBottom: '2px solid white',
          height: '180px',
          marginBottom: '0px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {showVisual ? (
            <video
              ref={videoRef}
              src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/music/WMP_visual.mp4"
              loop muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />
          ) : (
            <img 
              src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/music/mediaplayer_icon.jpg"
              alt="Album Art"
              style={{ width: '80px', height: '80px', objectFit: 'contain', zIndex: 1 }}
            />
          )}

          {/* 노래 제목 */}
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            color: '#00ff00', fontFamily: '"DotMatrix", monospace', fontSize: '12px', fontWeight: 'bold', zIndex: 10, textShadow: '1px 1px 0 #000'
          }}>
            {currentTrackTitle}
          </div>
          
          {/* 상태 텍스트 */}
          <div style={{
            position: 'absolute', bottom: '5px', left: '5px',
            color: '#00ff00', fontFamily: '"DotMatrix", monospace', fontSize: '10px', zIndex: 10, textShadow: '1px 1px 0 #000'
          }}>
            {isPlaying ? 'Playing...' : (currentTime > 0 ? 'Paused' : 'Stopped')}
          </div>

          {/* 시간 표시 */}
          <div style={{
            position: 'absolute', bottom: '5px', right: '5px',
            color: '#00ff00', fontFamily: '"DotMatrix", monospace', fontSize: '10px', zIndex: 10, textShadow: '1px 1px 0 #000'
          }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* 2. 탐색바 (Seek Bar) */}
        <div style={{
          height: '14px', background: '#000', 
          borderTop: '1px solid #404040', borderLeft: '1px solid #404040', borderRight: '1px solid white', borderBottom: '1px solid white',
          position: 'relative'
        }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#00ff00', position: 'absolute', top: 0, left: 0 }}></div>
          <div style={{ width: '10px', height: '100%', background: '#c0c0c0', border: '1px outset #dfdfdf', position: 'absolute', left: `calc(${progressPercent}% - 5px)`, top: 0 }}></div>
        </div>

        {/* 3. 컨트롤 패널 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 2px', background: '#c0c0c0' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"} style={controlButtonStyle}>
              {isPlaying ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" />}
            </button>
            <button onClick={onStop} title="Stop" style={controlButtonStyle}>
              <Square size={12} fill="black" />
            </button>
            <button onClick={onPrev} title="Previous" style={controlButtonStyle}>
              <SkipBack size={14} fill="black" />
            </button>
            <button onClick={onNext} title="Next" style={controlButtonStyle}>
              <SkipForward size={14} fill="black" />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '2px' }}>
             <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/music/volume.png" alt="Vol" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
             <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} style={{ width: '70px', height: '10px', cursor: 'pointer' }} />
          </div>
        </div>

        {/* 4. 폴더 & 재생목록 영역 (핵심 변경 구역) */}
        <div style={{
          background: 'black',
          borderTop: '2px solid #404040', borderLeft: '2px solid #404040', borderRight: '2px solid white', borderBottom: '2px solid white',
          padding: '10px',
          minHeight: '120px',
          maxHeight: '200px', // 스크롤 생기도록 높이 제한
          overflowY: 'auto'
        }}>
          
          {/* [CASE 1: 폴더 보기 모드] */}
          {viewMode === 'folders' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {folders.map((folder) => (
                <div 
                  key={folder.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '5px' }}
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <img src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/icon/folder.png" alt="Folder" style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }} />
                  <span style={{ color: 'white', fontSize: '12px', textAlign: 'center' }}>{folder.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* [CASE 2: 재생목록 보기 모드] */}
          {viewMode === 'playlist' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* 상단: 폴더명 + 뒤로가기 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #404040', paddingBottom: '4px' }}>
                <span style={{ color: '#00ff00', fontSize: '12px', fontWeight: 'bold', fontFamily: '"DotMatrix", monospace' }}>
                  📂 {folders.find(f => f.id === currentFolder)?.name}
                </span>
                <button 
                  onClick={handleBack}
                  title="Back to Folders"
                  style={{ 
                    background: '#c0c0c0', border: '1px outset white', cursor: 'pointer', padding: '1px 4px', display: 'flex', alignItems: 'center' 
                  }}
                >
                  <CornerUpLeft size={12} color="black" />
                </button>
              </div>

              {/* 목록 */}
              {isLoading ? (
                <div style={{ color: '#00ff00', fontSize: '12px', textAlign: 'center', padding: '20px' }}>Loading...</div>
              ) : tracks.length === 0 ? (
                <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '20px' }}>No songs found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {tracks.map((track, idx) => (
                    <div 
                      key={track.id}
                      onClick={() => handleTrackClick(idx)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', 
                        padding: '4px', cursor: 'pointer',
                        background: currentTrackTitle === track.title ? '#000080' : 'transparent', // 현재 재생 중이면 파란색
                        color: currentTrackTitle === track.title ? 'white' : '#00ff00' 
                      }}
                    >
                      <Music size={12} />
                      <span style={{ fontSize: '12px', fontFamily: '"DotMatrix", monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const controlButtonStyle = {
  width: '28px', height: '24px',
  background: '#c0c0c0',
  borderTop: '1px solid white', borderLeft: '1px solid white', borderRight: '1px solid #404040', borderBottom: '1px solid #404040',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0
};