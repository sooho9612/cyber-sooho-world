import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { GuestbookEntry } from '../../types';
import { CornerDownRight } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { classicAlert } from '../../lib/messageBox';
import { useLocale } from '../../i18n/LocaleContext';

interface GuestbookTabProps {
  onRequestLogin?: () => void;
}

export function GuestbookTab({ onRequestLogin }: GuestbookTabProps) {
  const auth = useAuthContext();
  const { t } = useLocale();
  const userNickname = auth.profile?.nickname ?? '';
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyId, setReplyId] = useState<number | null>(null);

  useEffect(() => {
    fetchGuestbookEntries();
  }, []);

  const fetchGuestbookEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false }); 
        
      if (error) throw error;
      if (data) setGuestbookEntries(data);
    } catch (error) { console.error('Error fetching guestbook:', error); }
  };

  const handleSubmit = async () => {
    if (!auth.isLoggedIn || !auth.user || !userNickname) {
      void classicAlert(t('msg.guestbookNeedLogin'), t('common.alert'), 'warning');
      onRequestLogin?.();
      return;
    }
    if (!message.trim()) {
      void classicAlert(t('msg.needContent'), t('common.alert'), 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('guestbook').insert({
        nickname: userNickname,
        message: message.trim(),
        parent_id: replyId,
        user_id: auth.user.id,
      });
      if (error) throw error;
      
      setMessage(''); 
      setReplyId(null); 
      await fetchGuestbookEntries(); 
    } catch (error) {
      console.error('Error submitting guestbook:', error);
      void classicAlert(t('msg.saveFailedLogin'), t('common.alert'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const toggleReplyMode = (id: number) => {
    if (replyId === id) {
      setReplyId(null); 
    } else {
      setReplyId(id); 
    }
  };

  // [수정] 날짜 포맷 변경: YY.MM.DD
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(2); // 2025 -> 25
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const parentEntries = guestbookEntries.filter(entry => !entry.parent_id);

  const getReplies = (parentId: number) => {
    return guestbookEntries
      .filter(entry => entry.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  return (
    <div style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '20px' }}>
      
      <div style={{ background: '#000080', color: 'white', padding: '4px 8px', marginBottom: '15px', fontWeight: 'bold' }}>
        {t('nav.guestbook')}
      </div>

      {/* 작성 폼 */}
      {!auth.isLoggedIn ? (
        <div
          style={{
            marginBottom: '20px',
            border: '2px groove #dfdfdf',
            padding: '12px',
            background: '#e0e0e0',
            fontSize: '13px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{t('guestbook.loginToWrite')}</span>
          <button
            type="button"
            onClick={() => onRequestLogin?.()}
            style={{
              background: '#c0c0c0',
              border: '2px outset #dfdfdf',
              padding: '6px 12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minHeight: '36px',
            }}
          >
            {t('menu.login')}
          </button>
        </div>
      ) : (
      <div style={{ 
        marginBottom: '20px', 
        border: '2px groove #dfdfdf', 
        padding: '8px', 
        background: '#e0e0e0',
        display: 'flex', 
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000080', whiteSpace: 'nowrap' }}>
          {userNickname}
        </span>
        {replyId && (
          <div style={{ 
            fontSize: '11px', fontWeight: 'bold', color: '#000080',
            display: 'flex', alignItems: 'center', gap: '2px',
            whiteSpace: 'nowrap'
          }}>
            <CornerDownRight size={10}/> {t('guestbook.reply')}:
          </div>
        )}

        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyId 
            ? t('guestbook.replyPlaceholder')
            : t('guestbook.writePlaceholder')
          }
          disabled={isSubmitting}
          style={{ 
            flex: 1, 
            minWidth: '120px',
            background: replyId ? '#ffffcc' : 'white', 
            border: '2px inset #dfdfdf', 
            padding: '4px 8px',
            fontFamily: 'inherit',
            height: '36px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
        
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          title={replyId ? t('guestbook.reply') : t('guestbook.submit')}
          style={{ 
            background: '#c0c0c0', 
            border: '2px outset #dfdfdf', 
            width: '36px', 
            height: '36px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold', 
            cursor: isSubmitting ? 'wait' : 'pointer',
            fontSize: '12px',
            padding: 0
          }}
          onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} 
          onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
        >
          {replyId ? '↵' : '✎'}
        </button>
      </div>
      )}
      
      {/* 목록 영역 */}
      {guestbookEntries.length === 0 ? (
        <div style={{ background: 'white', border: '2px inset #dfdfdf', padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#666', fontSize: '11px' }}>No messages yet... Be the first to sign the guestbook!</div>
      ) : (
        <div style={{ background: 'white', border: '2px inset #dfdfdf', padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
          
          {parentEntries.map((entry) => {
            const isSelected = replyId === entry.id; 
            const replies = getReplies(entry.id); 

            return (
              <div key={entry.id}>
                
                {/* [부모 글] */}
                <div 
                  style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '6px 4px', // 패딩 축소
                    borderBottom: '1px dotted #ccc', 
                    backgroundColor: isSelected ? '#000080' : 'white',
                    color: isSelected ? 'white' : 'black',
                    transition: 'all 0.1s'
                  }}
                >
                  {/* 1. 닉네임 (공간 축소: 52px) */}
                  <div style={{ 
                    width: '52px', // [수정] 4글자 기준 폭
                    flexShrink: 0, 
                    fontWeight: 'bold', 
                    color: isSelected ? '#ffff00' : '#000080',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    // [수정] 5글자 이상이면 폰트 확 줄여서 끼워넣기
                    fontSize: entry.nickname.length > 4 ? '9px' : '11px', 
                    letterSpacing: entry.nickname.length > 4 ? '-1px' : 'normal',
                    paddingRight: '4px',
                    paddingTop: '1px' // 줄맞춤 미세조정
                  }}>
                    {entry.nickname}
                  </div>

                  <div style={{ width: '1px', height: '12px', background: isSelected ? '#ffffff80' : '#ddd', marginRight: '6px', marginTop: '2px' }}></div>

                  {/* 2. 내용 (폰트 축소 11px) */}
                  <div style={{ flex: 1, wordBreak: 'break-all', fontSize: '11px', lineHeight: '1.4' }}>
                    {entry.message}
                    
                    {/* 답글 버튼 */}
                    <span 
                      onClick={() => toggleReplyMode(entry.id)}
                      style={{ 
                        marginLeft: '4px', 
                        cursor: 'pointer', 
                        fontSize: '10px', 
                        color: isSelected ? '#00ff00' : '#999', 
                        fontWeight: 'normal',
                        whiteSpace: 'nowrap'
                      }}
                      title={t('guestbook.replyTitle')}
                    >
                      [{t('guestbook.reply')}]
                    </span>

                    {/* [수정] 날짜 위치 이동: 답글 버튼 뒤 */}
                    <span style={{ 
                      fontSize: '9px', // 더 작게
                      color: isSelected ? '#dfdfdf' : '#bbb',
                      marginLeft: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                </div>

                {/* [대댓글] */}
                {replies.map(reply => (
                  <div 
                    key={reply.id} 
                    style={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '6px 4px',
                      borderBottom: '1px dotted #ccc', 
                      backgroundColor: '#f9f9f9', 
                      fontSize: '11px' // [수정] 폰트 축소
                    }}
                  >
                    {/* 1. 닉네임 (L 아이콘 포함해서 공간 고정) */}
                    <div style={{ 
                      width: '52px', // [수정] 공간 축소
                      flexShrink: 0, 
                      textAlign: 'left',
                      paddingRight: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#aaa', marginRight: '2px', fontSize: '9px' }}>└</span>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: '#444',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        // [수정] 5글자 이상 대응
                        fontSize: reply.nickname.length > 4 ? '9px' : '11px', 
                        letterSpacing: reply.nickname.length > 4 ? '-1px' : 'normal',
                      }}>
                        {reply.nickname}
                      </span>
                    </div>

                    <div style={{ width: '1px', height: '12px', background: '#ddd', marginRight: '6px', marginTop: '2px' }}></div>

                    {/* 2. 내용 */}
                    <div style={{ flex: 1, color: '#444', wordBreak: 'break-all', lineHeight: '1.4' }}>
                      {reply.message}
                      
                      {/* [수정] 날짜 위치 이동 */}
                      <span style={{ 
                        fontSize: '9px', 
                        color: '#bbb',
                        marginLeft: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                  </div>
                ))}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}