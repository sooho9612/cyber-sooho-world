import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { WindowsTitleBar } from './components/Layout/WindowsTitleBar';
import { MenuBar } from './components/Layout/MenuBar';
import { WindowFrame } from './components/Layout/WindowFrame';
import { SettingsDialog } from './components/Layout/SettingsDialog';
import { ControlPanel } from './components/Layout/ControlPanel';
import { AutoCompressorDialog } from './components/Layout/AutoCompressorDialog';
import { HelpAboutDialog } from './components/Layout/HelpAboutDialog';
import { MarqueeSettingsDialog } from './components/Layout/MarqueeSettingsDialog';
import { PlazaSettingsDialog } from './components/Layout/PlazaSettingsDialog';
import { LoginDialog } from './components/Layout/LoginDialog';
import { SignupDialog } from './components/Layout/SignupDialog';
import { AccountDialog } from './components/Layout/AccountDialog';
import { ForgotPasswordDialog } from './components/Layout/ForgotPasswordDialog';
import { MarqueeBanner } from './components/MarqueeBanner';
import { KeepAlivePanels } from './components/shared/KeepAlivePanels';
import { PlazaTab } from './components/tabs/PlazaTab';
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
import { useDesktopBackground } from './hooks/useDesktopBackground';
import { useMarqueeSettings } from './hooks/useMarqueeSettings';
import { usePlazaSettings } from './hooks/usePlazaSettings';
import { useAuthContext } from './context/AuthContext';
import { loadCompressorSettings } from './utils/imageCompressor';
import { classicAlert } from './lib/messageBox';
import { useLocale } from './i18n/LocaleContext';
import type { AppTab, DesktopBg } from './types';

function App() {
  const { t } = useLocale();
  const audio = useAudioPlayer();
  const auth = useAuthContext();
  const desktop = useDesktopBackground(auth.user?.id, auth.profile?.nickname);
  const marquee = useMarqueeSettings();
  const plaza = usePlazaSettings();
  const [activeTab, setActiveTab] = useState<AppTab>('intro');
  const [showSettings, setShowSettings] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showCompressor, setShowCompressor] = useState(false);
  const [showMarqueeSettings, setShowMarqueeSettings] = useState(false);
  const [showPlazaSettings, setShowPlazaSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    loadCompressorSettings();
  }, []);

  const openSettings = () => {
    if (!auth.isLoggedIn) {
      void classicAlert(t('msg.settingsNeedLogin'), t('common.alert'), 'warning');
      setShowLogin(true);
      return;
    }
    setShowSettings(true);
  };

  const openControlPanel = () => {
    if (!auth.isOwner) {
      void classicAlert(t('msg.controlOwnerOnly'), t('common.alert'), 'warning');
      return;
    }
    setShowControlPanel(true);
  };

  const persistDesktopBg = async (bg: DesktopBg) => {
    try {
      await desktop.saveDesktopBg(bg);
    } catch {
      await classicAlert(t('msg.settingsSaveFailed'), t('common.alert'), 'error');
      throw new Error('save failed');
    }
  };

  const openLogin = () => {
    setShowSignup(false);
    setShowForgot(false);
    setShowLogin(true);
  };

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
          /* Mobile: side padding → 30% of desktop 24px (~7px); drop tall content floor */
          @media (max-width: 768px) {
            .content-area {
              padding-left: 7px !important;
              padding-right: 7px !important;
              padding-bottom: 8px !important;
            }
            .section-min-h { min-height: 0 !important; }
            .site-footer { margin-top: 8px !important; }
          }
          .tab-container { display: flex; gap: 5px; }
          .tab-button { flex: 1; min-width: 0; padding: 10px 20px; fontSize: 14px; white-space: nowrap; }
          .sub-tab-container { display: flex; gap: 0px; margin-bottom: 20px; }
          .sub-tab-button { flex: 1; padding: 6px; background: #c0c0c0; border: 2px outset #dfdfdf; cursor: pointer; display: flex; alignItems: 'center'; justifyContent: 'center'; font-size: 16px; }
          .sub-tab-button:active { border: 2px inset #dfdfdf; }
        `}
      </style>

      <audio
        ref={audio.audioRef}
        onTimeUpdate={audio.handleTimeUpdate}
        onEnded={audio.handleAudioEnded}
        style={{ display: 'none' }}
      />

      <WindowFrame desktopStyle={desktop.desktopStyle}>
        <WindowsTitleBar />
        <MenuBar
          onHomeClick={() => setActiveTab('intro')}
          onProfileClick={() => setShowAccount(true)}
          onSettingsClick={openSettings}
          onControlPanelClick={openControlPanel}
          onHelpClick={() => setShowHelp(true)}
          isLoggedIn={auth.isLoggedIn}
          isOwner={auth.isOwner}
          displayName={auth.profile?.nickname}
          onLoginClick={openLogin}
          onSignupClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLogoutClick={async () => {
            await auth.signOut();
            await classicAlert(t('msg.loggedOut'));
          }}
        />

        <div className="content-area" style={{ padding: '24px' }}>
          <Header onBannerClick={() => setActiveTab('intro')} />
          <MarqueeBanner settings={marquee.settings} />
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isPlaying={audio.isPlaying}
          />

          <KeepAlivePanels<AppTab>
            active={activeTab}
            keys={['intro', 'home', 'diary', 'food', 'guestbook', 'music', 'movie', 'travel', 'toy']}
            panels={{
              intro: <PlazaTab onRequestLogin={openLogin} bgUrl={plaza.bgUrl} />,
              home: <HomeTab onRequestLogin={openLogin} />,
              diary: <DiaryTab />,
              food: <FoodTab />,
              guestbook: <GuestbookTab onRequestLogin={openLogin} />,
              music: (
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
              ),
              movie: <MovieTab />,
              travel: <TravelTab />,
              toy: <ToyTab />,
            }}
          />

          <div
            className="site-footer"
            style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#ffff00' }}
          >
            <p>~*~ since 2025.12.04 ~*~</p>
            <p>{t('footer.ie')}</p>
          </div>
        </div>

        <SettingsDialog
          open={showSettings}
          draft={desktop.desktopBg}
          onClose={() => setShowSettings(false)}
          onApply={async (bg) => {
            await persistDesktopBg(bg);
          }}
          onConfirm={async (bg) => {
            await persistDesktopBg(bg);
            setShowSettings(false);
          }}
        />

        <ControlPanel
          open={showControlPanel}
          onClose={() => setShowControlPanel(false)}
          onOpenCompressor={() => setShowCompressor(true)}
          onOpenMarquee={() => setShowMarqueeSettings(true)}
          onOpenPlaza={() => setShowPlazaSettings(true)}
        />

        <AutoCompressorDialog
          open={showCompressor}
          onClose={() => setShowCompressor(false)}
        />

        <MarqueeSettingsDialog
          open={showMarqueeSettings}
          draft={marquee.settings}
          onClose={() => setShowMarqueeSettings(false)}
          onSave={marquee.save}
        />

        <PlazaSettingsDialog
          open={showPlazaSettings}
          draft={plaza.settings}
          onClose={() => setShowPlazaSettings(false)}
          onSave={plaza.save}
        />

        <HelpAboutDialog open={showHelp} onClose={() => setShowHelp(false)} />

        <LoginDialog
          open={showLogin}
          auth={auth}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onForgotPassword={() => {
            setShowLogin(false);
            setShowForgot(true);
          }}
        />
        <SignupDialog
          open={showSignup}
          auth={auth}
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
        <AccountDialog
          open={showAccount}
          auth={auth}
          onClose={() => setShowAccount(false)}
        />
        <ForgotPasswordDialog
          open={showForgot}
          auth={auth}
          onClose={() => setShowForgot(false)}
        />
      </WindowFrame>
    </>
  );
}

export default App;
