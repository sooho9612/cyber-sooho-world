const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://utwyxpotbbfmxmjiklsb.supabase.co';

/** Public Storage object URL helper */
export function storageUrl(path: string): string {
  const cleaned = path.replace(/^\/+/, '');
  return `${SUPABASE_URL}/storage/v1/object/public/${cleaned}`;
}

export const ASSETS = {
  favicon: storageUrl('Image/favicon_01.png'),
  banner: storageUrl('Image/banner_03.jpg'),
  bgTeal: storageUrl('Image/bg_008080.jpg'),
  cursorNormal: storageUrl('Image/cursor_sc_nomal.png'),
  cursorSelect: storageUrl('Image/cursor_sc_select.png'),
  internetGif: storageUrl('Image/internet01.gif'),
  bootScreen: storageUrl('Image/bootscreen.jpg'),
  star: storageUrl('Image/tap/star.png'),
  smile: storageUrl('Image/tap/smile.png'),
  tabNotice: storageUrl('Image/tap/notice.png'),
  tabMusic: storageUrl('Image/tap/music.png'),
  tabGuestbook: storageUrl('Image/tap/guestbook.png'),
  tabEntries: storageUrl('Image/tap/entries.png'),
  tabToybox: storageUrl('Image/toybox/toybox.png'),
  folderIcon: storageUrl('Image/icon/folder.png'),
  musicVisual: storageUrl('Image/music/WMP_visual.mp4'),
  mediaPlayerIcon: storageUrl('Image/music/mediaplayer_icon.jpg'),
  volumeIcon: storageUrl('Image/music/volume.png'),
  clickSound: storageUrl('SoundEffect/click.mp3'),
  fontDotMatrix: storageUrl('ETC/DOTMATRI.TTF'),
  toyMyComputer: storageUrl('Image/toybox/mycomputer.png'),
  toyInternet: storageUrl('Image/toybox/internet.png'),
  toyStarcraft: storageUrl('Image/toybox/starcraft.png'),
  toyPinball: storageUrl('Image/toybox/pinball.png'),
  toyRecycle: storageUrl('Image/toybox/recyclebin.png'),
} as const;
