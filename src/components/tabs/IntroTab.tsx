import { useState, useEffect, useRef } from 'react';
import { Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export function IntroTab() {
  const [content, setContent] = useState<string>(''); // 에디터 내부 컨텐츠 (텍스트 등)
  const [bgUrl, setBgUrl] = useState<string>('');     // 배경 이미지 URL
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  // 1. 윈도우 2000 핵심 컬러 6종
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Navy', value: '#000080' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#008000' },
    { name: 'Teal', value: '#008080' },
    { name: 'Purple', value: '#800080' },
  ];

  // 2. 글자 크기 3단계
  const sizes = [
    { label: '소', value: '2' },
    { label: '중', value: '3' },
    { label: '대', value: '5' },
  ];

  useEffect(() => {
    fetchIntro();
  }, []);

  // --- Supabase Logic ---
  const fetchIntro = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('intro_content')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching intro:', error);
      }

      if (data && data.content) {
        // 저장된 HTML을 파싱하여 배경이미지와 내부 컨텐츠를 분리
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.content;
        
        // 만약 최상위 요소가 배경 스타일을 가진 div라면 분리
        const firstChild = tempDiv.firstElementChild as HTMLElement;
        if (firstChild && firstChild.tagName === 'DIV' && firstChild.style.backgroundImage) {
            // 배경 이미지 URL 추출 (url("...") 형태에서 따옴표와 url() 제거)
            const bgMatch = firstChild.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (bgMatch && bgMatch[1]) {
                setBgUrl(bgMatch[1]);
            }
            // 래퍼 div를 제외한 내부 컨텐츠만 에디터에 설정
            setContent(firstChild.innerHTML);
        } else {
            // 배경이 없는 구버전 데이터거나 일반 텍스트인 경우
            setContent(data.content);
            setBgUrl('');
        }
      } else {
        // 기본값
        setContent(`
          <div style="text-align: center;">
            <font size="5"><b>Coming Soon...</b></font><br><br>
            <font size="3" color="#666666">(Self Introduction)</font>
          </div>
        `);
        setBgUrl('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    // 에디터의 현재 HTML 내용
    const innerContent = editorRef.current.innerHTML;
    
    // 배경 이미지가 있다면 래퍼 div로 감싸서 저장 (비율 무시 꽉 차게 설정)
    // min-height: 100%를 주어 내용이 적어도 배경이 꽉 차도록 함
    let finalContent = innerContent;
    if (bgUrl) {
        finalContent = `<div style="
            width: 100%; 
            min-height: 100%; 
            background-image: url('${bgUrl}'); 
            background-size: 100% 100%; 
            background-repeat: no-repeat;
            padding: 10px; 
            box-sizing: border-box;
        ">${innerContent}</div>`;
    }

    try {
      const { error } = await supabase.from('intro_content').insert({
        content: finalContent
      });

      if (error) throw error;
      
      setIsEditing(false);
      alert('✓ 자기소개가 저장되었습니다!');
    } catch (error) {
      console.error('Error saving intro:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // --- Editor Logic ---
  const handleEditClick = () => {
    const password = prompt('관리자 비밀번호를 입력하세요:');
    if (password === '1223') {
      setIsEditing(true);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          editorRef.current.focus();
        }
      }, 0);
    } else if (password !== null) {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value ?? undefined);
    if (editorRef.current) editorRef.current.focus();
  };

  // 배경 이미지 넣기
  const handleAddBackground = () => {
    const url = prompt('배경으로 사용할 이미지 주소(URL)를 입력하세요:', 'https://');
    if (url) {
        setBgUrl(url);
    } else if (url === '') {
        // 빈 값을 입력하면 배경 삭제
        setBgUrl('');
    }
  };

  return (
    <div
      style={{
        background: 'white',
        border: '2px solid #808080',
        padding: '0', // [수정] 외부 여백 제거 (20px -> 0)
        minHeight: '400px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. 에디터 툴바 (수정 모드일 때만 표시) */}
      {isEditing && (
        <div style={{ 
          margin: '10px', // [수정] 툴바에만 여백 추가 (테두리에 붙지 않게)
          background: '#c0c0c0', 
          border: '2px outset #dfdfdf', 
          padding: '8px', 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* 스타일 (B, I) */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <button onClick={() => execCmd('bold')} title="Bold" style={{ width: '24px', height: '24px', fontWeight: 'bold', cursor: 'pointer' }}>B</button>
            <button onClick={() => execCmd('italic')} title="Italic" style={{ width: '24px', height: '24px', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
          </div>
          
          <div style={{ width: '1px', height: '20px', background: '#808080' }}></div>

          {/* 크기 (소/중/대) */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {sizes.map((size) => (
              <button 
                key={size.label} 
                onClick={() => execCmd('fontSize', size.value)}
                style={{ padding: '0 6px', height: '24px', fontSize: '12px', cursor: 'pointer' }}
              >
                {size.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: '#808080' }}></div>

          {/* 색상 (6종) */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => execCmd('foreColor', color.value)}
                title={color.name}
                style={{
                  width: '20px',
                  height: '20px',
                  background: color.value,
                  border: '1px solid #808080',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: '#808080' }}></div>

          {/* 배경 이미지 버튼 */}
          <button 
            onClick={handleAddBackground} 
            title="배경 이미지 설정"
            style={{ 
                background: '#c0c0c0', 
                border: '1px outset #fff', 
                cursor: 'pointer', 
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
            }}
          >
            <ImageIcon size={16} style={{ marginRight: '4px' }} /> 배경
          </button>

          {/* 저장/취소 버튼 (우측 정렬) */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
            <button onClick={handleSave} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '2px 8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Save size={14} /> 저장
            </button>
            <button onClick={() => { setIsEditing(false); fetchIntro(); }} style={{ background: '#c0c0c0', border: '2px outset #dfdfdf', padding: '2px 8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      {/* 2. 컨텐츠 영역 (뷰어 / 에디터 공용) */}
      <div
        ref={editorRef}
        contentEditable={isEditing}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          flex: 1,
          outline: 'none',
          padding: '10px',
          border: isEditing ? '2px inset #dfdfdf' : 'none',
          // 배경 이미지가 있으면 적용, 없으면 흰색
          background: bgUrl ? `url('${bgUrl}')` : 'white',
          // 비율 무시하고 꽉 차게 설정
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          fontFamily: 'inherit',
          minHeight: '300px',
          cursor: isEditing ? 'text' : 'default',
          overflowY: 'auto'
        }}
        suppressContentEditableWarning={true}
      />

      {/* 3. 수정 버튼 (보기 모드일 때만 우측 상단에 표시) */}
      {!isEditing && (
        <button
          onClick={handleEditClick}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.5,
            transition: 'opacity 0.2s',
            zIndex: 10 // 배경 위에 오도록
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
          title="페이지 수정 (관리자)"
        >
          <Edit2 size={16} color="#000080" />
        </button>
      )}

      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#999' }}>
          Loading...
        </div>
      )}
    </div>
  );
}