import { useState, useRef, useEffect } from 'react';
import { Save, Edit2, X, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Upload, Layout } from 'lucide-react';
import { BoardLayout } from '../shared/BoardLayout';
import { KeepAlivePanels, SECTION_CONTENT_MIN_HEIGHT } from '../shared/KeepAlivePanels';
import { compressImage } from '../../utils/imageCompressor';
import { DiaryEntry, MemoryPhoto } from '../../types';

// 하위 탭
import { FoodTab } from './FoodTab';
import { MovieTab } from './MovieTab';
import { TravelTab } from './TravelTab';
import { MemoryTab } from './MemoryTab';

type BackgroundStyle = 'tile' | 'stretch';

// ----------------------------------------------------------------------
// 1. Form Component
// ----------------------------------------------------------------------
function DiaryForm({ onSave, onCancel, initialData }: { 
  onSave: (data: any) => void, 
  onCancel: () => void, 
  initialData?: DiaryEntry  | null
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
  const [location, setLocation] = useState(initialData?.location || '');
  
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(initialData?.background_url || null);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>((initialData?.background_style as BackgroundStyle) || 'tile');

  // [핵심] 갤러리 초기화 로직 (항상 끝에 빈 항목이 있어야 함)
  const [gallery, setGallery] = useState<MemoryPhoto[]>(() => {
    let initialGallery: MemoryPhoto[] = [];

    // 1. 기존 갤러리 데이터가 있으면 사용
    if (initialData?.gallery && initialData.gallery.length > 0) {
      initialGallery = [...initialData.gallery];
    } 
    // 2. 레거시 데이터(image_url/content)가 있으면 변환
    else if ((initialData as any)?.image_url || (initialData as any)?.imageUrl || initialData?.content) {
      const legacyImg = (initialData as any)?.image_url || (initialData as any)?.imageUrl || '';
      initialGallery = [{
        id: 'legacy_migrated',
        image: legacyImg, 
        caption: initialData?.content || ''
      }];
    }

    // 3. [Auto-Expand] 마지막 항목이 비어있지 않다면 빈 항목 추가
    const lastItem = initialGallery[initialGallery.length - 1];
    if (!lastItem || (lastItem.image || lastItem.caption)) {
      initialGallery.push({ id: Date.now().toString(), image: '', caption: '' });
    }

    return initialGallery;
  });

  // 파일 업로드를 위한 Refs
  const fileInputRef = useRef<HTMLInputElement>(null); // 갤러리용 (숨김)
  const bgInputRef = useRef<HTMLInputElement>(null);   // 배경용
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number | null>(null); // 어떤 박스에서 업로드를 요청했는지 추적

  // [Auto-Expand] 갤러리 변경 감지 및 자동 확장
  useEffect(() => {
    const lastItem = gallery[gallery.length - 1];
    if (lastItem && (lastItem.image || lastItem.caption)) {
      setGallery(prev => [...prev, { id: Date.now() + Math.random().toString(), image: '', caption: '' }]);
    }
  }, [gallery]);

  // 1. 파일 선택 처리 (더블클릭 업로드)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || uploadTargetIndex === null) return;

    const newPhotos: MemoryPhoto[] = [];
    
    // 선택된 파일들을 처리
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImage(file);
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });
      newPhotos.push({
        id: Date.now() + Math.random().toString() + i,
        image: result,
        caption: ''
      });
    }

    setGallery(prev => {
      const newGallery = [...prev];
      // 타겟 위치부터 덮어쓰거나 삽입 (다중 선택 시)
      // 첫 번째 파일은 타겟 위치에 넣고, 나머지는 뒤에 삽입
      newGallery[uploadTargetIndex] = { ...newGallery[uploadTargetIndex], image: newPhotos[0].image };
      
      if (newPhotos.length > 1) {
        newGallery.splice(uploadTargetIndex + 1, 0, ...newPhotos.slice(1));
      }
      return newGallery;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadTargetIndex(null);
  };

  // 2. 붙여넣기 처리 (Ctrl+V)
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>, index: number) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); // 기본 붙여넣기 막기
        const blob = items[i].getAsFile();
        if (blob) {
          const compressed = await compressImage(blob);
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            setGallery(prev => {
              const newGallery = [...prev];
              newGallery[index] = { ...newGallery[index], image: result };
              return newGallery;
            });
          };
          reader.readAsDataURL(compressed);
        }
        break; // 한 번에 하나의 이미지만 처리
      }
    }
  };

  // 3. 더블 클릭 처리
  const handleDoubleClick = (index: number) => {
    setUploadTargetIndex(index);
    fileInputRef.current?.click();
  };

  const handleCaptionChange = (id: string, text: string) => {
    setGallery(prev => prev.map(p => p.id === id ? { ...p, caption: text } : p));
  };

  const handleRemovePhoto = (id: string) => {
    // 마지막 항목(빈칸)은 삭제 불가하게 하거나, 삭제해도 다시 생기게 처리됨
    setGallery(prev => prev.filter(p => p.id !== id));
  };

  const handleMovePhotoUp = (index: number) => {
    if (index === 0) return;
    setGallery(prev => {
      const newGallery = [...prev];
      [newGallery[index], newGallery[index - 1]] = [newGallery[index - 1], newGallery[index]];
      return newGallery;
    });
  };

  const handleMovePhotoDown = (index: number) => {
    // 마지막 항목(빈칸)은 이동 불가
    if (index >= gallery.length - 2) return; 
    setGallery(prev => {
      const newGallery = [...prev];
      [newGallery[index], newGallery[index + 1]] = [newGallery[index + 1], newGallery[index]];
      return newGallery;
    });
  };

  // 배경 이미지 업로드
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  // 저장 핸들러 (빈 항목 제거)
  const handleSaveWrapper = () => {
    // 이미지와 캡션 둘 다 없는 항목 필터링
    const cleanGallery = gallery.filter(item => item.image || item.caption.trim());
    const firstImage = cleanGallery.find((p) => p.image)?.image || null;
    onSave({ 
      title, date, location, 
      gallery: cleanGallery,
      image_url: firstImage,
      photo_count: cleanGallery.length,
      background_url: backgroundUrl, 
      background_style: backgroundStyle 
    });
  };

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div className="mb-4 font-bold text-lg text-[#000080]">{initialData ? 'Edit Diary' : 'New Diary'}</div>
      
      {/* Hidden File Input for Gallery */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" multiple />

      {/* 기본 정보 입력 */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block font-bold text-xs mb-1 text-black">Title:</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} 
            className="w-full p-1 border border-gray-400 bg-white text-sm" style={{ fontFamily: 'inherit' }} placeholder="Title" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-bold text-xs mb-1 text-black">Date:</label>
            <input type="text" value={date} onChange={e => setDate(e.target.value)} 
              className="w-full p-1 border border-gray-400 bg-white text-sm" style={{ fontFamily: 'inherit' }} />
          </div>
          <div className="flex-1">
            <label className="block font-bold text-xs mb-1 text-black">Location:</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} 
              className="w-full p-1 border border-gray-400 bg-white text-sm" style={{ fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* 배경화면 설정 */}
      <div className="mb-4 bg-[#e0e0e0] p-2 border border-gray-400">
        <label className="block font-bold text-xs mb-2 text-black flex items-center gap-1">
          <Layout size={12}/> Post Background (Optional)
        </label>
        <div className="flex items-center gap-4">
          <button onClick={() => bgInputRef.current?.click()} className="bg-white border border-gray-400 px-2 py-1 text-xs flex items-center gap-1 hover:bg-gray-50">
            <Upload size={12}/> {backgroundUrl ? 'Change BG' : 'Select BG'}
          </button>
          <input type="file" ref={bgInputRef} onChange={handleBackgroundUpload} className="hidden" accept="image/*" />
          {backgroundUrl && (
            <div className="flex items-center gap-3 bg-white px-2 py-1 border border-gray-400">
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="bgStyle" checked={backgroundStyle === 'tile'} onChange={() => setBackgroundStyle('tile')} className="cursor-pointer" /><span className="text-xs">Tile</span></label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="bgStyle" checked={backgroundStyle === 'stretch'} onChange={() => setBackgroundStyle('stretch')} className="cursor-pointer" /><span className="text-xs">Stretch</span></label>
            </div>
          )}
          {backgroundUrl && <button onClick={() => setBackgroundUrl(null)} className="text-red-600 text-xs hover:underline">Remove</button>}
        </div>
      </div>

      {/* 갤러리 영역 (자동 확장) */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <label className="block font-bold text-xs text-black">Gallery ({gallery.filter(i => i.image || i.caption).length})</label>
        </div>

        <div className="bg-white p-2 border-2 border-inset border-[#dfdfdf] min-h-[150px] overflow-y-auto max-h-[600px]">
          {gallery.map((photo: MemoryPhoto, index: number) => {
            const isLast = index === gallery.length - 1;
            return (
              <div key={photo.id} className="bg-[#c0c0c0] border-2 border-outset border-[#dfdfdf] p-2 mb-2">
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-400 border-dotted">
                  <span className="text-xs font-bold text-[#000080]">Item #{index + 1}</span>
                  {!isLast && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleMovePhotoUp(index)} disabled={index === 0} className={`p-0.5 bg-gray-300 border border-outset ${index===0?'opacity-50':''}`}><ArrowUp size={10}/></button>
                      <button onClick={() => handleMovePhotoDown(index)} disabled={index === gallery.length-2} className={`p-0.5 bg-gray-300 border border-outset ${index===gallery.length-2?'opacity-50':''}`}><ArrowDown size={10}/></button>
                      <button onClick={() => handleRemovePhoto(photo.id)} className="p-0.5 bg-gray-300 border border-outset ml-1"><Trash2 size={10} color="#b91c1c"/></button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 items-start flex-col sm:flex-row">
                  {/* 이미지 영역: 더블클릭, 붙여넣기 지원 */}
                  <div 
                    className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-400 border-2 border-inset flex items-center justify-center overflow-hidden cursor-pointer focus:outline-none focus:border-blue-500"
                    tabIndex={0}
                    onDoubleClick={() => handleDoubleClick(index)}
                    onPaste={(e) => handlePaste(e, index)}
                    title="Click then Ctrl+V to paste, or Double Click to upload"
                  >
                    {photo.image ? (
                      <img src={photo.image} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={20} className="mx-auto text-gray-300" />
                        <span className="text-[10px] text-white block mt-1">Paste / DblClick</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 캡션 입력 */}
                  <textarea 
                    value={photo.caption} 
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)} 
                    placeholder="Enter caption..." 
                    className="w-full h-32 p-1 text-sm border border-gray-400 bg-white resize-none" 
                    style={{ fontFamily: 'inherit' }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button onClick={handleSaveWrapper} className="bg-gray-300 border-2 border-outset border-gray-200 px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset">
          <Save size={12}/> Save
        </button>
        <button onClick={onCancel} className="bg-gray-300 border-2 border-outset border-gray-200 px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><X size={12}/> Cancel</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Detail Component (상세 보기)
// ----------------------------------------------------------------------
function DiaryDetail({ item, onBack, onEdit, onDelete }: { item: DiaryEntry, onBack: () => void, onEdit: (item: any) => void, onDelete: (id: string) => void }) {
  const gallery = item.gallery || [];
  
  // 하위 호환성 체크
  const isLegacy = gallery.length === 0 && (item.content || item.imageUrl || (item as any).image_url);

  // 배경 스타일
  const bgStyle = item.background_url ? {
    backgroundImage: `url(${item.background_url})`,
    backgroundRepeat: item.background_style === 'stretch' ? 'no-repeat' : 'repeat',
    backgroundSize: item.background_style === 'stretch' ? '100% 100%' : 'auto',
    backgroundPosition: 'center top'
  } : { background: 'white' };

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}>&lt;&lt;</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onEdit(item)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><Edit2 size={14} /></button>
          <button onClick={() => onDelete(item.id)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><X size={14} /></button>
        </div>
      </div>

      <div style={{ ...bgStyle, border: 'none', padding: '15px', minHeight: '400px', marginLeft: '-10px', marginRight: '-10px' }}>
        <div style={{ marginBottom: '15px', borderBottom: '1px solid #000', paddingBottom: '5px', background: 'rgba(255,255,255,0.7)', padding: '10px', backdropFilter: 'blur(2px)' }}>
          <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '18px', marginBottom: '5px' }}>{item.title}</div>
          <div style={{ fontSize: '14px', color: '#0000ff', fontWeight: 'bold', marginBottom: '2px' }}>{item.date}</div>
          <div style={{ fontSize: '14px', color: '#008000' }}>Location: {item.location}</div>
        </div>

        <div className="space-y-8">
          {gallery.length > 0 && gallery.map((photo: MemoryPhoto, index: number) => (
            <div key={photo.id || index} className="flex flex-col gap-2">
              <div style={{ maxWidth: '100%', display: 'block' }}>
                {photo.image && <img src={photo.image} alt={`Diary ${index}`} className="w-full h-auto max-h-[600px] object-contain block" />}
              </div>
              {photo.caption && (
                <div className="text-sm text-black leading-relaxed px-2 py-1 mt-1 font-bold inline-block bg-white/80 border border-gray-300 shadow-sm" style={{ fontFamily: 'inherit' }}>
                  └ {photo.caption}
                </div>
              )}
            </div>
          ))}

          {isLegacy && (
            <div className="flex flex-col gap-2">
              {((item as any).image_url || item.imageUrl) && (
                <div style={{ maxWidth: '100%', display: 'block' }}>
                  <img src={(item as any).image_url || item.imageUrl} alt="Legacy Diary" className="w-full h-auto max-h-[600px] object-contain block" />
                </div>
              )}
              {item.content && (
                <div className="text-sm text-black leading-relaxed px-2 py-1 mt-1 font-bold inline-block bg-white/80 border border-gray-300 shadow-sm" style={{ fontFamily: 'inherit' }}>
                  └ {item.content}
                </div>
              )}
            </div>
          )}

          {!isLegacy && gallery.length === 0 && (
            <div className="text-center text-gray-500 italic py-10" style={{ background: 'rgba(255,255,255,0.5)' }}>No content available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Item Component (리스트 아이템)
// ----------------------------------------------------------------------
function DiaryItem({ item, onView, isSmallView }: { item: DiaryEntry, onView: (item: any) => void, isSmallView?: boolean }) {
  const galleryThumb = item.gallery && item.gallery.length > 0 ? item.gallery[0].image : null;
  const legacyThumb = (item as any).image_url || item.imageUrl;
  const thumbUrl = legacyThumb || galleryThumb;
  const photoCount =
    typeof (item as any).photo_count === 'number'
      ? (item as any).photo_count
      : item.gallery
        ? item.gallery.length
        : (thumbUrl ? 1 : 0);
  
  if (isSmallView) {
    return (
      <div onClick={() => onView(item)} style={{ background: 'white', border: '2px outset #dfdfdf', padding: '5px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}
        onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}>
        <div style={{ width: '100%', aspectRatio: '1', marginBottom: '5px', border: '1px solid #000', overflow: 'hidden', background: '#808080', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {thumbUrl ? <img src={thumbUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="#c0c0c0" />}
          {photoCount > 1 && (
            <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#000080', color: 'white', fontSize: '10px', padding: '0 3px', fontWeight: 'bold' }}>+{photoCount - 1}</div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onView(item)} style={{ background: 'white', border: '2px outset #dfdfdf', padding: '10px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}
      onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}>
      <div style={{ width: '100%', aspectRatio: '1', marginBottom: '8px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#808080', position: 'relative' }}>
        {thumbUrl ? <img src={thumbUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="flex flex-col items-center"><ImageIcon size={24} color="#c0c0c0"/><span style={{fontSize:'10px', color:'#c0c0c0', marginTop:'2px'}}>No Image</span></div>}
        {photoCount > 1 && (
          <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: '#000080', color: 'white', fontSize: '11px', padding: '1px 4px', fontWeight: 'bold' }}>+{photoCount - 1} Photos</div>
        )}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 'auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000080', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{item.title}</div>
        <div style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.date}</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. Main Tab Component
// ----------------------------------------------------------------------
export function DiaryTab() {
  const [activeSubTab, setActiveSubTab] = useState<'entries' | 'food' | 'movie' | 'travel' | 'memory'>('entries');

  const getTabStyle = (tabName: string) => {
    const isActive = activeSubTab === tabName;
    return {
      padding: '4px 12px', marginRight: '2px',
      borderTop: isActive ? '2px solid white' : '2px outset #dfdfdf',
      borderLeft: isActive ? '2px solid white' : '2px outset #dfdfdf',
      borderRight: isActive ? '2px solid #808080' : '2px outset #dfdfdf',
      borderBottom: isActive ? 'none' : '2px outset #dfdfdf',
      background: '#c0c0c0', cursor: 'pointer', fontWeight: 'normal', fontSize: '14px', fontFamily: 'inherit',
      position: 'relative' as const, top: isActive ? '2px' : '0', zIndex: isActive ? 10 : 1,
      height: isActive ? '26px' : '24px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px',
    };
  };

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', paddingLeft: '2px' }}>
        {['entries', 'food', 'movie', 'travel', 'memory'].map(tab => (
          <button key={tab} onClick={() => setActiveSubTab(tab as any)} style={getTabStyle(tab)}>
            {tab === 'entries' ? '일기' : tab === 'food' ? '맛집' : tab === 'movie' ? '영화' : tab === 'travel' ? '여행' : '추억'}
          </button>
        ))}
      </div>

      <div style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', borderTop: '2px solid white', padding: '20px', minHeight: SECTION_CONTENT_MIN_HEIGHT, position: 'relative', zIndex: 5 }}>
        <KeepAlivePanels
          active={activeSubTab}
          keys={['entries', 'food', 'movie', 'travel', 'memory']}
          panels={{
            entries: (
              <BoardLayout<DiaryEntry>
                tableName="entries"
                listSelect="id,created_at,title,date,location,image_url,photo_count"
                detailRequiredColumns={['gallery']}
                renderForm={props => <DiaryForm {...props} />}
                renderDetail={props => <DiaryDetail {...props} />}
                renderItem={props => <DiaryItem {...props} />}
                gridCols="grid-cols-1 md:grid-cols-3"
                allowViewToggle={true}
              />
            ),
            food: <FoodTab />,
            movie: <MovieTab />,
            travel: <TravelTab />,
            memory: <MemoryTab />,
          }}
        />
      </div>
    </div>
  );
}