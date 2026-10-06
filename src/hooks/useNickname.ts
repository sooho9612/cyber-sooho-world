import { useState } from 'react';

const STORAGE_KEY = 'user_nickname';

export function useNickname() {
  const [userNickname, setUserNickname] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [tempNickname, setTempNickname] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const openProfile = () => {
    setTempNickname(userNickname);
    setShowProfilePopup(true);
  };

  const saveProfile = () => {
    if (!tempNickname.trim()) {
      alert('닉네임을 입력해주세요!');
      return;
    }
    const finalNickname = tempNickname.trim();
    setUserNickname(finalNickname);
    localStorage.setItem(STORAGE_KEY, finalNickname);
    setShowProfilePopup(false);
    alert(`반가워요, ${finalNickname}님! 설정이 저장되었습니다.`);
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
