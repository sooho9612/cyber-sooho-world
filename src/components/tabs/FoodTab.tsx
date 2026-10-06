import { useState } from 'react';
import { Save, X, Edit2, Star, StarHalf } from 'lucide-react';
import { BoardLayout } from '../shared/BoardLayout';
import { compressImage } from '../../utils/imageCompressor';
import { ASSETS } from '../../config/assets';

function FoodForm({ onSave, onCancel, initialData }: any) {
  const [restaurant, setRestaurant] = useState(initialData?.restaurant || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
  const [location, setLocation] = useState(initialData?.location || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [revisit, setRevisit] = useState(initialData?.revisit || false);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  };

  const handlePriceFocus = () => {
    setPrice(price.replace(/[^0-9]/g, ''));
  };

  const handlePriceBlur = () => {
    const num = price.replace(/[^0-9]/g, '');
    if (num) {
      setPrice(Number(num).toLocaleString() + '원');
    }
  };

  return (
    <div>
      <div className="mb-4 font-bold text-lg text-teal-800">Food Logger</div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
            <button className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs whitespace-nowrap">Choose File</button>
            <input type="file" onChange={handleImageUpload} className="w-full text-xs" />
        </div>
        
        {imageUrl && <img src={imageUrl} alt="Preview" className="w-32 border border-gray-400" />}
        
        <input placeholder="Restaurant" value={restaurant} onChange={e => setRestaurant(e.target.value)} className="w-full p-1 border border-gray-400 text-sm" />
        <input placeholder="Menu Name" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-1 border border-gray-400 text-sm" />
        
        <div className="flex gap-2 w-full">
          <input 
            placeholder="Date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="flex-1 min-w-0 p-1 border border-gray-400 text-sm" 
          />
          <input 
            placeholder="Price" 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            onFocus={handlePriceFocus} 
            onBlur={handlePriceBlur}   
            className="flex-1 min-w-0 p-1 border border-gray-400 text-sm" 
          />
        </div>
        
        <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-1 border border-gray-400 text-sm" />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">Rating:</span>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border border-gray-400 text-sm">
              {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={revisit} 
              onChange={(e) => setRevisit(e.target.checked)}
              className="w-3 h-3 cursor-pointer"
            />
            <span className="text-xs font-bold text-teal-900">재방문</span>
          </label>
        </div>
        
        <textarea placeholder="Review" value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full p-1 border border-gray-400 text-sm" />
      </div>
      
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={() => onSave({ restaurant, title, content, date, location, price, rating, revisit, image_url: imageUrl })} className="bg-gray-300 border-2 border-outset px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><Save size={12}/> Save</button>
        <button onClick={onCancel} className="bg-gray-300 border-2 border-outset px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><X size={12}/> Cancel</button>
      </div>
    </div>
  );
}

function FoodDetail({ item, onBack, onEdit, onDelete }: any) {
  const renderStars = (r: number) => <div className="flex gap-0.5">{Array(Math.floor(r)).fill(0).map((_, i) => <Star key={i} size={12} fill="#FFD700" color="#FFD700"/>)}{r % 1 !== 0 && <StarHalf size={12} fill="#FFD700" color="#FFD700"/>}</div>;
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}>&lt;&lt;</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onEdit(item)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><Edit2 size={14} /></button>
          <button onClick={() => onDelete(item.id)} style={{ background: '#c0c0c0', border: '3px outset #dfdfdf', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseDown={(e) => e.currentTarget.style.border = '3px inset #dfdfdf'} onMouseUp={(e) => e.currentTarget.style.border = '3px outset #dfdfdf'}><X size={14} /></button>
        </div>
      </div>
      <div style={{ background: 'white', border: '2px inset #dfdfdf', padding: '15px' }}>
        <div style={{ marginBottom: '10px', borderBottom: '1px solid #000', paddingBottom: '5px' }}>
          <div style={{ fontWeight: 'bold', color: '#800000', fontSize: '18px', marginBottom: '5px' }}>{item.restaurant}</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>{item.title}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            {renderStars(item.rating)} 
            <span style={{fontSize: '12px', color: '#666'}}>({item.rating})</span>
            {item.revisit && (
              <span style={{ fontSize: '11px', color: 'white', background: '#008080', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                재방문 의사 있음!
              </span>
            )}
          </div>
          
          <div style={{ fontSize: '13px', color: '#008000', marginBottom: '2px' }}>📍 {item.location || 'No Address'}</div>
          <div style={{ fontSize: '13px', color: '#0000ff' }}>💰 {item.price || '-'}</div>
        </div>
        {item.image_url && <div style={{ marginBottom: '10px' }}><img src={item.image_url} alt="Food" style={{ maxWidth: '100%', width: '300px', height: 'auto', border: '1px solid #000' }} /></div>}
        <div style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.content}</div>
      </div>
    </div>
  );
}

// [수정] 뱃지 및 스타일링 로직 추가
function FoodItem({ item, onView, isSmallView }: any) {
  const renderStars = (r: number) => <div style={{ display: 'flex', gap: '2px' }}>{Array(Math.floor(r)).fill(0).map((_, i) => <Star key={i} size={12} fill="#FFD700" color="#FFD700"/>)}{r % 1 !== 0 && <StarHalf size={12} fill="#FFD700" color="#FFD700"/>}</div>;

  // 1. 조건부 스타일링 변수
  const isHighRated = item.rating >= 4;
  const isRevisit = item.revisit;

  const itemBackgroundColor = isHighRated ? '#ffffcc' : 'white'; // 4점 이상: 연한 노랑
  const itemBorder = isRevisit ? '2px solid #0000ff' : '2px outset #dfdfdf'; // 재방문: 파란 실선

  // 2. 뱃지 렌더링 함수 (중복 제거)
  const renderBadges = () => (
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column', // 세로로 쌓기
      alignItems: 'flex-start',
      gap: '1px' 
    }}>
      {/* 별점 뱃지 (4점 이상일 때) */}
      {isHighRated && (
        <div style={{
          background: '#0000ff', // 파란 배경
          color: '#ffff00',    // 노란 글씨
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '1px 3px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <img 
            src={ASSETS.star} 
            alt="star" 
            style={{ width: '10px', height: '10px', objectFit: 'contain' }}
          />
          <span>: {item.rating}</span>
        </div>
      )}

      {/* 재방문 뱃지 */}
      {isRevisit && (
        <div style={{
          background: '#0000ff',
          color: '#ffff00',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '1px 3px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <img 
            src={ASSETS.smile} 
            alt="smile" 
            style={{ width: '10px', height: '10px', objectFit: 'contain' }}
          />
          <span>[재방문의사!]</span>
        </div>
      )}
    </div>
  );

  // [Case 1] 작게 보기
  if (isSmallView) {
    return (
      <div 
        onClick={() => onView(item)}
        style={{ 
          background: itemBackgroundColor, // 배경색 적용
          border: itemBorder,              // 테두리 적용
          padding: '5px', 
          cursor: 'pointer', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        // Hover 시에는 기본 inset/outset 효과 유지 (테두리 색은 유지하면서 스타일만 바꿈)
        onMouseOver={(e) => {
           // 재방문일 땐 파란색 유지하되 스타일만 inset 느낌 내기 위해 border-style 변경 고려 가능하나
           // 간단하게 기본 동작 유지하거나, 파란색을 유지하려면 아래 코드 수정 필요.
           // 여기서는 사용자 요청(파란색)을 우선시하여 Hover시에도 파란색 유지하려면 
           // 별도 CSS 클래스가 낫지만, 기존 로직 따름 (Hover시 기본 회색 inset으로 변함 -> 클릭 느낌)
           // 만약 파란색을 '유지'하고 싶다면 아래 이벤트를 막아야 함. 
           // 일단 기존 로직(클릭감)을 위해 놔두되, 평소엔 파란색임.
           e.currentTarget.style.border = isRevisit ? '2px solid #000080' : '2px inset #dfdfdf'; 
        }}
        onMouseOut={(e) => e.currentTarget.style.border = itemBorder}
      >
        <div style={{ 
          width: '100%', 
          aspectRatio: '1', 
          marginBottom: '5px', 
          border: '1px solid #000', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden', 
          background: '#f0f0f0',
          position: 'relative' 
        }}>
          {renderBadges()} {/* 뱃지 적용 */}
          {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <span style={{fontSize: '10px', color: '#999'}}>No Img</span>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#800000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.restaurant}</div>
        </div>
      </div>
    );
  }

  // [Case 2] 기본 보기 (크게 보기)
  return (
    <div 
      onClick={() => onView(item)}
      style={{ 
        background: itemBackgroundColor, // 배경색 적용
        border: itemBorder,              // 테두리 적용
        padding: '10px', 
        cursor: 'pointer', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseOver={(e) => e.currentTarget.style.border = isRevisit ? '2px solid #000080' : '2px inset #dfdfdf'}
      onMouseOut={(e) => e.currentTarget.style.border = itemBorder}
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
        background: '#f0f0f0',
        position: 'relative' 
      }}>
        {renderBadges()} {/* 뱃지 적용 */}
        {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <span style={{fontSize: '12px', color: '#999'}}>No Image</span>}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 'auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#800000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{item.restaurant}</div>
        <div style={{ fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{item.title}</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>{renderStars(item.rating)}</div>
        <div style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.price}</div>
      </div>
    </div>
  );
}

export function FoodTab() {
  return (
    <div className="w-full h-full">
      <BoardLayout 
        tableName="food_entries"
        renderForm={props => <FoodForm {...props} />}
        renderDetail={props => <FoodDetail {...props} />}
        renderItem={props => <FoodItem {...props} />}
        gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        allowViewToggle={true} 
      />
    </div>
  );
}
