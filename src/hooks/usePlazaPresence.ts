import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { clampPlazaPoint, resolvePlazaSpacing, type PlazaPoint } from '../lib/plazaGeometry';
import { PLAZA_BUBBLE_MAX } from '../lib/plazaGeometry';

export type PlazaPresence = {
  user_id: string;
  nickname: string;
  x: number;
  y: number;
  bubble_text: string | null;
  updated_at: string;
};

export function usePlazaPresence(opts: {
  userId: string | undefined;
  nickname: string | undefined;
  enabled?: boolean;
}) {
  const { userId, nickname, enabled = true } = opts;
  const [list, setList] = useState<PlazaPresence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    const { data, error } = await supabase
      .from('plaza_presence')
      .select('user_id, nickname, x, y, bubble_text, updated_at')
      .order('y', { ascending: true });
    if (error) {
      console.error('plaza fetch', error);
      return;
    }
    setList((data as PlazaPresence[]) ?? []);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await fetchList();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchList]);

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel('plaza_presence_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plaza_presence' },
        () => {
          void fetchList();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, fetchList]);

  const mine = userId ? list.find((p) => p.user_id === userId) : undefined;

  const upsertPosition = useCallback(
    async (desired: PlazaPoint): Promise<'ok' | 'crowded' | 'auth' | 'error'> => {
      if (!userId || !nickname) return 'auth';
      const others = list
        .filter((p) => p.user_id !== userId)
        .map((p) => ({ x: p.x, y: p.y }));
      const resolved = resolvePlazaSpacing(clampPlazaPoint(desired), others);
      if (!resolved) return 'crowded';

      const existing = list.find((p) => p.user_id === userId);
      const row = {
        user_id: userId,
        nickname,
        x: resolved.x,
        y: resolved.y,
        bubble_text: existing?.bubble_text ?? null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('plaza_presence').upsert(row, { onConflict: 'user_id' });
      if (error) {
        console.error('plaza upsert pos', error);
        return 'error';
      }
      await fetchList();
      return 'ok';
    },
    [fetchList, list, nickname, userId]
  );

  const upsertBubble = useCallback(
    async (text: string): Promise<'ok' | 'auth' | 'needPlace' | 'error'> => {
      if (!userId || !nickname) return 'auth';
      if (!mine) return 'needPlace';
      const trimmed = text.trim().slice(0, PLAZA_BUBBLE_MAX);
      const { error } = await supabase
        .from('plaza_presence')
        .update({
          bubble_text: trimmed.length ? trimmed : null,
          nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      if (error) {
        console.error('plaza upsert bubble', error);
        return 'error';
      }
      await fetchList();
      return 'ok';
    },
    [fetchList, mine, nickname, userId]
  );

  const clearBubble = useCallback(async (): Promise<'ok' | 'auth' | 'error'> => {
    if (!userId) return 'auth';
    const { error } = await supabase
      .from('plaza_presence')
      .update({ bubble_text: null, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) {
      console.error('plaza clear bubble', error);
      return 'error';
    }
    await fetchList();
    return 'ok';
  }, [fetchList, userId]);

  const removePresence = useCallback(
    async (targetUserId: string): Promise<'ok' | 'error'> => {
      const { error } = await supabase.from('plaza_presence').delete().eq('user_id', targetUserId);
      if (error) {
        console.error('plaza delete', error);
        return 'error';
      }
      await fetchList();
      return 'ok';
    },
    [fetchList]
  );

  return {
    list,
    mine,
    loading,
    fetchList,
    upsertPosition,
    upsertBubble,
    clearBubble,
    removePresence,
  };
}
