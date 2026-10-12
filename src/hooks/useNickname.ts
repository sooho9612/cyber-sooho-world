import { useState } from 'react';
import { classicAlert } from '../lib/messageBox';
import { useLocale } from '../i18n/LocaleContext';

const STORAGE_KEY = 'user_nickname';

export function useNickname() {
  const { t } = useLocale();
  const [userNickname, setUserNickname] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [tempNickname, setTempNickname] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const openProfile = () => {
    setTempNickname(userNickname);
    setShowProfilePopup(true);
  };

  const saveProfile = () => {
    if (!tempNickname.trim()) {
      void classicAlert(t('msg.needNickname'), t('common.alert'), 'warning');
      return;
    }
    const finalNickname = tempNickname.trim();
    setUserNickname(finalNickname);
    localStorage.setItem(STORAGE_KEY, finalNickname);
    setShowProfilePopup(false);
    void classicAlert(t('msg.nicknameHello', { name: finalNickname }));
  };

  const closeProfile = () => setShowProfilePopup(false);

  return {
    userNickname,
    tempNickname,
    setTempNickname,
    showProfilePopup,
    openProfile,
    saveProfile,
    closeProfile,
  };
}
