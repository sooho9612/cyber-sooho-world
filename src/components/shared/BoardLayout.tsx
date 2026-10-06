import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { LayoutGrid, List, Globe } from 'lucide-react'; // Globe 아이콘 추가

interface BoardLayoutProps {
  tableName: string;
  itemsPerPage?: number;
  renderDetail: (props: {
    item: any;
    onBack: () => void;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
  }) => React.ReactNode;
  renderForm: (props: { 
    onSave: (data: any) => Promise<void>; 
    onCancel: () => void; 
    initialData: any | null; 
  }) => React.ReactNode;
  renderItem: (props: { 
    item: any; 
    onView: (item: any) => void; 
    onEdit: (item: any) => void; 
    onDelete: (id: string) => void;
    isSmallView?: boolean;
  }) => React.ReactNode;
  gridCols?: string; 
  allowViewToggle?: boolean;
  // [New] 필터링을 위한 Props 추가
  filterOptions?: string[]; // 필터 버튼 목록 (예: ['Thailand', 'Vietnam'])
  filterColumn?: string;    // 필터링할 DB 컬럼명 (예: 'country')
}

export function BoardLayout({ 
  tableName, 
  itemsPerPage = 6, 
  renderDetail,
  renderForm, 
  renderItem,
  gridCols = "grid-cols-1",
  allowViewToggle = false,
  filterOptions = [], // 기본값 빈 배열
  filterColumn,       // 필터 컬럼
}: BoardLayoutProps) {
  
  const [items, setItems] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isWriting, setIsWriting] = useState(false);
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // [New] 현재 활성화된 필터 (null이면 All)
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [isSmallView, setIsSmallView] = useState(() => {
    if (!allowViewToggle) return false;
    const savedMode = localStorage.getItem(`viewMode_${tableName}`);
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    if (allowViewToggle) {
      localStorage.setItem(`viewMode_${tableName}`, JSON.stringify(isSmallView));
    }
  }, [isSmallView, allowViewToggle, tableName]);

  // [수정] 필터가 변경되어도 데이터를 다시 불러와야 함
  useEffect(() => {
    fetchData();
  }, [currentPage, tableName, activeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Count Query (필터 적용)
      let countQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (filterColumn && activeFilter) {
        countQuery = countQuery.eq(filterColumn, activeFilter);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // 2. Data Query (필터 적용)
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let dataQuery = supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filterColumn && activeFilter) {
        dataQuery = dataQuery.eq(filterColumn, activeFilter);
      }

      const { data, error } = await dataQuery;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase.from(tableName).update(data).eq('id', editingItem.id);
        if (error) throw error;
        alert('✓ 수정되었습니다!');
      } else {
        const { error } = await supabase.from(tableName).insert(data);
        if (error) throw error;
        alert('✓ 저장되었습니다!');
      }
      setIsWriting(false);
      setEditingItem(null);
      setViewingItem(null); 
      fetchData();
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      setViewingItem(null); 
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleViewClick = (item: any) => {
    setViewingItem(item);
    setIsWriting(false);
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsWriting(true);
  };

  const handleCancel = () => {
    setIsWriting(false);
    setEditingItem(null);
  };

  const handleBackToList = () => {
    setViewingItem(null);
    setIsWriting(false);
  };

  const toggleViewMode = () => {
    setIsSmallView(prev => !prev);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  if (isWriting) {
    return (
      <div style={{ padding: '10px' }}>
        {renderForm({ 
          onSave: handleSave, 
          onCancel: handleCancel, 
          initialData: editingItem 
        })}
      </div>
    );
  }

  if (viewingItem) {
    return (
      <div style={{ padding: '0px' }}>
        {renderDetail({
          item: viewingItem,
          onBack: handleBackToList,
          onEdit: handleEditClick,
          onDelete: handleDelete
        })}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
      
      {/* 1. 상단 네비게이션 바 */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '6px', 
        marginBottom: '15px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {/* [수정] 좌측 영역: 페이지네이션 + 필터 버튼을 한 그룹으로 묶음 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          
          {/* 페이지네이션 */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {pageNumbers.length > 0 ? pageNumbers.map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  minWidth: '24px',
                  height: '24px',
                  background: currentPage === num ? 'white' : '#c0c0c0',
                  border: currentPage === num ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
                  fontSize: '11px',
                  fontWeight: currentPage === num ? 'bold' : 'normal',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
              >
                {num}
              </button>
            )) : (
              <span style={{ fontSize: '11px', color: '#666', padding: '4px' }}>[1]</span>
            )}
          </div>

          {/* [New] 필터 버튼 영역 (필터 옵션이 있을 때만 표시) */}
          {filterOptions.length > 0 && filterColumn && (
            <>
              {/* 구분선 */}
              <div style={{ width: '2px', height: '16px', background: '#808080', borderRight: '1px solid white' }}></div>
              
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {/* 지구본 (All) 버튼 */}
                <button
                  onClick={() => { setActiveFilter(null); setCurrentPage(1); }}
                  title="Show All"
                  style={{
                    minWidth: '24px',
                    height: '24px',
                    background: activeFilter === null ? 'white' : '#c0c0c0',
                    border: activeFilter === null ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px'
                  }}
                >
                  <Globe size={14} color={activeFilter === null ? 'black' : '#444'} />
                </button>

                {/* 나라별 버튼 */}
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => { setActiveFilter(option); setCurrentPage(1); }}
                    style={{
                      height: '24px',
                      background: activeFilter === option ? 'white' : '#c0c0c0',
                      border: activeFilter === option ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
                      fontSize: '11px',
                      fontWeight: activeFilter === option ? 'bold' : 'normal',
                      cursor: 'pointer',
                      padding: '0 6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 우측: 뷰 모드 토글 버튼 + 글쓰기 버튼 */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {allowViewToggle && (
            <button
              onClick={toggleViewMode}
              style={{
                background: '#c0c0c0',
                border: '2px outset #dfdfdf',
                padding: '2px 4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
              onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
              title={isSmallView ? "크게 보기" : "작게 보기"}
            >
              {isSmallView ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          )}

          <button 
            onClick={() => { setEditingItem(null); setIsWriting(true); }}
            style={{ 
              background: '#c0c0c0', 
              border: '2px outset #dfdfdf', 
              padding: '2px 8px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
            onMouseDown={(e) => e.currentTarget.style.border = '2px inset #dfdfdf'}
            onMouseUp={(e) => e.currentTarget.style.border = '2px outset #dfdfdf'}
          >
            +
          </button>
        </div>
      </div>

      {/* 2. 리스트 영역 */}
      <div style={{ padding: '0px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
            No entries found.
          </div>
        ) : (
          <div className={`grid ${isSmallView ? 'grid-cols-2 gap-2' : `${gridCols} gap-4`}`}>
            {items.map((item) => (
              <div key={item.id}>
                {renderItem({ 
                  item, 
                  onView: handleViewClick, 
                  onEdit: handleEditClick, 
                  onDelete: handleDelete,
                  isSmallView 
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}