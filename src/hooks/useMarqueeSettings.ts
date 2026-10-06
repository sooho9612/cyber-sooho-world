import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { MarqueeSettings } from '../types';

export const DEFAULT_MARQUEE: MarqueeSettings = {
  text: '가을을 만끽해요~~',
  speed: 5,
  backgroundColor: '#000080',
  textColor: '#ffff00',
  rainbow: false,
  bold: true,
  underline: false,
  italic: false,
  fontSize: 14,
};

function isMarqueeSettings(value: unknown): value is MarqueeSettings {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.text === 'string' &&
    typeof v.speed === 'number' &&
    typeof v.backgroundColor === 'string' &&
    typeof v.textColor === 'string'
  );
}

function normalize(settings: MarqueeSettings): MarqueeSettings {
  return {
    text: settings.text.trim() || DEFAULT_MARQUEE.text,
    speed: Math.max(1, Math.min(10, Math.round(settings.speed))),
    backgroundColor: settings.backgroundColor || DEFAULT_MARQUEE.backgroundColor,
    textColor: settings.textColor || DEFAULT_MARQUEE.textColor,
    rainbow: Boolean(settings.rainbow),
    bold: settings.bold !== false,
    underline: Boolean(settings.underline),
    italic: Boolean(settings.italic),
    fontSize: Math.max(
      10,
      Math.min(32, Math.round(typeof settings.fontSize === 'number' ? settings.fontSize : 14))
    ),
  };
}

export function useMarqueeSettings() {
  const [settings, setSettings] = useState<MarqueeSettings>(DEFAULT_MARQUEE);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('marquee')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Failed to load marquee settings:', error);
        setSettings(DEFAULT_MARQUEE);
        return;
      }

      if (data && isMarqueeSettings(data.marquee)) {
        setSettings(normalize(data.marquee));
      } else {
        setSettings(DEFAULT_MARQUEE);
      }
    } catch (err) {
      console.error(err);
      setSettings(DEFAULT_MARQUEE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(async (next: MarqueeSettings) => {
    const normalized = normalize(next);

    const { data: existing } = await supabase
      .from('homepage_settings')
      .select('compressor')
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
        marquee: normalized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Failed to save marquee settings:', error);
      throw error;
    }

    setSettings(normalized);
  }, []);

  return { settings, loading, save, reload };
}
