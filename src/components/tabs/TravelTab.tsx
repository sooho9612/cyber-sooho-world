import { useState, useRef, useEffect } from 'react';
import { Save, Edit2, X, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Upload, Layout, ChevronDown } from 'lucide-react';
import { BoardLayout } from '../shared/BoardLayout';
import { compressImage } from '../../utils/imageCompressor';
import { TravelEntry, MemoryPhoto } from '../../types';
import { supabase } from '../../supabaseClient';

type BackgroundStyle = 'tile' | 'stretch';

// [New] Windows 2000 Style Combobox Component
function Combobox({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: string[], 
  placeholder?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1" style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      {/* Input Area */}
      <div className="flex bg-white border-2 border-[inset] border-[#dfdfdf] items-center h-[24px]">
        <input 
          type="text" 
          value={value} 
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 w-full border-none outline-none px-1 text-sm bg-transparent"
          style={{ fontFamily: 'inherit' }}
        />
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-[18px] h-full bg-[#c0c0c0] border-2 border-[outset] border-[#dfdfdf] flex items-center justify-center active:border-[inset]"
        >
          <ChevronDown size={10} color="black" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && options.length > 0 && (
        <div className="absolute top-[26px] left-0 w-full max-h-[150px] overflow-y-auto bg-white border border-black z-50 shadow-md">
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              className="px-1 py-0.5 hover:bg-[#000080] hover:text-white cursor-pointer text-sm truncate"
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. Form Component
// ----------------------------------------------------------------------
function TravelForm({ onSave, onCancel, initialData }: { 
  onSave: (data: any) => void, 
  onCancel: () => void, 
  initialData?: TravelEntry  | null
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [region, setRegion] = useState(initialData?.region || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
  
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>((initialData as any)?.background_url || null);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>((initialData as any)?.background_style as BackgroundStyle || 'tile');

  const [locations, setLocations] = useState<{country: string, region: string}[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from('travel_locations').select('country, region');
      if (data) setLocations(data);
    };
    fetchLocations();
  }, []);

  const uniqueCountries = Array.from(new Set(locations.map(l => l.country))).filter(c => c);
  const availableRegions = locations
    .filter(l => l.country === country && l.region) 
    .map(l => l.region);
  const uniqueRegions = Array.from(new Set(availableRegions));

  const [gallery, setGallery] = useState<MemoryPhoto[]>(() => {
    let initialGallery: MemoryPhoto[] = [];
    if ((initialData as any)?.gallery && (initialData as any).gallery.length > 0) {
      initialGallery = [...(initialData as any).gallery];
    } else if (initialData?.thumbnail_url || initialData?.content) {
      initialGallery = [{
        id: 'legacy_migrated',
        image: initialData.thumbnail_url || '', 
        caption: initialData.content || ''
      }];
    }
    const lastItem = initialGallery[initialGallery.length - 1];
    if (!lastItem || (lastItem.image || lastItem.caption)) {
      initialGallery.push({ id: Date.now().toString(), image: '', caption: '' });
    }
    return initialGallery;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    const lastItem = gallery[gallery.length - 1];
    if (lastItem && (lastItem.image || lastItem.caption)) {
      setGallery(prev => [...prev, { id: Date.now() + Math.random().toString(), image: '', caption: '' }]);
    }
  }, [gallery]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || uploadTargetIndex === null) return;
    const newPhotos: MemoryPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImage(files[i]);
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });
      newPhotos.push({ id: Date.now() + Math.random().toString() + i, image: result, caption: '' });
    }
    setGallery(prev => {
      const newGallery = [...prev];
      newGallery[uploadTargetIndex] = { ...newGallery[uploadTargetIndex], image: newPhotos[0].image };
      if (newPhotos.length > 1) newGallery.splice(uploadTargetIndex + 1, 0, ...newPhotos.slice(1));
      return newGallery;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadTargetIndex(null);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>, index: number) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const compressed = await compressImage(blob);
          const reader = new FileReader();
          reader.onloadend = () => {
            setGallery(prev => {
              const newGallery = [...prev];
              newGallery[index] = { ...newGallery[index], image: reader.result as string };
              return newGallery;
            });
          };
          reader.readAsDataURL(compressed);
        }
        break;
      }
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  };

  const handleSaveWrapper = async () => {
    if (country) {
      const exists = locations.some(l => l.country === country && l.region === region);
      if (!exists) {
        await supabase.from('travel_locations').upsert({ country, region }, { onConflict: 'country, region' });
      }
    }

    const cleanGallery = gallery.filter(item => item.image || item.caption.trim());
    // List projection uses thumbnail_url + photo_count (avoid shipping full gallery on list)
    const firstImage = cleanGallery.find((p) => p.image)?.image || null;
    onSave({ 
      title, country, region, date, 
      gallery: cleanGallery,
      thumbnail_url: firstImage,
      photo_count: cleanGallery.length,
      background_url: backgroundUrl, 
      background_style: backgroundStyle 
    });
  };

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div className="mb-4 font-bold text-lg text-blue-600">Travel Log Editor</div>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" multiple />

      <div className="space-y-3 mb-4">
        <input placeholder="Travel Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-1 border border-gray-400 bg-white text-sm" style={{ fontFamily: 'inherit' }} />
        
        <div className="flex gap-2 relative z-20">
          <Combobox 
            value={country} 
            onChange={(val) => { setCountry(val); setRegion(''); }}
            options={uniqueCountries} 
            placeholder="Country" 
          />
          <Combobox 
            value={region} 
            onChange={setRegion} 
            options={uniqueRegions}
            placeholder="Region" 
          />
        </div>

        <input placeholder="Date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-1 border border-gray-400 bg-white text-sm" style={{ fontFamily: 'inherit' }} />
      </div>

      <div className="mb-4 bg-[#e0e0e0] p-2 border border-gray-400">
        <label className="block font-bold text-xs mb-2 text-black flex items-center gap-1"><Layout size={12}/> Post Background</label>
        <div className="flex items-center gap-4">
          <button onClick={() => bgInputRef.current?.click()} className="bg-white border border-gray-400 px-2 py-1 text-xs flex items-center gap-1 hover:bg-gray-50"><Upload size={12}/> {backgroundUrl ? 'Change' : 'Select'} BG</button>
          <input type="file" ref={bgInputRef} onChange={handleBackgroundUpload} className="hidden" accept="image/*" />
          {backgroundUrl && (
            <div className="flex items-center gap-3 bg-white px-2 py-1 border border-gray-400">
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={backgroundStyle === 'tile'} onChange={() => setBackgroundStyle('tile')} /><span className="text-xs">Tile</span></label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={backgroundStyle === 'stretch'} onChange={() => setBackgroundStyle('stretch')} /><span className="text-xs">Stretch</span></label>
            </div>
          )}
          {backgroundUrl && <button onClick={() => setBackgroundUrl(null)} className="text-red-600 text-xs hover:underline">Remove</button>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-bold text-xs text-black mb-1">Travel Gallery ({gallery.filter(i => i.image || i.caption).length})</label>
        <div className="bg-white p-2 border-2 border-inset border-[#dfdfdf] min-h-[150px] overflow-y-auto max-h-[400px]">
          {gallery.map((photo, index) => (
            <div key={photo.id} className="bg-[#c0c0c0] border-2 border-outset border-[#dfdfdf] p-2 mb-2">
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-400 border-dotted">
                <span className="text-xs font-bold text-[#000080]">Step #{index + 1}</span>
                {index < gallery.length - 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => {const n=[...gallery]; [n[index],n[index-1]]=[n[index-1],n[index]]; setGallery(n)}} disabled={index===0} className="p-0.5 bg-gray-300 border border-outset disabled:opacity-50"><ArrowUp size={10}/></button>
                    <button onClick={() => {const n=[...gallery]; [n[index],n[index+1]]=[n[index+1],n[index]]; setGallery(n)}} disabled={index===gallery.length-2} className="p-0.5 bg-gray-300 border border-outset disabled:opacity-50"><ArrowDown size={10}/></button>
                    <button onClick={() => setGallery(gallery.filter(p=>p.id!==photo.id))} className="p-0.5 bg-gray-300 border border-outset ml-1"><Trash2 size={10} color="#b91c1c"/></button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-start flex-col sm:flex-row">
                <div 
                  className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-400 border-2 border-inset flex items-center justify-center overflow-hidden cursor-pointer focus:border-blue-500 outline-none"
                  tabIndex={0} onDoubleClick={() => {setUploadTargetIndex(index); fileInputRef.current?.click()}} onPaste={(e) => handlePaste(e, index)}
                >
                  {photo.image ? <img src={photo.image} className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon size={20} className="mx-auto text-gray-300"/><span className="text-[10px] text-white block mt-1">Paste/DblClick</span></div>}
                </div>
                <textarea value={photo.caption} onChange={(e) => setGallery(gallery.map(p=>p.id===photo.id?{...p, caption:e.target.value}:p))} placeholder="Write about this place..." className="w-full h-32 p-1 text-sm border border-gray-400 bg-white resize-none" style={{ fontFamily: 'inherit' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={handleSaveWrapper} className="bg-gray-300 border-2 border-outset px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><Save size={12}/> Save</button>
        <button onClick={onCancel} className="bg-gray-300 border-2 border-outset px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><X size={12}/> Cancel</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Detail Component
// ----------------------------------------------------------------------
function TravelDetail({ item, onBack, onEdit, onDelete }: any) {
  const gallery = item.gallery || [];
  const isLegacy = gallery.length === 0 && (item.content || item.thumbnail_url);
  const bgStyle = item.background_url ? {
    backgroundImage: `url(${item.background_url})`,
    backgroundRepeat: item.background_style === 'stretch' ? 'no-repeat' : 'repeat',
    backgroundSize: item.background_style === 'stretch' ? '100% 100%' : 'auto',
    backgroundPosition: 'center top'
  } : { background: 'white' };

  return (
    <div style={{ fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}>
      <div className="flex justify-between mb-4">
        <button onClick={onBack} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold' }}>&lt;&lt;</button>
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px' }}><Edit2 size={14} /></button>
          <button onClick={() => onDelete(item.id)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px' }}><X size={14} /></button>
        </div>
      </div>

      <div style={{ ...bgStyle, border: 'none', padding: '15px', minHeight: '400px', marginLeft: '-10px', marginRight: '-10px' }}>
        <div style={{ marginBottom: '15px', borderBottom: '1px solid #000', paddingBottom: '5px', background: 'rgba(255,255,255,0.8)', padding: '10px', backdropFilter: 'blur(2px)' }}>
          <div style={{ fontWeight: 'bold', color: '#0066cc', fontSize: '18px', marginBottom: '5px' }}>{item.title}</div>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <span style={{ color: '#008000' }}>🌍 {item.country}</span>
            {item.region && <span style={{ color: '#666' }}>📍 {item.region}</span>}
            <span style={{ color: '#999' }}>📅 {item.date}</span>
          </div>
        </div>

        <div className="space-y-8">
          {gallery.length > 0 && gallery.map((photo: any, index: number) => (
            <div key={index} className="flex flex-col gap-2">
              <div style={{ maxWidth: '100%', display: 'block' }}>
                {photo.image && <img src={photo.image} className="w-full h-auto max-h-[600px] object-contain block shadow-lg" />}
              </div>
              {photo.caption && (
                <div
                  className="text-sm text-black leading-relaxed px-2 py-1 font-bold bg-white/80 border border-gray-300 shadow-sm"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block', maxWidth: '100%' }}
                >
                  └ {photo.caption}
                </div>
              )}
            </div>
          ))}
          {isLegacy && (
            <div className="flex flex-col gap-2">
              {item.thumbnail_url && <img src={item.thumbnail_url} className="w-full h-auto max-h-[600px] object-contain block shadow-lg" />}
              {item.content && (
                <div
                  className="text-sm text-black leading-relaxed px-2 py-1 font-bold bg-white/80 border border-gray-300"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block', maxWidth: '100%' }}
                >
                  └ {item.content}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Item Component
// ----------------------------------------------------------------------
function TravelItem({ item, onView, isSmallView }: any) {
  // Prefer denormalized list fields; fall back to gallery only if full row is present
  const thumbUrl =
    item.thumbnail_url ||
    (item.gallery && item.gallery.length > 0 ? item.gallery[0].image : null);
  const photoCount =
    typeof item.photo_count === 'number'
      ? item.photo_count
      : item.gallery
        ? item.gallery.length
        : (item.thumbnail_url ? 1 : 0);

  return (
    <div 
      onClick={() => onView(item)}
      style={{ background: 'white', border: '2px outset #dfdfdf', padding: isSmallView ? '5px' : '10px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: '"DungGeunMo", "DotMatrix", sans-serif' }}
      onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'} onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
    >
      <div style={{ width: '100%', aspectRatio: isSmallView ? '1' : '4/3', marginBottom: isSmallView ? '5px' : '8px', border: '1px solid #000', overflow: 'hidden', background: '#808080', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {thumbUrl ? <img src={thumbUrl} className="w-full h-full object-cover" /> : <ImageIcon size={24} color="#c0c0c0" />}
        {photoCount > 1 && (
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#000080', color: 'white', fontSize: '10px', padding: '1px 4px', fontWeight: 'bold' }}>
            +{photoCount - 1} {isSmallView ? '' : 'Pics'}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 'auto' }}>
        <div style={{ fontSize: isSmallView ? '11px' : '12px', fontWeight: 'bold', color: '#0066cc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
        {!isSmallView && (
          <>
            <div style={{ fontSize: '10px', color: '#008000' }}>🌍 {item.country}</div>
            <div style={{ fontSize: '9px', color: '#666' }}>📅 {item.date}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function TravelTab() {
  // [New] 국가 목록 상태 관리
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      // travel_locations 테이블에서 country 컬럼을 가져옴 (가나다순 정렬)
      const { data } = await supabase
        .from('travel_locations')
        .select('country')
        .order('country', { ascending: true });

      if (data) {
        // 중복 제거 (Set)
        const uniqueCountries = Array.from(new Set(data.map((item: any) => item.country))).filter(Boolean);
        setCountries(uniqueCountries);
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="w-full h-full">
      <BoardLayout<TravelEntry>
        tableName="travel_entries"
        // Slim list: gallery/background base64 can be multi-MB per row
        listSelect="id,created_at,title,country,region,date,thumbnail_url,photo_count"
        detailRequiredColumns={['gallery']}
        renderForm={props => <TravelForm {...props} />}
        renderDetail={props => <TravelDetail {...props} />}
        renderItem={props => <TravelItem {...props} />}
        gridCols="grid-cols-1 md:grid-cols-3"
        allowViewToggle={true}
        // [New] 필터링 정보 전달
        filterOptions={countries} // DB에서 가져온 국가 목록
        filterColumn="country"    // DB에서 필터링할 컬럼명
      />
    </div>
  );
}