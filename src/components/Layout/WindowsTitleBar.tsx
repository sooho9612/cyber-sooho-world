export function WindowsTitleBar() {
  return (
    <div
      className="flex items-center justify-between h-7 px-1"
      style={{
        background: 'linear-gradient(to right, #000080 0%, #1084d0 100%)',
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        userSelect: 'none'
      }}
    >
      <div className="flex items-center gap-1.5 pl-0.5">
        <img
          src="https://utwyxpotbbfmxmjiklsb.supabase.co/storage/v1/object/public/Image/favicon_01.png"
          alt="Icon"
          className="w-4 h-4"
          draggable={false}
        />
        <span className="text-white text-xs font-bold leading-none">
          Cyber Sooho Homepage_1.16.1.exe
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          aria-label="Minimize"
          className="w-5 h-5 flex items-center justify-center text-black text-xs font-bold leading-none"
          style={{
            background: '#c0c0c0',
            border: '1.5px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000';
            e.currentTarget.style.boxShadow = 'inset -1px -1px 0 #dfdfdf, inset 1px 1px 0 #808080';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080';
          }}
        >
          <span style={{ paddingBottom: '6px', fontSize: '16px', fontWeight: 'bold' }}>_</span>
        </button>

        <button
          aria-label="Maximize"
          className="w-5 h-5 flex items-center justify-center text-black text-[10px] font-bold leading-none"
          style={{
            background: '#c0c0c0',
            border: '1.5px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000';
            e.currentTarget.style.boxShadow = 'inset -1px -1px 0 #dfdfdf, inset 1px 1px 0 #808080';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080';
          }}
        >
          □
        </button>

        <button
          aria-label="Close"
          className="w-5 h-5 flex items-center justify-center text-black text-xs font-bold leading-none"
          style={{
            background: '#c0c0c0',
            border: '1.5px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000';
            e.currentTarget.style.boxShadow = 'inset -1px -1px 0 #dfdfdf, inset 1px 1px 0 #808080';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1.5px solid';
            e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
