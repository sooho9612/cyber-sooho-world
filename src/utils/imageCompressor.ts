import { supabase } from '../supabaseClient';
import type { CompressorSettings } from '../types';

export const DEFAULT_COMPRESSOR: CompressorSettings = {
  enabled: true,
  maxEdge: 300,
  quality: 0.7,
};

let cached: CompressorSettings | null = null;
let loadPromise: Promise<CompressorSettings> | null = null;

function isCompressorSettings(value: unknown): value is CompressorSettings {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.enabled === 'boolean' &&
    typeof v.maxEdge === 'number' &&
    typeof v.quality === 'number'
  );
}

export function getCachedCompressorSettings(): CompressorSettings {
  return cached ?? DEFAULT_COMPRESSOR;
}

export function setCachedCompressorSettings(next: CompressorSettings) {
  cached = next;
}

export async function loadCompressorSettings(force = false): Promise<CompressorSettings> {
  if (!force && cached) return cached;
  if (!force && loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('compressor')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Failed to load compressor settings:', error);
        cached = DEFAULT_COMPRESSOR;
        return cached;
      }

      if (data && isCompressorSettings(data.compressor)) {
        cached = {
          enabled: data.compressor.enabled,
          maxEdge: Math.max(32, Math.min(4096, Math.round(data.compressor.maxEdge))),
          quality: Math.max(0.1, Math.min(1, data.compressor.quality)),
        };
      } else {
        cached = DEFAULT_COMPRESSOR;
      }
      return cached;
    } catch (err) {
      console.error(err);
      cached = DEFAULT_COMPRESSOR;
      return cached;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export async function saveCompressorSettings(next: CompressorSettings): Promise<void> {
  const normalized: CompressorSettings = {
    enabled: next.enabled,
    maxEdge: Math.max(32, Math.min(4096, Math.round(next.maxEdge))),
    quality: Math.max(0.1, Math.min(1, next.quality)),
  };

  const { error } = await supabase.from('homepage_settings').upsert(
    {
      id: 1,
      compressor: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Failed to save compressor settings:', error);
    throw error;
  }

  cached = normalized;
}

/** Compress a single image using site-wide Control Panel settings */
export async function compressImage(file: File): Promise<File> {
  const settings = await loadCompressorSettings();

  if (!settings.enabled) {
    return file;
  }

  const MAX_EDGE = settings.maxEdge;
  const COMPRESSION_QUALITY = settings.quality;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_EDGE) {
            height *= MAX_EDGE / width;
            width = MAX_EDGE;
          }
        } else if (height > MAX_EDGE) {
          width *= MAX_EDGE / height;
          height = MAX_EDGE;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const outType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name, {
                  type: outType,
                  lastModified: Date.now(),
                })
              );
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          outType,
          COMPRESSION_QUALITY
        );
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}

export async function compressImages(input: File | File[]): Promise<File | File[]> {
  if (Array.isArray(input)) {
    return Promise.all(input.map((file) => compressImage(file)));
  }
  return compressImage(input);
}
