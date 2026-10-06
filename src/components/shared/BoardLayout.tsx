import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { LayoutGrid, List, Globe } from 'lucide-react';
import {
  getBoardCache,
  invalidateBoardTable,
  isBoardCacheFresh,
  makeBoardCacheKey,
  setBoardCache,
} from '../../lib/boardQueryCache';
import { SECTION_CONTENT_MIN_HEIGHT } from './KeepAlivePanels';

type BoardItem = { id: string | number };

interface BoardLayoutProps<T extends BoardItem = BoardItem> {
  tableName: string;
  itemsPerPage?: number;
  /**
   * List query projection (PostgREST select). Use a slim column list when rows
   * contain heavy JSON/base64 (e.g. galleries). Detail/edit always fetch `*`.
   */
  listSelect?: string;
  /** Columns that must be present for detail/edit; if missing, refetch full row */
  detailRequiredColumns?: string[];
  renderDetail: (props: {
    item: T;
    onBack: () => void;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
  }) => React.ReactNode;
  renderForm: (props: {
    onSave: (data: any) => Promise<void> | void;
    onCancel: () => void;
    initialData?: T | null;
  }) => React.ReactNode;
  renderItem: (props: {
    item: T;
    onView: (item: T) => void;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    isSmallView?: boolean;
  }) => React.ReactNode;
  gridCols?: string;
  allowViewToggle?: boolean;
  filterOptions?: string[];
  filterColumn?: string;
  /** e.g. revisit-only toggle for food */
  booleanToggleFilter?: { column: string; label: string };
  sortOptions?: Array<{
    id: string;
    label: string;
    column: string;
    ascending: boolean;
  }>;
  defaultSortId?: string;
}

export function BoardLayout<T extends BoardItem = BoardItem>({
  tableName,
  itemsPerPage = 6,
  listSelect = '*',
  detailRequiredColumns = [],
  renderDetail,
  renderForm,
  renderItem,
  gridCols = "grid-cols-1",
  allowViewToggle = false,
  filterOptions = [],
  filterColumn,
  booleanToggleFilter,
  sortOptions = [],
  defaultSortId,
}: BoardLayoutProps<T>) {
  const initialSortId = defaultSortId || sortOptions[0]?.id || 'latest';
  const initialCacheKey = makeBoardCacheKey({
    tableName,
    page: 1,
    itemsPerPage,
    activeFilter: null,
    booleanFilterOn: false,
    sortId: initialSortId,
    listSelect,
  });
  const initialCached = getBoardCache<T>(initialCacheKey);

  const [items, setItems] = useState<T[]>(() => initialCached?.items ?? []);
  const [totalCount, setTotalCount] = useState(() => initialCached?.totalCount ?? 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(() => !initialCached);
  const [isHydratingItem, setIsHydratingItem] = useState(false);

  const [isWriting, setIsWriting] = useState(false);
  const [viewingItem, setViewingItem] = useState<T | null>(null);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  // [New] 현재 활성화된 필터 (null이면 All)
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [booleanFilterOn, setBooleanFilterOn] = useState(false);
  const [sortId, setSortId] = useState(() => initialSortId);

  // Default: large grid (가로 3열 등). Small/compact is opt-in via toggle.
  const [isSmallView, setIsSmallView] = useState(() => {
    if (!allowViewToggle) return false;
    const savedMode = localStorage.getItem(`viewMode_v2_${tableName}`);
    return savedMode !== null ? JSON.parse(savedMode) : false;
  });

  const fetchGen = useRef(0);

  useEffect(() => {
    if (allowViewToggle) {
      localStorage.setItem(`viewMode_v2_${tableName}`, JSON.stringify(isSmallView));
    }
  }, [isSmallView, allowViewToggle, tableName]);

  const activeSort =
    sortOptions.find((s) => s.id === sortId) ||
    sortOptions[0] || {
      id: 'latest',
      label: '최신순',
      column: 'created_at',
      ascending: false,
    };

  // [수정] 필터·정렬이 변경되어도 데이터를 다시 불러와야 함
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional query key deps
  }, [currentPage, tableName, activeFilter, booleanFilterOn, sortId, itemsPerPage]);

  const needsFullRow = (item: T) => {
    if (listSelect === '*') return false;
    if (detailRequiredColumns.length === 0) return true;
    return detailRequiredColumns.some((col) => (item as any)[col] === undefined);
  };

  const fetchFullItem = async (item: T): Promise<T | null> => {
    if (!needsFullRow(item)) return item;
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', item.id)
      .single();
    if (error) {
      console.error(`Error fetching ${tableName} detail:`, error);
      return null;
    }
    return data as T;
  };

  const fetchData = async (opts?: { force?: boolean }) => {
    const force = opts?.force === true;
    const key = makeBoardCacheKey({
      tableName,
      page: currentPage,
      itemsPerPage,
      activeFilter,
      booleanFilterOn,
      sortId,
      listSelect,
    });
    const cached = getBoardCache<T>(key);

    // SWR: paint cache immediately — no skeleton flash on tab return
    if (cached && !force) {
      setItems(cached.items);
      setTotalCount(cached.totalCount);
      setIsLoading(false);
      if (isBoardCacheFresh(cached)) {
        // Fresh enough: still revalidate quietly below
      }
    } else if (!cached) {
      setIsLoading(true);
    }

    const gen = ++fetchGen.current;

    try {
      let countQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (filterColumn && activeFilter) {
        countQuery = countQuery.eq(filterColumn, activeFilter);
      }
      if (booleanToggleFilter && booleanFilterOn) {
        countQuery = countQuery.eq(booleanToggleFilter.column, true);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let dataQuery = supabase
        .from(tableName)
        .select(listSelect)
        .order(activeSort.column, { ascending: activeSort.ascending })
        .range(from, to);

      if (activeSort.column !== 'created_at') {
        dataQuery = dataQuery.order('created_at', { ascending: false });
      }

      if (filterColumn && activeFilter) {
        dataQuery = dataQuery.eq(filterColumn, activeFilter);
      }
      if (booleanToggleFilter && booleanFilterOn) {
        dataQuery = dataQuery.eq(booleanToggleFilter.column, true);
      }

      const { data, error } = await dataQuery;
      if (error) throw error;

      if (gen !== fetchGen.current) return;

      const nextItems = (data || []) as T[];
      const nextCount = count || 0;
      setItems(nextItems);
      setTotalCount(nextCount);
      setBoardCache(key, {
        items: nextItems,
        totalCount: nextCount,
        fetchedAt: Date.now(),
      });
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      if (gen === fetchGen.current) {
        setIsLoading(false);
      }
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
      invalidateBoardTable(tableName);
      fetchData({ force: true });
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
      invalidateBoardTable(tableName);
      fetchData({ force: true });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleViewClick = async (item: any) => {
    setIsWriting(false);
    if (!needsFullRow(item)) {
      setViewingItem(item);
      return;
    }
    setIsHydratingItem(true);
    const full = await fetchFullItem(item);
    setIsHydratingItem(false);
    if (full) setViewingItem(full);
  };

  const handleEditClick = async (item: any) => {
    if (!needsFullRow(item)) {
      setEditingItem(item);
      setIsWriting(true);
      return;
    }
    setIsHydratingItem(true);
    const full = await fetchFullItem(item);
    setIsHydratingItem(false);
    if (full) {
      setEditingItem(full);
      setIsWriting(true);
    }
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
    setIsSmallView((prev: boolean) => !prev);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  if (isHydratingItem) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Tahoma, sans-serif', fontSize: '12px', color: '#000080' }}>
        Loading...
      </div>
    );
  }

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

        {/* 중앙: 재방문 토글 / 정렬 (맛집 등) */}
        {(booleanToggleFilter || sortOptions.length > 0) && (
          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              flexWrap: 'wrap',
              margin: '0 8px',
            }}
          >
            {booleanToggleFilter && (
              <button
                type="button"
                title={booleanToggleFilter.label}
                onClick={() => {
                  setBooleanFilterOn((v) => !v);
                  setCurrentPage(1);
                }}
                style={{
                  height: '24px',
                  background: booleanFilterOn ? 'white' : '#c0c0c0',
                  border: booleanFilterOn ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
                  fontSize: '11px',
                  fontWeight: booleanFilterOn ? 'bold' : 'normal',
                  cursor: 'pointer',
                  padding: '0 8px',
                  whiteSpace: 'nowrap',
                  color: booleanFilterOn ? '#0000cc' : '#000',
                }}
              >
                {booleanToggleFilter.label}
              </button>
            )}
            {sortOptions.length > 0 && (
              <select
                value={sortId}
                onChange={(e) => {
                  setSortId(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: '24px',
                  background: '#fff',
                  border: '2px inset #dfdfdf',
                  fontSize: '11px',
                  fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
                  padding: '0 4px',
                  cursor: 'pointer',
                }}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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

      {/* 2. 리스트 영역 — min-height로 탭 전환 시 높이 점프 완화 */}
      <div style={{ padding: '0px', minHeight: SECTION_CONTENT_MIN_HEIGHT }}>
        {isLoading ? (
          <div style={{ position: 'relative' }}>
            <div className={`grid ${isSmallView ? 'grid-cols-2 gap-2' : `${gridCols} gap-4`}`}>
              {Array.from({ length: itemsPerPage }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  style={{
                    minHeight: isSmallView ? '120px' : '200px',
                    background: '#c0c0c0',
                    border: '2px inset #808080',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            >
              Loading...
            </div>
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              minHeight: SECTION_CONTENT_MIN_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontStyle: 'italic',
              color: '#666',
            }}
          >
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