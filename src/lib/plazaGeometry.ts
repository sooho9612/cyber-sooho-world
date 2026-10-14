/** Normalized stage coords (0..1), feet-anchored. */

export const PLAZA_BUBBLE_MAX = 15;
export const PLAZA_X_MIN = 0.08;
export const PLAZA_X_MAX = 0.92;
/** Walkable floor band for bar background */
export const PLAZA_Y_MIN = 0.48;
export const PLAZA_Y_MAX = 0.94;
export const PLAZA_D_MIN = 0.07;

export type PlazaPoint = { x: number; y: number };

export function clampPlazaPoint(p: PlazaPoint): PlazaPoint {
  return {
    x: Math.min(PLAZA_X_MAX, Math.max(PLAZA_X_MIN, p.x)),
    y: Math.min(PLAZA_Y_MAX, Math.max(PLAZA_Y_MIN, p.y)),
  };
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

function estimateBubbleSize(text: string, stageW: number): { w: number; h: number } {
  const lines = text.split(/\n/);
  const charW = Math.min(16, Math.max(9, stageW / 48));
  const longest = Math.max(1, ...lines.map((l) => [...l].length || 1));
  const wrappedExtra = Math.max(0, Math.ceil(longest / 14) - 1);
  const lineCount = Math.max(1, lines.length + wrappedExtra);
  const w = Math.min(stageW * 0.36, Math.max(56, longest * charW + 20));
  const h = Math.max(28, 8 + lineCount * 22);
  return { w, h };
}

/**
 * Place bubble near avatar without covering the sprite.
 * Corners / edges: prefer side placement so clamp cannot slide onto the avatar.
 */
export function layoutPlazaBubbles(
  items: BubbleLayoutInput[],
  stageW: number,
  stageH: number
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

  const avatarH = 48;
  const avatarW = 48;
  const avatarBoxes: Rect[] = [];

  const boxes: Box[] = items.map((it) => {
    const { w, h } = estimateBubbleSize(it.text, stageW);
    const cx = it.x * stageW;
    const feetY = it.y * stageH;
    const headY = feetY - avatarH;
    const avatarBox: Rect = {
      x: cx - avatarW / 2 - 6,
      y: headY - 6,
      w: avatarW + 12,
      h: avatarH + 24, // include nickname plate
    };
    avatarBoxes.push(avatarBox);

    const nearLeft = it.x < 0.28;
    const nearRight = it.x > 0.72;
    const nearTop = headY < h + 36;
    const preferSide = nearLeft || nearRight || nearTop;

    const above = { x: cx - w / 2, y: headY - h - 16, tail: 'bottom' as BubbleTail };
    const rightOf = { x: cx + avatarW / 2 + 12, y: headY + avatarH / 2 - h / 2, tail: 'left' as BubbleTail };
    const leftOf = { x: cx - avatarW / 2 - 12 - w, y: headY + avatarH / 2 - h / 2, tail: 'right' as BubbleTail };
    const aboveFar = { x: cx - w / 2, y: Math.max(4, headY - h - 40), tail: 'bottom' as BubbleTail };

    let candidates: Array<{ x: number; y: number; tail: BubbleTail }>;
    if (preferSide) {
      if (nearRight) {
        candidates = [leftOf, rightOf, above, aboveFar];
      } else if (nearLeft) {
        candidates = [rightOf, leftOf, above, aboveFar];
      } else {
        // near top: pick side toward center
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
      // Force horizontal offset away from nearest vertical edge; keep clear of avatar
      const preferRight = cx < stageW / 2;
      const forcedX = preferRight ? cx + avatarW / 2 + 12 : cx - avatarW / 2 - 12 - w;
      let forcedY = Math.min(Math.max(4, headY + 4), stageH - h - 4);
      // If still overlapping after clamp, nudge vertically off the sprite
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
        forcedY = Math.max(4, avatarBox.y - h - 8);
        box = clampBox({ ...box, y: forcedY, tail: 'bottom' }, stageW, stageH);
      }
      if (overlaps(box, avatarBox)) {
        // last resort: opposite side of avatar, even if near edge
        const altX = preferRight ? cx - avatarW / 2 - 12 - w : cx + avatarW / 2 + 12;
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

  // Separate overlapping bubbles without sliding onto avatars
  for (let pass = 0; pass < 12; pass += 1) {
    let moved = false;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (!overlaps(boxes[i], boxes[j])) continue;
        boxes[j].y -= 14;
        if (boxes[j].y < 4) {
          boxes[j].y = 4;
          boxes[j].x += (boxes[j].x < stageW / 2 ? 16 : -16);
        }
        boxes[j] = clampBox(boxes[j], stageW, stageH);
        moved = true;
      }
      // Keep clear of every avatar (own + others)
      for (const ab of avatarBoxes) {
        if (!overlaps(boxes[i], ab)) continue;
        const preferRight = boxes[i].x + boxes[i].w / 2 < ab.x + ab.w / 2;
        boxes[i] = clampBox(
          {
            ...boxes[i],
            x: preferRight ? ab.x - boxes[i].w - 10 : ab.x + ab.w + 10,
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
