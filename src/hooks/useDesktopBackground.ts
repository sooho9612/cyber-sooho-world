import { useCallback, useEffect, useState } from 'react';
import { ASSETS } from '../config/assets';
import { supabase } from '../supabaseClient';
import type { CSSProperties } from 'react';
import type { DesktopBg } from '../types';

export const DEFAULT_DESKTOP_BG: DesktopBg = {
  mode: 'image',
  imageUrl: ASSETS.bgTeal,
  imageStyle: 'stretch',
};

function isDesktopBg(value: unknown): value is DesktopBg {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.mode === 'color' && typeof v.color === 'string') return true;
  if (
    v.mode === 'image' &&
    typeof v.imageUrl === 'string' &&
    (v.imageStyle === 'tile' || v.imageStyle === 'stretch')
  ) {
    return true;
  }
  return false;
}

/** Convert DesktopBg into CSS for the outer .desktop-bg layer */
export function desktopBgToStyle(bg: DesktopBg): CSSProperties {
  if (bg.mode === 'color') {
    return {
      backgroundImage: 'none',
      backgroundColor: bg.color,
      backgroundSize: undefined,
      backgroundRepeat: undefined,
      backgroundPosition: 'center',
    };
  }

  const stretch = bg.imageStyle === 'stretch';
  return {
    backgroundColor: '#008080',
    backgroundImage: `url(${bg.imageUrl})`,
    backgroundSize: stretch ? 'cover' : 'auto',
    backgroundRepeat: stretch ? 'no-repeat' : 'repeat',
    backgroundPosition: 'center',
  };
}

export function useDesktopBackground(nickname: string) {
  const [desktopBg, setDesktopBg] = useState<DesktopBg>(DEFAULT_DESKTOP_BG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nickname) {
      setDesktopBg(DEFAULT_DESKTOP_BG);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('desktop_bg')
          .eq('nickname', nickname)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          console.error('Failed to load desktop background:', error);
          setDesktopBg(DEFAULT_DESKTOP_BG);
          return;
        }
        if (data && isDesktopBg(data.desktop_bg)) {
          setDesktopBg(data.desktop_bg);
        } else {
          setDesktopBg(DEFAULT_DESKTOP_BG);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setDesktopBg(DEFAULT_DESKTOP_BG);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nickname]);

  const saveDesktopBg = useCallback(
    async (next: DesktopBg) => {
      if (!nickname) {
        throw new Error('닉네임이 필요합니다.');
      }

      const { error } = await supabase.from('user_settings').upsert(
        {
          nickname,
          desktop_bg: next,
          window_bg: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'nickname' }
      );

      if (error) {
        console.error('Failed to save desktop background:', error);
        throw error;
      }

      setDesktopBg(next);
    },
    [nickname]
  );

  return {
    desktopBg,
    setDesktopBg,
    saveDesktopBg,
    loading,
    desktopStyle: desktopBgToStyle(desktopBg),
  };
}
