import { useState, useRef } from 'react';
import { Save, Edit2, X, Plus, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Upload, Layout } from 'lucide-react';
import { BoardLayout } from '../shared/BoardLayout';
import { compressImage } from '../../utils/imageCompressor';
import { MemoryEntry, MemoryPhoto } from '../../types';

// [New] 배경 스타일 타입 정의
type BackgroundStyle = 'tile' | 'stretch';

// ----------------------------------------------------------------------
// 1. Form Component (작성/수정)
// ----------------------------------------------------------------------
function MemoryForm({ onSave, onCancel, initialData }: { 
  onSave: (data: any) => void, 
  onCancel: () => void, 
  initialData?: MemoryEntry & { background_url?: string; background_style?: BackgroundStyle } 
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
  const [location, setLocation] = useState(initialData?.location || '');
  
  const [gallery, setGallery] = useState<MemoryPhoto[]>(initialData?.gallery || []);
  
  // [New] 배경화면 상태
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(initialData?.background_url || null);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(initialData?.background_style as BackgroundStyle || 'tile');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // 갤러리 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: MemoryPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImage(file);
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });

      newPhotos.push({
        id: Date.now() + Math.random().toString(),
        image: result,
        caption: ''
      });
    }
    setGallery(prev => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // [New] 배경 이미지 업로드
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file); // 배경도 압축 적용
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  const handleCaptionChange = (id: string, text: string) => {
    setGallery(prev => prev.map(p => p.id === id ? { ...p, caption: text } : p));
  };

  const handleRemovePhoto = (id: string) => {
    setGallery(prev => prev.filter(p => p.id !== id));
  };

  const handleMovePhotoUp = (index: number) => {
    if (index === 0) return;
    setGallery(prev => {
      const newGallery = [...prev];
      const temp = newGallery[index];
      newGallery[index] = newGallery[index - 1];
      newGallery[index - 1] = temp;
      return newGallery;
    });
  };

  const handleMovePhotoDown = (index: number) => {
    if (index === gallery.length - 1) return;
    setGallery(prev => {
      const newGallery = [...prev];
      const temp = newGallery[index];
      newGallery[index] = newGallery[index + 1];
      newGallery[index + 1] = temp;
      return newGallery;
    });
  };

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div className="mb-4 font-bold text-lg text-[#000080]">{initialData ? 'Edit Memory' : 'New Memory'}</div>
      
      {/* 1. 기본 정보 입력 */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block font-bold text-xs mb-1 text-black">Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full p-1 border border-gray-400 bg-white text-sm" 
            style={{ fontFamily: 'inherit' }}
            placeholder="Title" 
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-bold text-xs mb-1 text-black">Date:</label>
            <input 
              type="text" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full p-1 border border-gray-400 bg-white text-sm"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
          <div className="flex-1">
            <label className="block font-bold text-xs mb-1 text-black">Location:</label>
            <input 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              className="w-full p-1 border border-gray-400 bg-white text-sm"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
        </div>
      </div>

      {/* [New] 배경화면 설정 섹션 */}
      <div className="mb-4 bg-[#e0e0e0] p-2 border border-gray-400">
        <label className="block font-bold text-xs mb-2 text-black flex items-center gap-1">
          <Layout size={12}/> Post Background (Optional)
        </label>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => bgInputRef.current?.click()}
            className="bg-white border border-gray-400 px-2 py-1 text-xs flex items-center gap-1 hover:bg-gray-50"
          >
            <Upload size={12}/> {backgroundUrl ? 'Change BG Image' : 'Select BG Image'}
          </button>
          <input 
            type="file" 
            ref={bgInputRef} 
            onChange={handleBackgroundUpload} 
            className="hidden" 
            accept="image/*" 
          />
          
          {backgroundUrl && (
            <div className="flex items-center gap-3 bg-white px-2 py-1 border border-gray-400">
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="bgStyle" 
                  checked={backgroundStyle === 'tile'} 
                  onChange={() => setBackgroundStyle('tile')}
                  className="cursor-pointer"
                />
                <span className="text-xs">바둑판 (Tile)</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="bgStyle" 
                  checked={backgroundStyle === 'stretch'} 
                  onChange={() => setBackgroundStyle('stretch')}
                  className="cursor-pointer"
                />
                <span className="text-xs">늘이기 (Stretch)</span>
              </label>
            </div>
          )}

          {backgroundUrl && (
            <button onClick={() => setBackgroundUrl(null)} className="text-red-600 text-xs hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>

      {/* 2. 사진 및 캡션 영역 */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <label className="block font-bold text-xs text-black">Gallery ({gallery.length})</label>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-300 border-2 border-outset border-gray-200 px-2 py-0.5 text-xs font-bold flex items-center gap-1 active:border-inset"
          >
            <Plus size={10}/> Add Photos
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*" 
            multiple 
          />
        </div>

        <div className="bg-white p-2 border-2 border-inset border-[#dfdfdf] min-h-[150px] overflow-y-auto max-h-[400px]">
          {gallery.length === 0 && (
            <div className="text-center text-gray-400 text-xs py-10" style={{ fontFamily: 'inherit' }}>
              No photos added.
            </div>
          )}
          
          {gallery.map((photo, index) => (
            <div key={photo.id} className="bg-[#c0c0c0] border-2 border-outset border-[#dfdfdf] p-2 mb-2">
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-400 border-dotted">
                <span className="text-xs font-bold text-[#000080]">Image #{index + 1}</span>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleMovePhotoUp(index)} 
                    disabled={index === 0}
                    className={`p-0.5 bg-gray-300 border border-outset border-gray-200 active:border-inset ${index === 0 ? 'opacity-50' : ''}`}
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button 
                    onClick={() => handleMovePhotoDown(index)} 
                    disabled={index === gallery.length - 1}
                    className={`p-0.5 bg-gray-300 border border-outset border-gray-200 active:border-inset ${index === gallery.length - 1 ? 'opacity-50' : ''}`}
                  >
                    <ArrowDown size={10} />
                  </button>
                  <button 
                    onClick={() => handleRemovePhoto(photo.id)} 
                    className="p-0.5 bg-gray-300 border border-outset border-gray-200 active:border-inset ml-1" 
                  >
                    <Trash2 size={10} color="#b91c1c" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 items-start flex-col sm:flex-row">
                <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-400 border-2 border-inset border-[#dfdfdf] flex items-center justify-center overflow-hidden">
                  <img src={photo.image} alt="preview" className="w-full h-full object-cover" />
                </div>
                
                <div className="w-full">
                  <textarea 
                    value={photo.caption} 
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                    placeholder="Enter caption..."
                    className="w-full h-32 p-1 text-sm border border-gray-400 bg-white resize-none"
                    style={{ fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button 
          onClick={() => onSave({ 
            title, date, location, gallery, 
            background_url: backgroundUrl, 
            background_style: backgroundStyle 
          })} 
          className="bg-gray-300 border-2 border-outset border-gray-200 px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"
        >
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
function MemoryDetail({ item, onBack, onEdit, onDelete }: { item: MemoryEntry & { background_url?: string; background_style?: string }, onBack: () => void, onEdit: (item: any) => void, onDelete: (id: string) => void }) {
  const gallery = item.gallery || []; 

  // [New] 배경 스타일 계산
  const bgStyle = item.background_url ? {
    backgroundImage: `url(${item.background_url})`,
    backgroundRepeat: item.background_style === 'stretch' ? 'no-repeat' : 'repeat',
    backgroundSize: item.background_style === 'stretch' ? '100% 100%' : 'auto',
    backgroundPosition: 'center top'
  } : { background: 'white' }; // 기본값

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}>&lt;&lt;</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onEdit(item)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><Edit2 size={14} /></button>
          <button onClick={() => onDelete(item.id)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><X size={14} /></button>
        </div>
      </div>

      <div style={{ 
        ...bgStyle, // [New] 배경 적용
        border: '2px inset #dfdfdf', 
        padding: '15px', 
        minHeight: '400px',
        marginLeft: '-10px', 
        marginRight: '-10px' 
      }}>
        {/* 헤더 정보 - 배경이 있을 경우 가독성을 위해 반투명 흰색 박스 처리 고려 가능하지만, 원본 요청대로 유지 */}
        <div style={{ marginBottom: '15px', borderBottom: '1px solid #000', paddingBottom: '5px', background: 'rgba(255,255,255,0.7)', padding: '10px', backdropFilter: 'blur(2px)' }}>
          <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '18px', marginBottom: '5px' }}>{item.title}</div>
          <div style={{ fontSize: '14px', color: '#0000ff', fontWeight: 'bold', marginBottom: '2px' }}>{item.date}</div>
          <div style={{ fontSize: '14px', color: '#008000' }}>Location: {item.location}</div>
        </div>

        {/* 갤러리 렌더링 (사진 -> 캡션 순서) */}
        <div className="space-y-8">
          {gallery.length > 0 ? (
            gallery.map((photo, index) => (
              <div key={photo.id || index} className="flex flex-col gap-2">
                <div style={{ maxWidth: '100%', display: 'block' }}>
                    <img 
                      src={photo.image} 
                      alt={`Memory ${index}`} 
                      className="w-full h-auto max-h-[600px] object-contain block" 
                    />
                </div>
                {photo.caption && (
                  // 캡션 가독성을 위해 흰색 배경 살짝 추가
                  <div className="text-sm text-black leading-relaxed px-2 py-1 mt-1 font-bold inline-block bg-white/80 border border-gray-300 shadow-sm" style={{ fontFamily: 'inherit' }}>
                    └ {photo.caption}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 italic py-10" style={{ background: 'rgba(255,255,255,0.5)' }}>No photos in this memory.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Item Component (리스트 아이템)
// ----------------------------------------------------------------------
function MemoryItem({ item, onView, isSmallView }: { item: MemoryEntry, onView: (item: any) => void, isSmallView?: boolean }) {
  const firstPhoto = item.gallery && item.gallery.length > 0 ? item.gallery[0] : null;
  const photoCount = item.gallery ? item.gallery.length : 0;

  if (isSmallView) {
    return (
      <div 
        onClick={() => onView(item)}
        style={{ 
          background: 'white', 
          border: '2px outset #dfdfdf', 
          padding: '5px', 
          cursor: 'pointer', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' // 폰트 강제 적용
        }}
        onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
        onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
      >
        <div style={{ 
          width: '100%', 
          aspectRatio: '1', 
          marginBottom: '5px', 
          border: '1px solid #000', 
          overflow: 'hidden', 
          background: '#808080',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {firstPhoto ? (
            <img src={firstPhoto.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageIcon size={24} color="#c0c0c0" />
          )}
          
          {photoCount > 1 && (
            <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#000080', color: 'white', fontSize: '10px', padding: '0 3px', fontWeight: 'bold' }}>
              +{photoCount - 1}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
        </div>
      </div>
    );
  }

  // 기본 보기
  return (
    <div 
      onClick={() => onView(item)}
      style={{ 
        background: 'white', 
        border: '2px outset #dfdfdf', 
        padding: '10px', 
        cursor: 'pointer', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' // 폰트 강제 적용
      }}
      onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
      onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
    >
      <div style={{ 
        width: '100%', 
        aspectRatio: '1', 
        marginBottom: '8px', 
        border: '1px solid #000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden', 
        background: '#808080',
        position: 'relative'
      }}>
        {firstPhoto ? (
          <img src={firstPhoto.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="flex flex-col items-center">
            <ImageIcon size={24} color="#c0c0c0" />
            <span style={{ fontSize: '10px', color: '#c0c0c0', marginTop: '2px' }}>No Image</span>
          </div>
        )}
         {photoCount > 1 && (
            <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: '#000080', color: 'white', fontSize: '11px', padding: '1px 4px', fontWeight: 'bold' }}>
              +{photoCount - 1} Photos
            </div>
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
export function MemoryTab() {
  return (
    <div className="w-full h-full font-dotmatrix" style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <BoardLayout<MemoryEntry>
        tableName="memory_entries" 
        renderForm={props => <MemoryForm {...props} />}
        renderDetail={props => <MemoryDetail {...props} />}
        renderItem={props => <MemoryItem {...props} />}
        gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        allowViewToggle={true} 
      />
    </div>
  );
}