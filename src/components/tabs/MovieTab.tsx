import { useState } from 'react';
import { Save, X, Edit2, Star, StarHalf } from 'lucide-react';
import { BoardLayout } from '../shared/BoardLayout';
import { compressImage } from '../../utils/imageCompressor';

function MovieForm({ onSave, onCancel, initialData }: any) {
  const [movie_title, setTitle] = useState(initialData?.movie_title || '');
  const [review_line, setReviewLine] = useState(initialData?.review_line || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [poster_url, setPosterUrl] = useState(initialData?.poster_url || null);

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterUrl(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  };

  return (
    <div>
      <div className="mb-4 font-bold text-lg text-purple-800">Movie Review</div>
      <div className="space-y-3">
        <input type="file" onChange={handlePosterUpload} className="w-full bg-white border border-gray-400 text-xs" />
        {poster_url && <img src={poster_url} alt="Poster" className="w-24 border border-gray-400" />}
        <input placeholder="Movie Title" value={movie_title} onChange={e => setTitle(e.target.value)} className="w-full p-1 border border-gray-400 text-sm" />
        <input placeholder="One-line Review" value={review_line} onChange={e => setReviewLine(e.target.value)} className="w-full p-1 border border-gray-400 text-sm" />
        <input placeholder="Date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-1 border border-gray-400 text-sm" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">Rating:</span>
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border border-gray-400 text-sm">
            {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <textarea placeholder="Full Review" value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full p-1 border border-gray-400 text-sm" />
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={() => onSave({ movie_title, review_line, content, date, rating, poster_url })} className="bg-gray-300 border-2 border-outset px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><Save size={12}/> Save</button>
        <button onClick={onCancel} className="bg-gray-300 border-2 border-outset px-3 py-1 text-xs font-bold flex items-center gap-1 active:border-inset"><X size={12}/> Cancel</button>
      </div>
    </div>
  );
}

function MovieDetail({ item, onBack, onEdit, onDelete }: any) {
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
          <div style={{ fontWeight: 'bold', color: '#800080', fontSize: '18px', marginBottom: '5px' }}>{item.movie_title}</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>{item.review_line}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            {renderStars(item.rating)} <span style={{ fontSize: '12px', color: '#666' }}>({item.rating})</span>
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>{item.date}</div>
        </div>
        {item.poster_url && <div style={{ marginBottom: '10px' }}><img src={item.poster_url} alt="Poster" style={{ maxWidth: '100%', width: '300px', height: 'auto', border: '1px solid #000' }} /></div>}
        <div style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.content}</div>
      </div>
    </div>
  );
}

// [수정] 호버 효과 복구
function MovieItem({ item, onView }: any) {
  const renderStars = (r: number) => <div style={{ display: 'flex', gap: '2px' }}>{Array(Math.floor(r)).fill(0).map((_, i) => <Star key={i} size={12} fill="#FFD700" color="#FFD700"/>)}{r % 1 !== 0 && <StarHalf size={12} fill="#FFD700" color="#FFD700"/>}</div>;

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
        flexDirection: 'column'
      }}
      onMouseOver={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
      onMouseOut={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
    >
      <div style={{ 
        width: '100%', 
        aspectRatio: '2/3', 
        marginBottom: '8px', 
        border: '1px solid #000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden', 
        background: '#f0f0f0' 
      }}>
        {item.poster_url ? <img src={item.poster_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize: '12px', color: '#999'}}>No Poster</span>}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#800080', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.review_line}</div>
        <div style={{ fontSize: '10px', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{item.movie_title}</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>{renderStars(item.rating)}</div>
      </div>
    </div>
  );
}

export function MovieTab() {
  return (
    <div className="w-full h-full">
      <BoardLayout 
        tableName="movie_entries"
        listSelect="id,created_at,movie_title,review_line,date,rating,poster_url"
        detailRequiredColumns={['content']}
        renderForm={props => <MovieForm {...props} />}
        renderDetail={props => <MovieDetail {...props} />}
        renderItem={props => <MovieItem {...props} />}
        gridCols="grid-cols-2 md:grid-cols-4"
      />
    </div>
  );
}