/** Normalized stage coords (0..1), feet-anchored. */

export const PLAZA_BUBBLE_MAX = 15;
export const PLAZA_X_MIN = 0.08;
export const PLAZA_X_MAX = 0.92;
/** Walkable floor band for bar background */
export const PLAZA_Y_MIN = 0.48;
export const PLAZA_Y_MAX = 0.94;
export const PLAZA_D_MIN = 0.07;

/** Design reference width (matches PlazaTab maxWidth) */
export const PLAZA_STAGE_REF_W = 752;
export const PLAZA_AVATAR_BASE = 48;
export const PLAZA_BUBBLE_FONT_BASE = 16;

/** Viewer preference: bubble font zoom (localStorage) */
export const PLAZA_BUBBLE_FONT_ZOOM_KEY = 'cyber_sooho_plaza_bubble_font_zoom';
export const PLAZA_BUBBLE_FONT_ZOOM_DEFAULT = 1;
export const PLAZA_BUBBLE_FONT_ZOOM_MIN = 0.7;
export const PLAZA_BUBBLE_FONT_ZOOM_MAX = 1.8;
export const PLAZA_BUBBLE_FONT_ZOOM_STEP = 0.15;

export type PlazaPoint = { x: number; y: number };

export function clampPlazaPoint(p: PlazaPoint): PlazaPoint {
  return {
    x: Math.min(PLAZA_X_MAX, Math.max(PLAZA_X_MIN, p.x)),
    y: Math.min(PLAZA_Y_MAX, Math.max(PLAZA_Y_MIN, p.y)),
  };
}

/** How much the stage shrunk/grew vs desktop reference */
export function plazaStageScale(stageW: number): number {
  if (!stageW) return 1;
  return Math.max(0.35, Math.min(1.2, stageW / PLAZA_STAGE_REF_W));
}

export function clampBubbleFontZoom(value: number): number {
  const stepped = Math.round(value / PLAZA_BUBBLE_FONT_ZOOM_STEP) * PLAZA_BUBBLE_FONT_ZOOM_STEP;
  return Math.min(
    PLAZA_BUBBLE_FONT_ZOOM_MAX,
    Math.max(PLAZA_BUBBLE_FONT_ZOOM_MIN, Math.round(stepped * 100) / 100)
  );
}

export function readBubbleFontZoom(): number {
  try {
    const raw = localStorage.getItem(PLAZA_BUBBLE_FONT_ZOOM_KEY);
    if (raw == null) return PLAZA_BUBBLE_FONT_ZOOM_DEFAULT;
    const n = Number(raw);
    if (!Number.isFinite(n)) return PLAZA_BUBBLE_FONT_ZOOM_DEFAULT;
    return clampBubbleFontZoom(n);
  } catch {
    return PLAZA_BUBBLE_FONT_ZOOM_DEFAULT;
  }
}

export function writeBubbleFontZoom(value: number): number {
  const next = clampBubbleFontZoom(value);
  try {
    localStorage.setItem(PLAZA_BUBBLE_FONT_ZOOM_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

function dist(a: PlazaPoint, b: PlazaPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/** Push away from others until min distance or give up. */
export function resolvePlazaSpacing(
  desired: PlazaPoint,
  others: PlazaPoint[],
  dMin = PLAZA_D_MIN
): PlazaPoint | null {
  let p = clampPlazaPoint(desired);
  for (let iter = 0; iter < 24; iter += 1) {
    let moved = false;
    for (const o of others) {
      const d = dist(p, o);
      if (d >= dMin || d < 1e-6) continue;
      const push = (dMin - d) / d;
      p = clampPlazaPoint({
        x: p.x + (p.x - o.x) * push,
        y: p.y + (p.y - o.y) * push,
      });
      moved = true;
    }
    if (!moved) {
      const ok = others.every((o) => dist(p, o) >= dMin - 1e-4);
      return ok ? p : null;
    }
  }
  const ok = others.every((o) => dist(p, o) >= dMin - 1e-4);
  return ok ? p : null;
}

export type BubbleLayoutInput = {
  id: string;
  x: number;
  y: number;
  text: string;
};

export type BubbleTail = 'bottom' | 'left' | 'right';

export type BubbleLayout = {
  id: string;
  leftPct: number;
  topPct: number;
  z: number;
  tail: BubbleTail;
};

export type PlazaLayoutOptions = {
  /** Avatar edge length in px (already stage-scaled) */
  avatarPx: number;
  /** Bubble font size in px (stage-scaled × user zoom) */
  bubbleFontPx: number;
};

type Box = { id: string; x: number; y: number; w: number; h: number; tail: BubbleTail };
type Rect = { x: number; y: number; w: number; h: number };

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function clampBox(box: Box, stageW: number, stageH: number): Box {
  const pad = 4;
  let { x, y, w, h } = box;
  x = Math.min(stageW - w - pad, Math.max(pad, x));
  y = Math.min(stageH - h - pad, Math.max(pad, y));
  return { ...box, x, y };
}

function estimateBubbleSize(text: string, stageW: number, fontPx: number): { w: number; h: number } {
  const lines = text.split(/\n/);
  const charW = Math.max(fontPx * 0.55, Math.min(fontPx * 0.95, stageW / 48));
  const longest = Math.max(1, ...lines.map((l) => [...l].length || 1));
  const wrapCols = Math.max(6, Math.round(14 * (16 / Math.max(10, fontPx))));
  const wrappedExtra = Math.max(0, Math.ceil(longest / wrapCols) - 1);
  const lineCount = Math.max(1, lines.length + wrappedExtra);
  const padX = Math.max(8, fontPx * 0.5);
  const lineH = fontPx * 1.35;
  const w = Math.min(stageW * 0.42, Math.max(fontPx * 3.2, longest * charW + padX * 2));
  const h = Math.max(fontPx * 1.6, padX + lineCount * lineH);
  return { w, h };
}

/**
 * Place bubble near avatar without covering the sprite.
 * Corners / edges: prefer side placement so clamp cannot slide onto the avatar.
 */
export function layoutPlazaBubbles(
  items: BubbleLayoutInput[],
  stageW: number,
  stageH: number,
  options?: Partial<PlazaLayoutOptions>
): BubbleLayout[] {
  if (!stageW || !stageH) {
    return items.map((it) => ({
      id: it.id,
      leftPct: it.x * 100,
      topPct: Math.max(2, it.y * 100 - 18),
      z: Math.round(it.y * 1000),
      tail: 'bottom' as const,
    }));
  }

  const stageScale = plazaStageScale(stageW);
  const avatarH = options?.avatarPx ?? PLAZA_AVATAR_BASE * stageScale;
  const avatarW = avatarH;
  const bubbleFontPx = options?.bubbleFontPx ?? PLAZA_BUBBLE_FONT_BASE * stageScale;
  const gap = Math.max(8, 14 * stageScale);
  const avatarBoxes: Rect[] = [];

  const boxes: Box[] = items.map((it) => {
    const { w, h } = estimateBubbleSize(it.text, stageW, bubbleFontPx);
    const cx = it.x * stageW;
    const feetY = it.y * stageH;
    const headY = feetY - avatarH;
    const nickH = Math.max(16, 22 * stageScale);
    const avatarBox: Rect = {
      x: cx - avatarW / 2 - 4 * stageScale,
      y: headY - 4 * stageScale,
      w: avatarW + 8 * stageScale,
      h: avatarH + nickH,
    };
    avatarBoxes.push(avatarBox);

    const nearLeft = it.x < 0.28;
    const nearRight = it.x > 0.72;
    const nearTop = headY < h + gap * 2;
    const preferSide = nearLeft || nearRight || nearTop;

    const above = { x: cx - w / 2, y: headY - h - gap, tail: 'bottom' as BubbleTail };
    const rightOf = {
      x: cx + avatarW / 2 + gap * 0.75,
      y: headY + avatarH / 2 - h / 2,
      tail: 'left' as BubbleTail,
    };
    const leftOf = {
      x: cx - avatarW / 2 - gap * 0.75 - w,
      y: headY + avatarH / 2 - h / 2,
      tail: 'right' as BubbleTail,
    };
    const aboveFar = {
      x: cx - w / 2,
      y: Math.max(4, headY - h - gap * 2.5),
      tail: 'bottom' as BubbleTail,
    };

    let candidates: Array<{ x: number; y: number; tail: BubbleTail }>;
    if (preferSide) {
      if (nearRight) {
        candidates = [leftOf, rightOf, above, aboveFar];
      } else if (nearLeft) {
        candidates = [rightOf, leftOf, above, aboveFar];
      } else {
        candidates = cx > stageW / 2 ? [leftOf, rightOf, above, aboveFar] : [rightOf, leftOf, above, aboveFar];
      }
    } else {
      candidates = [above, rightOf, leftOf, aboveFar];
    }

    let best: Box | null = null;
    for (const c of candidates) {
      const box = clampBox({ id: it.id, x: c.x, y: c.y, w, h, tail: c.tail }, stageW, stageH);
      if (!overlaps(box, avatarBox)) {
        best = box;
        break;
      }
    }

    if (!best) {
      const preferRight = cx < stageW / 2;
      const forcedX = preferRight ? cx + avatarW / 2 + gap * 0.75 : cx - avatarW / 2 - gap * 0.75 - w;
      let forcedY = Math.min(Math.max(4, headY + 4), stageH - h - 4);
      let box = clampBox(
        {
          id: it.id,
          x: forcedX,
          y: forcedY,
          w,
          h,
          tail: preferRight ? 'left' : 'right',
        },
        stageW,
        stageH
      );
      if (overlaps(box, avatarBox)) {
        forcedY = Math.max(4, avatarBox.y - h - gap * 0.5);
        box = clampBox({ ...box, y: forcedY, tail: 'bottom' }, stageW, stageH);
      }
      if (overlaps(box, avatarBox)) {
        const altX = preferRight ? cx - avatarW / 2 - gap * 0.75 - w : cx + avatarW / 2 + gap * 0.75;
        box = clampBox(
          { ...box, x: altX, y: Math.max(4, headY), tail: preferRight ? 'right' : 'left' },
          stageW,
          stageH
        );
      }
      best = box;
    }
    return best;
  });

  const nudge = Math.max(10, 14 * stageScale);
  for (let pass = 0; pass < 12; pass += 1) {
    let moved = false;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (!overlaps(boxes[i], boxes[j])) continue;
        boxes[j].y -= nudge;
        if (boxes[j].y < 4) {
          boxes[j].y = 4;
          boxes[j].x += boxes[j].x < stageW / 2 ? nudge : -nudge;
        }
        boxes[j] = clampBox(boxes[j], stageW, stageH);
        moved = true;
      }
      for (const ab of avatarBoxes) {
        if (!overlaps(boxes[i], ab)) continue;
        const preferRight = boxes[i].x + boxes[i].w / 2 < ab.x + ab.w / 2;
        boxes[i] = clampBox(
          {
            ...boxes[i],
            x: preferRight ? ab.x - boxes[i].w - gap * 0.6 : ab.x + ab.w + gap * 0.6,
            y: Math.max(4, ab.y),
            tail: preferRight ? 'right' : 'left',
          },
          stageW,
          stageH
        );
        moved = true;
      }
    }
    if (!moved) break;
  }

  return boxes.map((b, idx) => {
    const src = items[idx];
    return {
      id: b.id,
      leftPct: ((b.x + b.w / 2) / stageW) * 100,
      topPct: (b.y / stageH) * 100,
      z: 2000 + Math.round(src.y * 1000),
      tail: b.tail,
    };
  });
}
