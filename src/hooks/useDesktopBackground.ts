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

export function useDesktopBackground(userId: string | null | undefined, nicknameHint?: string) {
  const [desktopBg, setDesktopBg] = useState<DesktopBg>(DEFAULT_DESKTOP_BG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDesktopBg(DEFAULT_DESKTOP_BG);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        let { data, error } = await supabase
          .from('user_settings')
          .select('desktop_bg')
          .eq('user_id', userId)
          .maybeSingle();

        // Legacy fallback: nickname-linked row (read once if user_id miss)
        if (!data && nicknameHint) {
          const legacy = await supabase
            .from('user_settings')
            .select('desktop_bg, user_id')
            .ilike('nickname', nicknameHint)
            .maybeSingle();
          if (!legacy.error && legacy.data) {
            data = legacy.data;
            if (!legacy.data.user_id) {
              await supabase
                .from('user_settings')
                .update({ user_id: userId })
                .ilike('nickname', nicknameHint)
                .is('user_id', null);
            }
          }
        }

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
  }, [userId, nicknameHint]);

  const saveDesktopBg = useCallback(
    async (next: DesktopBg) => {
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: existing } = await supabase
        .from('user_settings')
        .select('nickname')
        .eq('user_id', userId)
        .maybeSingle();

      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: userId,
          nickname: existing?.nickname || nicknameHint || userId.slice(0, 8),
          desktop_bg: next,
          window_bg: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        // Fallback if unique on nickname still required without user_id conflict target
        const retry = await supabase.from('user_settings').upsert(
          {
            nickname: nicknameHint || userId.slice(0, 8),
            user_id: userId,
            desktop_bg: next,
            window_bg: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'nickname' }
        );
        if (retry.error) {
          console.error('Failed to save desktop background:', retry.error);
          throw retry.error;
        }
      }

      setDesktopBg(next);
    },
    [userId, nicknameHint]
  );

  return {
    desktopBg,
    setDesktopBg,
    saveDesktopBg,
    loading,
    desktopStyle: desktopBgToStyle(desktopBg),
  };
}
