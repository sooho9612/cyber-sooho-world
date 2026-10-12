import { useState, useEffect } from 'react';
import { Save, Edit2, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { HomePost, HomeComment } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { useAuthContext } from '../../context/AuthContext';
import { classicAlert, classicConfirm } from '../../lib/messageBox';
import { useLocale } from '../../i18n/LocaleContext';

interface HomeTabProps {
  onRequestLogin?: () => void;
}

export function HomeTab({ onRequestLogin }: HomeTabProps) {
  const { t } = useLocale();
  const auth = useAuthContext();
  const [homePosts, setHomePosts] = useState<HomePost[]>([]);
  const [selectedHomePost, setSelectedHomePost] = useState<HomePost | null>(null);
  const [homeComments, setHomeComments] = useState<HomeComment[]>([]);

  const [isEditingHomePost, setIsEditingHomePost] = useState(false);
  const [editedHomeTitle, setEditedHomeTitle] = useState('');
  const [editedHomeContent, setEditedHomeContent] = useState('');
  const [editedHomeImage, setEditedHomeImage] = useState<File | null>(null);

  const [showNewHomePost, setShowNewHomePost] = useState(false);
  const [newHomeTitle, setNewHomeTitle] = useState('');
  const [newHomeContent, setNewHomeContent] = useState('');
  const [newHomeImage, setNewHomeImage] = useState<File | null>(null);

  const [commentContent, setCommentContent] = useState('');
  
  // [New] 로딩 상태 추가 (선택 사항이지만 UX에 좋음)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHomePosts();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = t('home.days').split(',')[date.getDay()];
    return `${year}.${month}.${day} (${dayOfWeek})`;
  };

  const fetchHomePosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('home_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setHomePosts(data);
    } catch (error) { console.error('Error fetching home posts:', error); }
    finally { setIsLoading(false); }
  };

  const fetchHomeComments = async (postId: number) => {
    try {
      const { data, error } = await supabase.from('home_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
      if (error) throw error;
      if (data) setHomeComments(data);
    } catch (error) { console.error('Error fetching comments:', error); }
  };

  const handleCreateHomePost = async () => {
    if (!auth.isOwner) { void classicAlert(t('msg.ownerNoticeOnly'), t('common.alert'), 'warning'); return; }
    if (!newHomeTitle.trim() || !newHomeContent.trim()) { void classicAlert(t('msg.needTitleContent'), t('common.alert'), 'warning'); return; }
    let imageUrl = null;
    if (newHomeImage) {
      try {
        const compressedImage = await compressImage(newHomeImage);
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedImage);
        });
      } catch (imgError) { void classicAlert(t('msg.imageFailed', { error: String(imgError) }), t('common.alert'), 'error'); return; }
    }
    try {
      const { error } = await supabase.from('home_posts').insert({ title: newHomeTitle, content: newHomeContent, image_url: imageUrl });
      if (error) { void classicAlert(t('msg.saveFailedDetail', { error: error.message }), t('common.alert'), 'error'); } else { await fetchHomePosts(); setNewHomeTitle(''); setNewHomeContent(''); setNewHomeImage(null); setShowNewHomePost(false); void classicAlert(t('msg.noticeCreated')); }
    } catch (error) { console.error('Error creating post:', error); }
  };

  const handleHomePostEdit = () => {
    if (!auth.isOwner) {
      void classicAlert(t('msg.ownerEditOnly'), t('common.alert'), 'warning');
      return;
    }
    if (selectedHomePost) {
      setEditedHomeTitle(selectedHomePost.title);
      setEditedHomeContent(selectedHomePost.content);
      setIsEditingHomePost(true);
    }
  };

  const handleSaveHomePost = async () => {
    if (!selectedHomePost) return;
    let imageUrl = selectedHomePost.image_url;
    if (editedHomeImage) {
      try {
        const compressedImage = await compressImage(editedHomeImage);
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedImage);
        });
      } catch (imgError) { void classicAlert(t('msg.imageFailed', { error: String(imgError) }), t('common.alert'), 'error'); return; }
    }
    const { error } = await supabase.from('home_posts').update({ title: editedHomeTitle, content: editedHomeContent, image_url: imageUrl }).eq('id', selectedHomePost.id);
    if (error) { void classicAlert(t('msg.saveFailedDetail', { error: error.message }), t('common.alert'), 'error'); return; }
    await fetchHomePosts();
    const { data } = await supabase.from('home_posts').select('*').eq('id', selectedHomePost.id).single();
    if (data) setSelectedHomePost(data);
    setIsEditingHomePost(false); setEditedHomeImage(null); void classicAlert('✓ Post updated!');
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!auth.isLoggedIn) {
      void classicAlert(t('msg.needLogin'), t('common.alert'), 'warning');
      onRequestLogin?.();
      return;
    }
    if (!(await classicConfirm(t('msg.deleteConfirm'), t('common.confirm'), 'warning'))) return;
    try {
      const { error } = await supabase.from('home_comments').delete().eq('id', commentId);
      if (error) throw error;
      if (selectedHomePost) await fetchHomeComments(selectedHomePost.id);
    } catch (error) {
      console.error(error);
      void classicAlert(t('msg.deleteFailed'), t('common.alert'), 'error');
    }
  };

  const handleSubmitComment = async () => {
    if (!auth.isLoggedIn || !auth.user || !auth.profile) {
      void classicAlert(t('msg.commentNeedLogin'), t('common.alert'), 'warning');
      onRequestLogin?.();
      return;
    }
    if (!commentContent.trim()) return;
    if (!selectedHomePost) return;
    try {
      const { error } = await supabase.from('home_comments').insert({
        post_id: selectedHomePost.id,
        nickname: auth.profile.nickname,
        content: commentContent.trim(),
        user_id: auth.user.id,
      });
      if (error) throw error;
      await fetchHomeComments(selectedHomePost.id);
      setCommentContent('');
    } catch (error) {
      console.error(error);
      void classicAlert(t('msg.commentSaveFailed'), t('common.alert'), 'error');
    }
  };

  return (
    // [수정] 최상위 컨테이너: 높이 100% (부모 WindowFrame 채움)
    <div style={{ 
      background: '#c0c0c0', 
      border: '3px outset #dfdfdf', 
      padding: '20px', 
      height: '100%', // 높이 꽉 채우기
      boxSizing: 'border-box', // 패딩 포함 크기 계산
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ background: '#000080', color: 'white', padding: '4px 8px', marginBottom: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span>공지 ({homePosts.length} posts)</span>
        {!selectedHomePost && !isEditingHomePost && auth.isOwner && (
          <button onClick={() => setShowNewHomePost(true)} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', color: 'black' }} onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}>+</button>
        )}
      </div>

      {/* [수정] 스크롤 영역: 내용이 넘치면 여기서 스크롤 생김 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {showNewHomePost && (
          <div style={{ background: '#e0e0e0', border: '2px inset #dfdfdf', padding: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ fontWeight: 'bold', color: '#000080' }}>[ 새 공지 쓰기 ]</span><button onClick={() => { setShowNewHomePost(false); setNewHomeTitle(''); setNewHomeContent(''); setNewHomeImage(null); }} style={{ background: '#c0c0c0', border: '1px outset #dfdfdf', cursor: 'pointer' }}>X</button></div>
            <div style={{ marginBottom: '10px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label><input type="text" value={newHomeTitle} onChange={(e) => setNewHomeTitle(e.target.value)} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '6px', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
            <div style={{ marginBottom: '10px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content:</label><textarea value={newHomeContent} onChange={(e) => setNewHomeContent(e.target.value)} rows={6} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '6px', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Image (Optional):</label><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if(file) setNewHomeImage(file); }} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '4px', width: '100%' }} /></div>
            <button onClick={handleCreateHomePost} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><Save size={14} style={{ marginRight: '5px' }} /> POST NOTICE</button>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>Loading posts...</div>
        ) : homePosts.length === 0 ? (
          <div style={{ background: 'white', border: '2px inset #dfdfdf', padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>No posts yet...</div>
        ) : selectedHomePost ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <button onClick={() => { setSelectedHomePost(null); setIsEditingHomePost(false); setHomeComments([]); setEditedHomeImage(null); }} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}>&lt;&lt;</button>
              {!isEditingHomePost && auth.isOwner && (<button onClick={handleHomePostEdit} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><Edit2 size={14} /></button>)}
            </div>
            <div style={{ background: 'white', border: '2px inset #dfdfdf', padding: '15px' }}>
              {selectedHomePost.image_url && (<div style={{ marginBottom: '15px' }}><img src={selectedHomePost.image_url} alt="Post" style={{ maxWidth: '100%', width: '100%', height: 'auto', border: '1px solid #000' }} /></div>)}
              {isEditingHomePost ? (
                <><div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label><input type="text" value={editedHomeTitle} onChange={(e) => setEditedHomeTitle(e.target.value)} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '8px', width: '100%', fontFamily: 'inherit', fontSize: '16px', fontWeight: 'bold', boxSizing: 'border-box' }} /></div>
                  <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content:</label><textarea value={editedHomeContent} onChange={(e) => setEditedHomeContent(e.target.value)} rows={8} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '10px', width: '100%', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }} /></div>
                  <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload New Image (optional):</label><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setEditedHomeImage(file); }} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '4px', width: '100%', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }} /></div>
                  <div style={{ display: 'flex', gap: '10px' }}><button onClick={handleSaveHomePost} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }} onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}><Save size={12} /> SAVE</button><button onClick={() => { setIsEditingHomePost(false); setEditedHomeImage(null); }} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }} onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}><X size={12} /> CANCEL</button></div>
                </>
              ) : (
                <><div style={{ marginBottom: '15px', borderBottom: '2px solid #000080', paddingBottom: '10px' }}><div style={{ fontWeight: 'bold', color: '#000080', fontSize: '20px', marginBottom: '5px' }}>{selectedHomePost.title}</div><div style={{ fontSize: '12px', color: '#666' }}>{formatDate(selectedHomePost.created_at)}</div></div>
                  <div style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedHomePost.content}</div>
                  <div style={{ borderTop: '2px solid #c0c0c0', paddingTop: '15px', marginTop: '15px' }}>
                    <div style={{ background: '#000080', color: 'white', padding: '4px 8px', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>Comments ({homeComments.length})</div>
                    {homeComments.length === 0 ? (<div style={{ background: '#f0f0f0', border: '1px inset #dfdfdf', padding: '10px', marginBottom: '15px', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', color: '#666' }}>No comments yet. Be the first to comment!</div>) : (
                      <div style={{ marginBottom: '15px' }}>{homeComments.map((comment) => (<div key={comment.id} style={{ background: '#f0f0f0', border: '1px solid #999', padding: '10px', marginBottom: '8px', fontSize: '13px', position: 'relative' }}><div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><span style={{ fontWeight: 'bold', color: '#0000cc' }}>{comment.nickname}</span><span style={{ color: '#666', fontSize: '11px', marginLeft: '10px' }}>[{new Date(comment.created_at).toLocaleString()}]</span></div><button onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id); }} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '2px 6px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#cc0000', display: 'flex', alignItems: 'center', gap: '2px' }} onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'} title="Delete comment"><X size={10} /></button></div><div style={{ color: '#000' }}>{comment.content}</div></div>))}</div>)}
                    <div style={{ background: '#e0e0e0', border: '2px outset #dfdfdf', padding: '15px' }}>
                      {!auth.isLoggedIn ? (
                        <div style={{ fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                          <span>로그인 후 댓글을 남길 수 있어요.</span>
                          <button type="button" onClick={() => onRequestLogin?.()} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', minHeight: '36px' }}>로그인</button>
                        </div>
                      ) : (
                        <>
                          <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                            <b>닉네임:</b> {auth.profile?.nickname}
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Comment:</label>
                            <textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Write your comment..." rows={3} style={{ background: 'white', border: '2px inset #dfdfdf', padding: '6px', width: '100%', fontFamily: 'inherit', fontSize: '16px', resize: 'vertical', boxSizing: 'border-box' }} />
                          </div>
                          <button onClick={handleSubmitComment} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', minHeight: '40px' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}>글쓰기</button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="diary-grid" style={{ display: 'grid', gap: '15px' }}>{homePosts.map((post) => (<div key={post.id} onClick={() => { setSelectedHomePost(post); fetchHomeComments(post.id); }} style={{ background: 'white', border: '2px outset #dfdfdf', padding: '10px', cursor: 'pointer', transition: 'border 0.1s' }} onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}><div style={{ width: '100%', aspectRatio: '1', marginBottom: '8px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f0f0f0' }}>{post.image_url ? <img src={post.image_url} alt="Post thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', fontWeight: 'bold' }}>No Image</div>}</div><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000080', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{post.title}</div><div style={{ fontSize: '10px', color: '#666', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatDate(post.created_at)}</div></div>))}</div>
        )}
      </div>
    </div>
  );
}