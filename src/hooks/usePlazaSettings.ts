import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PLAZA_BG_ID,
  isPlazaBgId,
  resolvePlazaBgUrl,
  type PlazaBgId,
} from '../config/assets';
import { supabase } from '../supabaseClient';
import type { PlazaSettings } from '../types';

export const DEFAULT_PLAZA_SETTINGS: PlazaSettings = {
  bgId: DEFAULT_PLAZA_BG_ID,
};

function normalize(settings: PlazaSettings): PlazaSettings {
  const bgId = isPlazaBgId(settings.bgId) ? settings.bgId : DEFAULT_PLAZA_BG_ID;
  return { bgId };
}

function isPlazaSettings(value: unknown): value is PlazaSettings {
  if (!value || typeof value !== 'object') return false;
  return typeof (value as Record<string, unknown>).bgId === 'string';
}

export function usePlazaSettings() {
  const [settings, setSettings] = useState<PlazaSettings>(DEFAULT_PLAZA_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('plaza')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Failed to load plaza settings:', error);
        setSettings(DEFAULT_PLAZA_SETTINGS);
        return;
      }

      if (data && isPlazaSettings(data.plaza)) {
        setSettings(normalize(data.plaza));
      } else {
        setSettings(DEFAULT_PLAZA_SETTINGS);
      }
    } catch (err) {
      console.error(err);
      setSettings(DEFAULT_PLAZA_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(async (next: PlazaSettings) => {
    const normalized = normalize(next);

    const { data: existing } = await supabase
      .from('homepage_settings')
      .select('compressor, marquee')
      .eq('id', 1)
      .maybeSingle();

    const { error } = await supabase.from('homepage_settings').upsert(
      {
        id: 1,
        compressor: existing?.compressor ?? {
          enabled: true,
          maxEdge: 300,
          quality: 0.7,
        },
        marquee: existing?.marquee ?? {
          text: '가을을 만끽해요~~',
          speed: 5,
          backgroundColor: '#000080',
          textColor: '#ffff00',
          rainbow: false,
          bold: true,
          underline: false,
          italic: false,
          fontSize: 14,
        },
        plaza: normalized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Failed to save plaza settings:', error);
      throw error;
    }

    setSettings(normalized);
  }, []);

  const bgId = settings.bgId as PlazaBgId;
  const bgUrl = resolvePlazaBgUrl(bgId);

  return { settings, bgId, bgUrl, loading, save, reload };
}
