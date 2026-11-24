import { useEffect, useRef, useState } from "react";

/* ───────────────────────── constantes ───────────────────────── */

const T = 32; // tamanho do tile
const H = 11; // linhas do mapa
const VW = 16; // tiles visíveis na horizontal
const CW = VW * T;
const CH = H * T;
const STEP = 1000 / 60; // física fixa a 60 Hz (igual em monitores 60/120/144 Hz)
const GROUND_Y = 9 * T;
const PW = 24;
const PH = 30;
const MAX_LIVES = 5;
const FONT = '"Press Start 2P", monospace';

type Theme = "campo" | "masmorra" | "digital" | "anime" | "castelo";
type Cfg = {
  name: string;
  theme: Theme;
  w: number;
  time: number;
  gaps: [number, number][];
  plats: [number, number, number, string][];
  hearts: [number, number][];
  enemies: number[];
  bats: [number, number][];
  spikes: number[];
  coins: [number, number][];
  pipes: [number, number][];
  checkpoint: number;
  end: "F" | "J";
};

const CFG: Cfg[] = [
  {
    name: "OS CAMPOS",
    theme: "campo",
    w: 60,
    time: 200,
    gaps: [
      [18, 19],
      [38, 40],
    ],
    plats: [
      [8, 6, 4, "?"],
      [22, 5, 3, "#"],
      [30, 6, 5, "?"],
      [45, 5, 4, "#"],
    ],
    hearts: [],
    enemies: [12, 26, 33, 48],
    bats: [],
    spikes: [],
    coins: [
      [9, 5],
      [10, 5],
      [23, 4],
      [24, 4],
      [31, 5],
      [32, 5],
      [46, 4],
      [47, 4],
    ],
    pipes: [
      [15, 2],
      [42, 3],
    ],
    checkpoint: 30,
    end: "F",
  },
  {
    name: "A MASMORRA",
    theme: "masmorra",
    w: 70,
    time: 250,
    gaps: [
      [12, 14],
      [27, 29],
      [44, 47],
      [58, 59],
    ],
    plats: [
      [10, 6, 6, "#"],
      [20, 5, 4, "?"],
      [26, 6, 5, "#"],
      [35, 4, 4, "?"],
      [43, 6, 6, "#"],
      [52, 5, 4, "?"],
    ],
    hearts: [[35, 4]],
    enemies: [8, 20, 22, 36, 38, 50, 55, 65],
    bats: [
      [30, 4],
      [48, 3],
      [60, 4],
    ],
    spikes: [24, 40, 53],
    coins: [
      [11, 5],
      [12, 5],
      [13, 5],
      [21, 4],
      [22, 4],
      [36, 3],
      [37, 3],
      [44, 5],
      [45, 5],
      [53, 4],
    ],
    pipes: [
      [17, 2],
      [32, 3],
      [62, 2],
    ],
    checkpoint: 34,
    end: "F",
  },
  {
    name: "MUNDO DIGITAL",
    theme: "digital",
    w: 70,
    time: 250,
    gaps: [
      [11, 13],
      [24, 26],
      [38, 41],
      [54, 56],
    ],
    plats: [
      [9, 6, 5, "?"],
      [20, 5, 3, "#"],
      [24, 3, 3, "?"],
      [36, 6, 7, "#"],
      [44, 5, 3, "?"],
      [52, 6, 6, "#"],
    ],
    hearts: [[45, 5]],
    enemies: [7, 15, 21, 28, 34, 44, 51, 58, 64],
    bats: [
      [27, 4],
      [42, 3],
      [57, 4],
    ],
    spikes: [19, 35, 50],
    coins: [
      [10, 5],
      [11, 5],
      [12, 5],
      [21, 4],
      [25, 2],
      [26, 2],
      [37, 5],
      [38, 5],
      [39, 5],
      [44, 4],
      [55, 5],
    ],
    pipes: [
      [17, 2],
      [31, 3],
      [47, 2],
      [60, 3],
    ],
    checkpoint: 33,
    end: "F",
  },
  {
    name: "CIDADE ANIME",
    theme: "anime",
    w: 75,
    time: 270,
    gaps: [
      [13, 15],
      [25, 27],
      [36, 39],
      [50, 52],
      [63, 66],
    ],
    plats: [
      [11, 6, 6, "#"],
      [22, 5, 3, "?"],
      [25, 3, 3, "#"],
      [35, 6, 6, "#"],
      [42, 4, 3, "?"],
      [49, 6, 5, "#"],
      [55, 5, 3, "?"],
      [62, 6, 6, "#"],
    ],
    hearts: [[43, 4]],
    enemies: [8, 17, 22, 29, 34, 41, 48, 54, 61, 69],
    bats: [
      [24, 4],
      [38, 3],
      [52, 4],
      [65, 3],
    ],
    spikes: [28, 43, 56],
    coins: [
      [12, 5],
      [13, 5],
      [14, 5],
      [23, 4],
      [26, 2],
      [36, 5],
      [37, 5],
      [43, 3],
      [50, 5],
      [51, 5],
      [56, 4],
      [64, 5],
      [65, 5],
    ],
    pipes: [
      [19, 2],
      [31, 3],
      [45, 3],
      [58, 2],
    ],
    checkpoint: 40,
    end: "F",
  },
  {
    name: "O CASTELO DE JEAN",
    theme: "castelo",
    w: 80,
    time: 300,
    gaps: [
      [10, 12],
      [20, 23],
      [33, 36],
      [48, 51],
      [62, 65],
    ],
    plats: [
      [9, 6, 5, "#"],
      [18, 5, 3, "?"],
      [21, 3, 3, "#"],
      [32, 6, 6, "#"],
      [41, 5, 4, "?"],
      [47, 6, 6, "#"],
      [55, 4, 3, "?"],
      [61, 6, 6, "#"],
    ],
    hearts: [[41, 5]],
    enemies: [7, 15, 26, 29, 41, 46, 55, 60, 68, 73],
    bats: [
      [24, 4],
      [40, 3],
      [56, 4],
      [67, 3],
    ],
    spikes: [31, 54],
    coins: [
      [10, 5],
      [11, 5],
      [19, 4],
      [22, 2],
      [33, 5],
      [34, 5],
      [48, 5],
      [49, 5],
      [56, 3],
      [62, 5],
      [63, 5],
    ],
    pipes: [
      [16, 2],
      [27, 3],
      [44, 2],
      [57, 3],
      [70, 2],
    ],
    checkpoint: 38,
    end: "J",
  },
];

/* ───────────────────────── mapa ───────────────────────── */

type Map2D = string[][];

function build(c: Cfg): Map2D {
  const m: Map2D = Array.from({ length: H }, () => Array<string>(c.w).fill("."));
  const set = (x: number, y: number, ch: string) => {
    const row = m[y];
    if (row && x >= 0 && x < c.w) row[x] = ch;
  };
  for (let x = 0; x < c.w; x++)
    if (!c.gaps.some(([a, b]) => x >= a && x <= b)) {
      set(x, 9, "G");
      set(x, 10, "G");
    }
  c.plats.forEach(([x, y, n, ch]) => {
    for (let i = 0; i < n; i++) set(x + i, y, ch);
  });
  c.hearts.forEach(([x, y]) => set(x, y, "H"));
  c.pipes.forEach(([x, h]) => {
    for (let i = 0; i < h; i++) {
      set(x, 8 - i, "p");
      set(x + 1, 8 - i, "p");
    }
  });
  c.spikes.forEach((x) => set(x, 8, "^"));
  c.coins.forEach(([x, y]) => set(x, y, "o"));
  return m;
}

const solid = (ch?: string) =>
  ch === "G" || ch === "#" || ch === "?" || ch === "p" || ch === "u" || ch === "H";

/* ───────────────────────── tipos de entidades ───────────────────────── */

type Box = { x: number; y: number; vx: number; vy: number };
type Enemy = Box & { dead: number; active: boolean };
type Bat = Enemy & { baseY: number; ph: number; minX: number; maxX: number };
type Part = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  kind: "sq" | "heart" | "text";
  text?: string;
  g: number;
};
type Player = Box & {
  ground: boolean;
  flip: boolean;
  coyote: number;
  buffer: number;
  inv: number;
  walk: number;
};

function makeLevel(i: number) {
  const cfg = CFG[i]!;
  return {
    cfg,
    map: build(cfg),
    enemies: cfg.enemies.map<Enemy>((x) => ({
      x: x * T,
      y: 8 * T,
      vx: -1,
      vy: 0,
      dead: 0,
      active: false,
    })),
    bats: cfg.bats.map<Bat>(([x, y]) => ({
      x: x * T,
      y: y * T,
      vx: -1.3,
      vy: 0,
      dead: 0,
      active: false,
      baseY: y * T,
      ph: x,
      minX: (x - 4) * T,
      maxX: (x + 3) * T,
    })),
    pops: [] as { x: number; y: number; t: number }[],
    bump: null as { x: number; y: number; t: number } | null,
    flagY: 1 * T + 6,
    endX: (cfg.w - 4) * T,
  };
}
type Level = ReturnType<typeof makeLevel>;

const newPlayer = (x: number): Player => ({
  x,
  y: GROUND_Y - PH,
  vx: 0,
  vy: 0,
  ground: true,
  flip: false,
  coyote: 0,
  buffer: 0,
  inv: 0,
  walk: 0,
});

/* ───────────────────────── áudio (sintetizado, sem arquivos) ───────────────────────── */

type Sfx =
  | "jump"
  | "coin"
  | "stomp"
  | "bump"
  | "life"
  | "die"
  | "check"
  | "clear"
  | "tick"
  | "love"
  | "over"
  | "pause"
  | "hurry";

function createAudio() {
  let ctx: AudioContext | null = null;
  let muted = false;
  const unlock = () => {
    try {
      if (!ctx) {
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === "suspended") void ctx.resume();
    } catch {
      ctx = null;
    }
  };
  const tone = (
    f0: number,
    f1: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    delay = 0,
  ) => {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t0 + dur);
    gn.gain.setValueAtTime(vol, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  };
  const seq = (notes: [number, number][], type: OscillatorType, vol: number) => {
    let d = 0;
    for (const [f, len] of notes) {
      tone(f, f, len * 0.95, type, vol, d);
      d += len;
    }
  };
  const play = (s: Sfx) => {
    switch (s) {
      case "jump":
        return tone(300, 640, 0.15, "square", 0.035);
      case "coin":
        tone(988, 988, 0.06, "square", 0.04);
        return tone(1319, 1319, 0.2, "square", 0.04, 0.06);
      case "stomp":
        return tone(420, 80, 0.14, "triangle", 0.14);
      case "bump":
        return tone(150, 90, 0.08, "triangle", 0.12);
      case "life":
        return seq(
          [
            [659, 0.08],
            [784, 0.08],
            [1319, 0.08],
            [1047, 0.08],
            [1175, 0.08],
            [1568, 0.18],
          ],
          "square",
          0.035,
        );
      case "die":
        return seq(
          [
            [494, 0.12],
            [440, 0.12],
            [392, 0.12],
            [330, 0.35],
          ],
          "triangle",
          0.13,
        );
      case "check":
        return seq(
          [
            [523, 0.08],
            [784, 0.18],
          ],
          "square",
          0.04,
        );
      case "clear":
        return seq(
          [
            [392, 0.1],
            [523, 0.1],
            [659, 0.1],
            [784, 0.22],
            [659, 0.1],
            [784, 0.4],
          ],
          "square",
          0.04,
        );
      case "tick":
        return tone(1800, 1800, 0.025, "square", 0.015);
      case "love":
        return seq(
          [
            [523, 0.16],
            [659, 0.16],
            [784, 0.16],
            [1047, 0.32],
            [988, 0.16],
            [1047, 0.5],
          ],
          "triangle",
          0.12,
        );
      case "over":
        return seq(
          [
            [392, 0.22],
            [330, 0.22],
            [262, 0.55],
          ],
          "triangle",
          0.12,
        );
      case "pause":
        return tone(660, 660, 0.08, "square", 0.04);
      case "hurry":
        return seq(
          [
            [880, 0.08],
            [0.01, 0.04],
            [880, 0.08],
            [0.01, 0.04],
            [1175, 0.16],
          ],
          "square",
          0.035,
        );
    }
  };
  return { unlock, play, setMuted: (m: boolean) => void (muted = m) };
}

/* ───────────────────────── desenho ───────────────────────── */

type Look = {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  shoes: string;
  style: "jack" | "jean";
};
const JACK: Look = {
  skin: "#f2d3bd",
  hair: "#0d0d0d",
  shirt: "#e03030",
  pants: "#2850c8",
  shoes: "#3a2a1a",
  style: "jack",
};
const JEAN: Look = {
  skin: "#5a3a22",
  hair: "#111",
  shirt: "#d94f6b",
  pants: "#333",
  shoes: "#f4f4f4",
  style: "jean",
};

// pose: 0 parado, 1/2 andando, 3 pulando
function person(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: Look,
  flip: boolean,
  pose: number,
) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (flip) {
    c.translate(PW, 0);
    c.scale(-1, 1);
  }
  const legs: [number, number, number][][] = [
    [
      [4, 20, 10],
      [13, 20, 10],
    ],
    [
      [1, 20, 10],
      [15, 20, 9],
    ],
    [
      [6, 20, 9],
      [11, 20, 10],
    ],
    [
      [3, 18, 9],
      [14, 21, 9],
    ],
  ];
  for (const [lx, ly, lh] of legs[pose]!) {
    c.fillStyle = look.pants;
    c.fillRect(lx, ly, 7, lh - 3);
    c.fillStyle = look.shoes;
    c.fillRect(lx, ly + lh - 3, 8, 3);
  }
  c.fillStyle = look.shirt;
  c.fillRect(2, 11, 20, 11);
  c.fillStyle = "rgba(0,0,0,0.18)";
  c.fillRect(2, 19, 20, 3);
  c.fillStyle = look.skin;
  c.fillRect(0, 13, 3, 7);
  if (pose === 3) c.fillRect(21, 4, 3, 9);
  else c.fillRect(21, 13, 3, 7);
  c.fillRect(5, 0, 14, 12);
  c.fillStyle = look.hair;
  if (look.style === "jack") {
    c.fillRect(4, -3, 16, 5);
    c.fillRect(4, -3, 4, 10);
    c.fillRect(9, -5, 5, 2);
    c.fillRect(15, -4, 4, 2);
  } else {
    c.fillRect(5, -3, 14, 4);
    c.fillRect(4, -1, 3, 4);
    c.fillRect(17, -1, 3, 3);
    c.fillRect(7, -4, 3, 1);
    c.fillRect(12, -4, 4, 1);
  }
  c.fillStyle = "#111";
  c.fillRect(14, 4, 2, 3);
  c.fillStyle = look.style === "jack" ? "#b0524a" : "#2a1408";
  c.fillRect(13, 9, 4, 1);
  c.restore();
}

const HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
function heart(c: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  c.fillStyle = color;
  HEART.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row[i] === "X") c.fillRect(x + i * s, y + j * s, s, s);
  });
}

function coinIcon(c: CanvasRenderingContext2D, x: number, y: number, w: number) {
  c.fillStyle = "#ffd700";
  c.beginPath();
  c.ellipse(x, y, w, 11, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#b8860b";
  c.fillRect(x - 1, y - 6, 2, 12);
}

const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

function drawBackground(g: CanvasRenderingContext2D, theme: Theme, cam: number, f: number) {
  if (theme === "campo") {
    const sky = g.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0, "#5c94fc");
    sky.addColorStop(1, "#b8dcff");
    g.fillStyle = sky;
    g.fillRect(0, 0, CW, CH);
    // nuvens (parallax 0.25)
    g.fillStyle = "#fff";
    for (let i = 0; i < 14; i++) {
      const x = ((((i * 220 - cam * 0.25) % 3080) + 3080) % 3080) - 120;
      if (x > CW + 80) continue;
      const y = 40 + (i % 3) * 22;
      g.beginPath();
      g.arc(x, y, 16, 0, 7);
      g.arc(x + 20, y - 8, 21, 0, 7);
      g.arc(x + 44, y, 16, 0, 7);
      g.fill();
    }
    // morros (parallax 0.5)
    for (let i = 0; i < 20; i++) {
      const x = i * 260 + 120 - cam * 0.5;
      if (x < -140 || x > CW + 140) continue;
      g.fillStyle = i % 2 ? "#3fa34d" : "#58b85f";
      g.beginPath();
      g.arc(x, GROUND_Y + 4, 60 + (i % 3) * 20, Math.PI, 0);
      g.fill();
    }
  } else if (theme === "masmorra") {
    const bg = g.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, "#1b1626");
    bg.addColorStop(1, "#2c2238");
    g.fillStyle = bg;
    g.fillRect(0, 0, CW, CH);
    // parede de tijolos ao fundo (parallax 0.5)
    const off = (cam * 0.5) % 48;
    g.fillStyle = "rgba(255,255,255,0.05)";
    for (let row = 0; row < 12; row++) {
      const y = row * 24;
      g.fillRect(0, y, CW, 2);
      for (let x = -off + (row % 2) * 24; x < CW; x += 48) g.fillRect(x, y, 2, 24);
    }
    // correntes penduradas
    g.fillStyle = "rgba(160,150,190,0.25)";
    for (let i = 0; i < 12; i++) {
      const x = i * 180 + 60 - cam * 0.5;
      if (x < -20 || x > CW + 20) continue;
      const len = 40 + hash(i) * 60;
      for (let y = 0; y < len; y += 8) g.fillRect(x + (y % 16 ? 0 : 1), y, 3, 6);
    }
  } else if (theme === "digital") {
    g.fillStyle = "#050b1e";
    g.fillRect(0, 0, CW, CH);
    // grade (parallax 0.4)
    g.fillStyle = "rgba(0,220,255,0.12)";
    const off = (cam * 0.4) % 40;
    for (let x = -off; x < CW; x += 40) g.fillRect(x, 0, 1, CH);
    for (let y = 0; y < CH; y += 40) g.fillRect(0, y, CW, 1);
    // chuva de dados
    g.font = "10px monospace";
    for (let i = 0; i < 26; i++) {
      const x = (((hash(i) * 900 - cam * 0.2) % CW) + CW) % CW;
      const speed = 1 + hash(i + 7) * 2;
      for (let k = 0; k < 6; k++) {
        const y = ((f * speed + hash(i + 3) * CH + k * 12) % (CH + 80)) - 80;
        g.fillStyle = `rgba(60,255,140,${0.08 + k * 0.06})`;
        g.fillText(hash(i * 31 + k + Math.floor(f / 20)) > 0.5 ? "1" : "0", x, y);
      }
    }
    // torres de servidor
    for (let i = 0; i < 16; i++) {
      const x = i * 210 + 40 - cam * 0.3;
      if (x < -80 || x > CW + 20) continue;
      const h = 80 + hash(i + 50) * 90;
      g.fillStyle = "#0b1c3a";
      g.fillRect(x, GROUND_Y - h, 60, h);
      for (let y = GROUND_Y - h + 8; y < GROUND_Y - 6; y += 12) {
        g.fillStyle = hash(i * 13 + y + Math.floor(f / 30)) > 0.6 ? "#3cff8c" : "#0e3a5c";
        g.fillRect(x + 8, y, 6, 4);
        g.fillStyle = "#123a66";
        g.fillRect(x + 20, y, 32, 4);
      }
    }
  } else if (theme === "anime") {
    const sky = g.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0, "#ff9ec7");
    sky.addColorStop(0.6, "#ffd0a8");
    sky.addColorStop(1, "#fff1d6");
    g.fillStyle = sky;
    g.fillRect(0, 0, CW, CH);
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.beginPath();
    g.arc(CW * 0.3 - cam * 0.02, 120, 60, 0, 7);
    g.fill();
    // montanha com neve
    const mx = CW * 0.65 - cam * 0.05;
    g.fillStyle = "#9b8ac4";
    g.beginPath();
    g.moveTo(mx - 220, GROUND_Y);
    g.lineTo(mx, 80);
    g.lineTo(mx + 220, GROUND_Y);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(mx - 50, 152);
    g.lineTo(mx, 80);
    g.lineTo(mx + 50, 152);
    g.lineTo(mx + 20, 140);
    g.lineTo(mx, 156);
    g.lineTo(mx - 22, 140);
    g.fill();
    // prédios (parallax 0.35)
    for (let i = 0; i < 24; i++) {
      const x = i * 120 - cam * 0.35;
      if (x < -80 || x > CW + 20) continue;
      const h = 60 + hash(i + 11) * 110;
      const w = 50 + hash(i + 5) * 30;
      g.fillStyle = i % 2 ? "#6b4c8a" : "#7d5c9c";
      g.fillRect(x, GROUND_Y - h, w, h);
      for (let y = GROUND_Y - h + 8; y < GROUND_Y - 10; y += 14)
        for (let xx = x + 6; xx < x + w - 8; xx += 12) {
          g.fillStyle = hash(i * 97 + y + xx) > 0.45 ? "#ffe9a8" : "#4a3366";
          g.fillRect(xx, y, 6, 7);
        }
    }
    // portais torii (parallax 0.6)
    for (let i = 0; i < 10; i++) {
      const x = i * 420 + 200 - cam * 0.6;
      if (x < -100 || x > CW + 100) continue;
      g.fillStyle = "#e0332f";
      g.fillRect(x, GROUND_Y - 90, 8, 90);
      g.fillRect(x + 62, GROUND_Y - 90, 8, 90);
      g.fillRect(x - 12, GROUND_Y - 96, 94, 9);
      g.fillRect(x - 4, GROUND_Y - 74, 78, 6);
      g.fillStyle = "#2a1a1a";
      g.fillRect(x - 14, GROUND_Y - 100, 98, 4);
    }
    // pétalas de cerejeira
    for (let i = 0; i < 30; i++) {
      const x = (((hash(i) * CW + f * (0.6 + hash(i + 2)) - cam * 0.7) % CW) + CW) % CW;
      const y = (hash(i + 9) * CH + f * (0.8 + hash(i + 4) * 0.6)) % CH;
      g.fillStyle = i % 3 ? "#ffb7d5" : "#fff0f6";
      g.fillRect(x + Math.sin(f / 30 + i) * 6, y, 4, 3);
    }
  } else {
    const sky = g.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0, "#2a1b4d");
    sky.addColorStop(0.55, "#c75b7a");
    sky.addColorStop(1, "#ffc27a");
    g.fillStyle = sky;
    g.fillRect(0, 0, CW, CH);
    // estrelas
    for (let i = 0; i < 40; i++) {
      const x = (hash(i) * 1400 - cam * 0.05) % CW;
      const y = hash(i + 99) * 120;
      g.fillStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.sin(f / 20 + i)})`;
      g.fillRect((x + CW) % CW, y, 2, 2);
    }
    // sol
    g.fillStyle = "#ffe29a";
    g.beginPath();
    g.arc(CW * 0.72 - cam * 0.03, 230, 46, 0, 7);
    g.fill();
    // silhueta de castelos (parallax 0.25)
    g.fillStyle = "#3b2350";
    for (let i = 0; i < 12; i++) {
      const x = i * 300 - cam * 0.25;
      if (x < -200 || x > CW + 40) continue;
      const h = 90 + hash(i) * 50;
      g.fillRect(x, GROUND_Y - h, 120, h);
      g.fillRect(x - 16, GROUND_Y - h - 40, 28, h + 40);
      g.fillRect(x + 108, GROUND_Y - h - 30, 28, h + 30);
      for (let k = 0; k < 120; k += 20) g.fillRect(x + k, GROUND_Y - h - 10, 10, 10);
    }
    g.fillStyle = "#4a2d5a";
    for (let i = 0; i < 20; i++) {
      const x = i * 230 + 80 - cam * 0.5;
      if (x < -140 || x > CW + 140) continue;
      g.beginPath();
      g.arc(x, GROUND_Y + 8, 70 + (i % 3) * 15, Math.PI, 0);
      g.fill();
    }
  }
}

const PALETTE: Record<
  Theme,
  { g: string; top: string; spot: string; b: string; bl: string; col: string; colHi: string }
> = {
  campo: {
    g: "#c84c0c",
    top: "#5ac54f",
    spot: "#e07030",
    b: "#b85020",
    bl: "#7a2e0a",
    col: "#1fa83a",
    colHi: "#7cf08a",
  },
  masmorra: {
    g: "#4a4458",
    top: "#6b6480",
    spot: "#3f7a4a",
    b: "#5a5468",
    bl: "#2e2a38",
    col: "#6e6a7e",
    colHi: "#9a96aa",
  },
  digital: {
    g: "#0d2a4a",
    top: "#00e0ff",
    spot: "#1f5a8a",
    b: "#123a66",
    bl: "#00e0ff",
    col: "#1a3f6e",
    colHi: "#3cff8c",
  },
  anime: {
    g: "#8a5a3c",
    top: "#ff9ec7",
    spot: "#a8704c",
    b: "#d9534f",
    bl: "#6a2a2a",
    col: "#e0332f",
    colHi: "#ff8a80",
  },
  castelo: {
    g: "#5b3a5e",
    top: "#8a5a8c",
    spot: "#7a4a7c",
    b: "#7a4a6a",
    bl: "#3a1e34",
    col: "#8c6c8e",
    colHi: "#c0a0c2",
  },
};

/* ───────────────────────── componente ───────────────────────── */

type Screen = "title" | "play" | "pause" | "over" | "love";
type Phase = "title" | "intro" | "play" | "clear" | "dying" | "love" | "end" | "over";
type Api = {
  start: (lvl?: number) => void;
  cont: () => void;
  togglePause: () => void;
  toggleMute: () => void;
  unlock: () => void;
};
type Summary = { score: number; coins: number; best: number; lvl: number; newBest: boolean };

const readUnlocked = () => {
  try {
    return Math.min(Number(localStorage.getItem("superjack.unlocked") ?? 0) || 0, CFG.length - 1);
  } catch {
    return 0;
  }
};
const readBest = () => {
  try {
    return Number(localStorage.getItem("superjack.best") ?? 0) || 0;
  } catch {
    return 0;
  }
};
const saveBest = (n: number) => {
  try {
    localStorage.setItem("superjack.best", String(n));
  } catch {
    /* sem storage */
  }
};
const pad = (n: number, w: number) => String(Math.max(0, n)).padStart(w, "0");

export function DungeonGame() {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useRef({ l: false, r: false, j: false, jEdge: false });
  const api = useRef<Api | null>(null);
  const [screen, setScreen] = useState<Screen>("title");
  const [summary, setSummary] = useState<Summary>({
    score: 0,
    coins: 0,
    best: 0,
    lvl: 0,
    newBest: false,
  });
  const [muted, setMuted] = useState(false);
  const [touch, setTouch] = useState(false);
  const [unlocked, setUnlocked] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    setTouch(window.matchMedia?.("(pointer: coarse)").matches ?? false);
    setUnlocked(readUnlocked());
    setSummary((s) => ({ ...s, best: readBest() }));
    const unlock = (i: number) => {
      if (i <= readUnlocked()) return;
      try {
        localStorage.setItem("superjack.unlocked", String(i));
      } catch {
        /* ignore */
      }
      setUnlocked(i);
    };

    const audio = createAudio();
    let isMuted = false;
    try {
      isMuted = localStorage.getItem("superjack.muted") === "1";
    } catch {
      /* ignore */
    }
    audio.setMuted(isMuted);
    setMuted(isMuted);
    const sfx = audio.play;

    const S = {
      lvl: 0,
      lives: 3,
      coins: 0,
      score: 0,
      phase: "title" as Phase,
      paused: false,
      phaseT: 0,
      frame: 0,
      shake: 0,
      cp: false,
      timeLeft: CFG[0]!.time,
      timeAcc: 0,
      bonus: 0,
    };
    let L: Level = makeLevel(0);
    const p = newPlayer(64);
    let parts: Part[] = [];

    /* ── helpers ── */
    const at = (px: number, py: number) => L.map[Math.floor(py / T)]?.[Math.floor(px / T)];
    const setTile = (tx: number, ty: number, ch: string) => {
      const row = L.map[ty];
      if (row) row[tx] = ch;
    };
    const burst = (x: number, y: number, color: string, n = 8) => {
      for (let i = 0; i < n; i++)
        parts.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 5 - 1,
          life: 30,
          max: 30,
          color,
          kind: "sq",
          g: 0.3,
        });
    };
    const popText = (x: number, y: number, text: string) =>
      parts.push({
        x,
        y,
        vx: 0,
        vy: -0.8,
        life: 45,
        max: 45,
        color: "#fff",
        kind: "text",
        text,
        g: 0,
      });
    const heartP = (x: number, y: number) =>
      parts.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -0.8 - Math.random(),
        life: 100,
        max: 100,
        color: Math.random() < 0.5 ? "#ff4d79" : "#ff8fb1",
        kind: "heart",
        g: -0.004,
      });
    const addScore = (n: number, x?: number, y?: number) => {
      S.score += n;
      if (x !== undefined && y !== undefined) popText(x, y, String(n));
    };

    const show = (s: Screen) => setScreen(s);
    const spawn = (respawn: boolean) => {
      Object.assign(p, newPlayer(S.cp ? L.cfg.checkpoint * T : 64));
      p.inv = respawn ? 100 : 0;
    };
    const loadLevel = (i: number, keepCp: boolean) => {
      L = makeLevel(i);
      S.lvl = i;
      if (!keepCp) S.cp = false;
      S.timeLeft = L.cfg.time;
      S.timeAcc = 0;
      parts = [];
      spawn(keepCp);
      S.phase = "intro";
      S.phaseT = 0;
    };

    const die = () => {
      if (S.phase !== "play") return;
      S.phase = "dying";
      S.phaseT = 0;
      p.vx = 0;
      p.vy = -10;
      S.shake = 14;
      sfx("die");
    };

    const finishRun = () => {
      const best = readBest();
      const newBest = S.score > best;
      if (newBest) saveBest(S.score);
      setSummary({
        score: S.score,
        coins: S.coins,
        best: Math.max(best, S.score),
        lvl: S.lvl,
        newBest,
      });
    };

    const moveBox = (o: Box, w: number, h: number, hitHead?: (tx: number, ty: number) => void) => {
      o.x += o.vx;
      let hitWall = false;
      for (const yy of [o.y + 1, o.y + h - 1]) {
        if (o.vx > 0 && solid(at(o.x + w, yy))) {
          o.x = Math.floor((o.x + w) / T) * T - w - 0.01;
          hitWall = true;
        }
        if (o.vx < 0 && solid(at(o.x, yy))) {
          o.x = Math.floor(o.x / T + 1) * T;
          hitWall = true;
        }
      }
      o.vy = Math.min(o.vy + 0.6, 12);
      o.y += o.vy;
      let onG = false;
      let headDone = false;
      for (const xx of [o.x + 2, o.x + w - 2]) {
        if (o.vy > 0 && solid(at(xx, o.y + h))) {
          o.y = Math.floor((o.y + h) / T) * T - h;
          o.vy = 0;
          onG = true;
        }
        if (o.vy < 0 && solid(at(xx, o.y))) {
          const ty = Math.floor(o.y / T);
          o.y = (ty + 1) * T;
          o.vy = 0;
          if (!headDone) hitHead?.(Math.floor(xx / T), ty);
          headDone = true;
        }
      }
      return { hitWall, onG };
    };

    const hitBlock = (tx: number, ty: number) => {
      const ch = L.map[ty]?.[tx];
      if (ch === "?") {
        setTile(tx, ty, "u");
        L.pops.push({ x: tx * T, y: ty * T, t: 0 });
        L.bump = { x: tx, y: ty, t: 0 };
        S.coins++;
        addScore(100, tx * T + 8, ty * T - 10);
        sfx("coin");
      } else if (ch === "H") {
        setTile(tx, ty, "u");
        L.bump = { x: tx, y: ty, t: 0 };
        S.lives = Math.min(S.lives + 1, MAX_LIVES);
        for (let i = 0; i < 6; i++) heartP(tx * T + 16, ty * T);
        popText(tx * T - 4, ty * T - 12, "+1 VIDA");
        sfx("life");
      } else {
        L.bump = { x: tx, y: ty, t: 0 };
        sfx("bump");
      }
    };

    /* ── atualização ── */
    const stepPlay = () => {
      const k = keys.current;
      const cfg = L.cfg;

      // tempo
      if (++S.timeAcc >= 60) {
        S.timeAcc = 0;
        S.timeLeft--;
        if (S.timeLeft === 30) sfx("hurry");
        if (S.timeLeft <= 0) return die();
      }

      // movimento horizontal
      const accel = p.ground ? 0.5 : 0.35;
      if (k.l && !k.r) {
        p.vx = Math.max(p.vx - accel, -4);
        p.flip = true;
      } else if (k.r && !k.l) {
        p.vx = Math.min(p.vx + accel, 4);
        p.flip = false;
      } else {
        p.vx *= p.ground ? 0.78 : 0.93;
        if (Math.abs(p.vx) < 0.05) p.vx = 0;
      }

      // pulo com coyote time + buffer
      p.coyote = p.ground ? 6 : p.coyote - 1;
      if (k.jEdge) p.buffer = 8;
      else p.buffer--;
      if (p.buffer > 0 && p.coyote > 0) {
        p.vy = -11.5;
        p.coyote = 0;
        p.buffer = 0;
        p.ground = false;
        sfx("jump");
      }
      if (!k.j && p.vy < -4) p.vy = -4;

      const r = moveBox(p, PW, PH, hitBlock);
      if (!p.ground && r.onG) burst(p.x + PW / 2, p.y + PH, "rgba(255,255,255,0.6)", 3);
      p.ground = r.onG;
      if (p.x < 0) p.x = 0;
      if (p.x > cfg.w * T - PW) p.x = cfg.w * T - PW;
      p.walk = p.ground && Math.abs(p.vx) > 0.4 ? p.walk + Math.abs(p.vx) : 0;
      if (p.inv > 0) p.inv--;

      // moedas
      for (const [cx, cy] of [
        [p.x + 4, p.y + 4],
        [p.x + PW - 4, p.y + 4],
        [p.x + 4, p.y + PH - 4],
        [p.x + PW - 4, p.y + PH - 4],
      ] as const) {
        const tx = Math.floor(cx / T);
        const ty = Math.floor(cy / T);
        if (L.map[ty]?.[tx] === "o") {
          setTile(tx, ty, ".");
          S.coins++;
          addScore(50);
          burst(tx * T + 16, ty * T + 16, "#ffd700", 6);
          sfx("coin");
        }
      }

      // espinhos
      for (const sx of [p.x + 5, p.x + PW - 5]) {
        const ty = Math.floor((p.y + PH - 2) / T);
        if (at(sx, p.y + PH - 2) === "^" && p.y + PH > ty * T + 14 && p.inv === 0) return die();
      }

      // checkpoint
      if (!S.cp && p.x >= cfg.checkpoint * T) {
        S.cp = true;
        sfx("check");
        for (let i = 0; i < 8; i++) heartP(cfg.checkpoint * T + 14, 5 * T);
        popText(cfg.checkpoint * T - 20, 4 * T, "CHECKPOINT!");
      }

      // buraco
      if (p.y > CH) return die();

      // fim da fase
      if (cfg.end === "F" && p.x >= L.endX - 8) {
        S.phase = "clear";
        S.phaseT = 0;
        S.bonus = S.timeLeft * 10;
        p.x = L.endX - 8;
        p.vx = 0;
        p.vy = 0;
        sfx("clear");
        return;
      }
      if (cfg.end === "J" && p.x + PW >= L.endX - 4) {
        S.phase = "love";
        S.phaseT = 0;
        S.bonus = S.timeLeft * 10;
        p.vy = 0;
        sfx("love");
        return;
      }

      // inimigos
      const camX = camera();
      for (const e of L.enemies) {
        if (!e.active) {
          if (e.x < camX + CW + 48) e.active = true;
          else continue;
        }
        if (e.dead) {
          e.dead++;
          continue;
        }
        if (e.y > CH + 40) continue;
        const r2 = moveBox(e, 28, 26);
        if (r2.hitWall) e.vx = -e.vx;
        if (r2.onG && !solid(at(e.vx > 0 ? e.x + 30 : e.x - 2, e.y + 30))) e.vx = -e.vx;
        if (p.x < e.x + 28 && p.x + PW > e.x && p.y < e.y + 26 && p.y + PH > e.y + 2) {
          if (p.vy > 0 && p.y + PH < e.y + 16) {
            e.dead = 1;
            p.vy = keys.current.j ? -11 : -8;
            addScore(200, e.x, e.y - 10);
            burst(e.x + 14, e.y + 20, "#8b4513", 8);
            sfx("stomp");
          } else if (p.inv === 0) return die();
        }
      }
      for (const b of L.bats) {
        if (!b.active) {
          if (b.x < camX + CW + 48) b.active = true;
          else continue;
        }
        if (b.dead) {
          b.dead++;
          b.vy += 0.4;
          b.y += b.vy;
          continue;
        }
        b.x += b.vx;
        if (b.x < b.minX || b.x > b.maxX) b.vx = -b.vx;
        b.ph += 0.06;
        b.y = b.baseY + Math.sin(b.ph) * 22;
        if (p.x < b.x + 26 && p.x + PW > b.x + 2 && p.y < b.y + 16 && p.y + PH > b.y + 2) {
          if (p.vy > 0 && p.y + PH < b.y + 12) {
            b.dead = 1;
            b.vy = -2;
            p.vy = keys.current.j ? -11 : -8;
            addScore(300, b.x, b.y - 10);
            burst(b.x + 14, b.y + 8, "#6a4c9c", 8);
            sfx("stomp");
          } else if (p.inv === 0) return die();
        }
      }
    };

    const step = () => {
      S.frame++;
      if (S.shake > 0) S.shake--;
      const k = keys.current;

      switch (S.phase) {
        case "intro":
          if (++S.phaseT >= 110) {
            S.phase = "play";
            S.phaseT = 0;
          }
          break;
        case "play":
          stepPlay();
          break;
        case "dying":
          S.phaseT++;
          if (S.phaseT > 25) {
            p.vy = Math.min(p.vy + 0.5, 10);
            p.y += p.vy;
          }
          if (S.phaseT > 110) {
            S.lives--;
            if (S.lives <= 0) {
              S.phase = "over";
              sfx("over");
              finishRun();
              show("over");
            } else loadLevel(S.lvl, true);
          }
          break;
        case "clear": {
          S.phaseT++;
          if (L.flagY < 7 * T) L.flagY += 4;
          if (S.phaseT < 40) p.y = Math.min(p.y + 4, GROUND_Y - PH);
          else if (p.x < (L.cfg.w - 1.5) * T) {
            p.x += 2;
            p.flip = false;
            p.walk += 2;
          } else p.walk = 0;
          if (S.phaseT > 40 && S.bonus > 0) {
            const d = Math.min(50, S.bonus);
            S.bonus -= d;
            S.score += d;
            if (S.frame % 4 === 0) sfx("tick");
          }
          if (S.phaseT > 170 && S.bonus === 0) {
            unlock(S.lvl + 1);
            loadLevel(S.lvl + 1, false);
          }
          break;
        }
        case "love": {
          S.phaseT++;
          const target = L.endX + 4;
          p.y = Math.min(p.y + 6, GROUND_Y - PH);
          if (p.x < target - 1) {
            p.x = Math.min(p.x + 1.6, target);
            p.flip = false;
            p.walk += 1.6;
          } else p.walk = 0;
          if (S.phaseT % 5 === 0) heartP(L.endX + 30, GROUND_Y - 40);
          if (S.bonus > 0) {
            const d = Math.min(50, S.bonus);
            S.bonus -= d;
            S.score += d;
          }
          if (S.phaseT > 200 && S.bonus === 0) {
            S.phase = "end";
            finishRun();
            show("love");
          }
          break;
        }
        case "end":
          if (S.frame % 4 === 0) heartP(Math.random() * L.cfg.w * T, CH + 10);
          if (S.frame % 6 === 0) heartP(L.endX + 30, GROUND_Y - 40);
          break;
      }

      // partículas
      for (const q of parts) {
        q.x += q.vx;
        q.y += q.vy;
        q.vy += q.g;
        q.life--;
      }
      parts = parts.filter((q) => q.life > 0 && q.y < CH + 40);
      for (const pp of L.pops) pp.t++;
      L.pops = L.pops.filter((pp) => pp.t < 24);
      if (L.bump && ++L.bump.t > 8) L.bump = null;
      k.jEdge = false;
    };

    const camera = () => {
      if (S.phase === "title") return 0;
      return Math.max(0, Math.min(p.x - CW * 0.4, L.cfg.w * T - CW));
    };

    /* ── renderização ── */
    const drawTile = (ch: string, x: number, y: number, X: number, Y: number) => {
      const pal = PALETTE[L.cfg.theme];
      const f = S.frame;
      if (L.bump && L.bump.x === x && L.bump.y === y) Y -= Math.sin((L.bump.t / 8) * Math.PI) * 6;
      switch (ch) {
        case "G": {
          g.fillStyle = pal.g;
          g.fillRect(X, Y, T, T);
          if (y === 9) {
            g.fillStyle = pal.top;
            g.fillRect(X, Y, T, 8);
            if (L.cfg.theme === "campo") {
              g.fillStyle = "#3fa34d";
              g.fillRect(X + 4, Y + 8, 4, 3);
              g.fillRect(X + 20, Y + 8, 4, 3);
            }
          } else {
            g.fillStyle = "rgba(0,0,0,0.15)";
            g.fillRect(X, Y, T, 2);
          }
          g.fillStyle = pal.spot;
          g.fillRect(X + 4 + ((x * 7) % 12), Y + 14 + ((x * 3) % 8), 8, 3);
          break;
        }
        case "#":
          g.fillStyle = pal.b;
          g.fillRect(X, Y, T, T);
          g.fillStyle = pal.bl;
          g.fillRect(X, Y + 15, T, 2);
          g.fillRect(X + 15, Y, 2, 15);
          g.fillRect(X + 7, Y + 17, 2, 15);
          g.fillRect(X + 23, Y + 17, 2, 15);
          g.fillRect(X, Y + T - 2, T, 2);
          break;
        case "?":
        case "H":
        case "u": {
          g.fillStyle = ch === "u" ? "#9a6a3a" : ch === "H" ? "#ff7aa2" : "#f8b800";
          g.fillRect(X + 1, Y + 1, T - 2, T - 2);
          g.fillStyle = ch === "u" ? "#6a4a2a" : "#7a3a00";
          g.fillRect(X + 3, Y + 3, 3, 3);
          g.fillRect(X + 26, Y + 3, 3, 3);
          g.fillRect(X + 3, Y + 26, 3, 3);
          g.fillRect(X + 26, Y + 26, 3, 3);
          const bob = Math.round(Math.sin(f / 10));
          if (ch === "?") {
            g.font = `bold 20px monospace`;
            g.fillStyle = "#7a3a00";
            g.fillText("?", X + 10, Y + 23 + bob);
          } else if (ch === "H") heart(g, X + 9, Y + 10 + bob, 2, "#fff");
          break;
        }
        case "p": {
          const left = L.map[y]?.[x - 1] !== "p";
          const top = L.map[y - 1]?.[x] !== "p";
          g.fillStyle = pal.col;
          g.fillRect(X, Y, T, T);
          g.fillStyle = pal.colHi;
          if (left) g.fillRect(X + 6, Y, 5, T);
          g.fillStyle = "rgba(0,0,0,0.2)";
          if (!left) g.fillRect(X + T - 6, Y, 4, T);
          if (top) {
            g.fillStyle = L.cfg.theme === "campo" ? "#14802a" : pal.bl;
            g.fillRect(X - (left ? 3 : 0), Y, T + 3, 8);
          }
          break;
        }
        case "^": {
          g.fillStyle = "#cfd3dc";
          g.strokeStyle = "#555a66";
          for (let i = 0; i < 4; i++) {
            g.beginPath();
            g.moveTo(X + i * 8, Y + T);
            g.lineTo(X + i * 8 + 4, Y + 14);
            g.lineTo(X + i * 8 + 8, Y + T);
            g.closePath();
            g.fill();
            g.stroke();
          }
          break;
        }
        case "o":
          coinIcon(
            g,
            X + 16,
            Y + 16 + Math.sin(f / 15 + x) * 2,
            Math.abs(Math.sin(f / 12 + x)) * 9 + 2,
          );
          break;
      }
    };

    const drawTorch = (X: number, Y: number) => {
      g.fillStyle = "#5a3a1a";
      g.fillRect(X + 13, Y + 10, 6, 14);
      const fl = Math.sin(S.frame / 4 + X) * 2;
      g.fillStyle = "#ff8a00";
      g.fillRect(X + 11, Y + 2 + fl, 10, 10);
      g.fillStyle = "#ffd84a";
      g.fillRect(X + 13, Y + 5 + fl, 6, 6);
    };

    const drawFlag = () => {
      const X = L.endX;
      g.fillStyle = "#ddd";
      g.fillRect(X + 14, T, 4, 8 * T);
      g.fillStyle = "#21b04b";
      g.beginPath();
      g.moveTo(X + 14, L.flagY);
      g.lineTo(X - 16, L.flagY + 14);
      g.lineTo(X + 14, L.flagY + 28);
      g.fill();
      heart(g, X - 4, L.flagY + 9, 1.5, "#fff");
      g.fillStyle = "#ffd700";
      g.beginPath();
      g.arc(X + 16, T, 6, 0, 7);
      g.fill();
      g.fillStyle = PALETTE[L.cfg.theme].bl;
      g.fillRect(X + 6, 8 * T + 14, 20, 18);
    };

    const drawCastle = () => {
      const X = L.endX - 20;
      g.fillStyle = "#f4e4c1";
      g.fillRect(X, 5 * T, 4 * T + 8, 4 * T);
      g.fillRect(X - 10, 3 * T, 30, 6 * T);
      g.fillRect(X + 4 * T - 12, 3 * T, 30, 6 * T);
      g.fillStyle = "#d8c49c";
      for (let i = 0; i < 4 * T + 8; i += 18) g.fillRect(X + i, 5 * T - 10, 10, 10);
      g.fillStyle = "#d94f6b";
      for (const tx of [X - 10, X + 4 * T - 12]) {
        g.beginPath();
        g.moveTo(tx - 4, 3 * T);
        g.lineTo(tx + 15, 3 * T - 36);
        g.lineTo(tx + 34, 3 * T);
        g.fill();
        g.fillRect(tx + 14, 3 * T - 56, 2, 22);
        g.fillRect(tx + 16, 3 * T - 56 + Math.round(Math.sin(S.frame / 10)), 12, 7);
      }
      g.fillStyle = "#6a3a2a";
      g.fillRect(X + 2 * T - 16, 7 * T, 40, 2 * T);
      g.beginPath();
      g.arc(X + 2 * T + 4, 7 * T, 20, Math.PI, 0);
      g.fill();
      g.fillStyle = "#ffd36a";
      g.fillRect(X - 2, 4 * T, 12, 14);
      g.fillRect(X + 4 * T - 4, 4 * T, 12, 14);
      const jx = L.endX + 30;
      const jumping = S.phase === "end" && Math.floor(S.frame / 30) % 2 === 0;
      person(g, jx, GROUND_Y - PH - (jumping ? 6 : 0), JEAN, true, jumping ? 3 : 0);
      heart(g, jx + 5, GROUND_Y - PH - 24 + Math.sin(S.frame / 8) * 4, 2, "#ff4d79");
    };

    const drawCheckpoint = () => {
      const X = L.cfg.checkpoint * T;
      g.fillStyle = "#999";
      g.fillRect(X + 12, 6 * T, 3, 3 * T);
      const wave = Math.sin(S.frame / 8) * 2;
      g.fillStyle = S.cp ? "#ff4d79" : "#777";
      g.beginPath();
      g.moveTo(X + 15, 6 * T);
      g.lineTo(X + 38, 6 * T + 8 + wave);
      g.lineTo(X + 15, 6 * T + 18);
      g.fill();
      if (S.cp) heart(g, X + 18, 6 * T + 5, 1, "#fff");
    };

    const drawEnemy = (e: Enemy) => {
      if (e.dead > 30) return;
      const X = e.x;
      const Y = e.y;
      const th = L.cfg.theme;
      const dark = th !== "campo";
      const body =
        th === "digital" ? "#7a2cff" : th === "anime" ? "#2f9e6a" : dark ? "#5a6a3a" : "#8b4513";
      if (e.dead) {
        g.fillStyle = body;
        g.fillRect(X, Y + 18, 28, 8);
        return;
      }
      if (th === "digital" && S.frame % 40 < 3) {
        g.fillStyle = "#3cff8c";
        g.fillRect(X - 3, Y + 6, 34, 2);
      }
      g.fillStyle = body;
      g.beginPath();
      g.ellipse(X + 14, Y + 12, 14, 12, 0, Math.PI, 0);
      g.fill();
      g.fillRect(X, Y + 11, 28, 8);
      g.fillStyle =
        th === "digital" ? "#c9a8ff" : th === "anime" ? "#a8f0c8" : dark ? "#b8c890" : "#f4d0a0";
      g.fillRect(X + 7, Y + 18, 14, 4);
      g.fillStyle = "#111";
      const f = Math.floor(S.frame / 10) % 2;
      g.fillRect(X + (f ? 0 : 4), Y + 22, 10, 4);
      g.fillRect(X + (f ? 18 : 14), Y + 22, 10, 4);
      g.fillStyle = "#fff";
      g.fillRect(X + 7, Y + 7, 5, 6);
      g.fillRect(X + 16, Y + 7, 5, 6);
      g.fillStyle = dark ? "#e02020" : "#000";
      const look = e.vx > 0 ? 1 : 0;
      g.fillRect(X + 8 + look * 2, Y + 9, 2, 3);
      g.fillRect(X + 17 + look * 2, Y + 9, 2, 3);
      g.fillStyle = "#111";
      g.fillRect(X + 6, Y + 5, 7, 2);
      g.fillRect(X + 15, Y + 5, 7, 2);
      if (th === "digital") {
        g.fillStyle = "#3cff8c";
        g.fillRect(X + 12, Y - 4, 4, 5);
        g.fillRect(X + 10, Y - 6, 8, 2);
      } else if (th === "anime") {
        g.fillStyle = "#fff";
        g.fillRect(X + 4, Y + 1, 3, 4);
        g.fillRect(X + 21, Y + 1, 3, 4);
      }
    };

    const drawBat = (b: Bat) => {
      if (b.dead > 60) return;
      const X = b.x;
      const Y = b.y;
      const flap = Math.floor(S.frame / 6) % 2 === 0;
      if (L.cfg.theme === "digital" || L.cfg.theme === "anime") {
        g.save();
        g.translate(X + 14, Y + 9);
        if (b.dead) g.rotate(b.dead / 6);
        if (L.cfg.theme === "digital") {
          // vírus digital: losango com olho
          g.fillStyle = "#ff2fa8";
          g.beginPath();
          g.moveTo(0, -11);
          g.lineTo(13, 0);
          g.lineTo(0, 11);
          g.lineTo(-13, 0);
          g.fill();
          g.fillStyle = "#fff";
          g.fillRect(-4, -3, 8, 6);
          g.fillStyle = "#000";
          g.fillRect(b.vx > 0 ? 1 : -3, -2, 3, 4);
          g.fillStyle = flap ? "#3cff8c" : "#00e0ff";
          g.fillRect(-16, -1, 3, 2);
          g.fillRect(13, -1, 3, 2);
        } else {
          // lanterna de papel assombrada
          g.fillStyle = "#2a1a1a";
          g.fillRect(-7, -13, 14, 3);
          g.fillRect(-7, 10, 14, 3);
          g.fillStyle = "#ff6b4a";
          g.fillRect(-11, -10, 22, 20);
          g.fillStyle = "#ffb08a";
          g.fillRect(-11, -4, 22, 2);
          g.fillRect(-11, 3, 22, 2);
          g.fillStyle = "#2a1a1a";
          g.fillRect(-6, -5, 3, 3);
          g.fillRect(3, -5, 3, 3);
          g.fillRect(-3, 2, 6, flap ? 3 : 2);
        }
        g.restore();
        return;
      }
      g.fillStyle = "#4a2f6e";
      g.fillRect(X + 9, Y + 4, 10, 10);
      if (b.dead) g.fillRect(X + 2, Y + 6, 24, 4);
      else if (flap) {
        g.fillRect(X, Y, 9, 6);
        g.fillRect(X + 19, Y, 9, 6);
      } else {
        g.fillRect(X, Y + 8, 9, 6);
        g.fillRect(X + 19, Y + 8, 9, 6);
      }
      g.fillStyle = "#ff3a3a";
      g.fillRect(X + 11, Y + 7, 2, 2);
      g.fillRect(X + 15, Y + 7, 2, 2);
      g.fillStyle = "#fff";
      g.fillRect(X + 12, Y + 12, 1, 2);
      g.fillRect(X + 15, Y + 12, 1, 2);
    };

    const centerText = (text: string, y: number, size: number, color: string) => {
      g.font = `${size}px ${FONT}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillText(text, CW / 2 + 2, y + 2);
      g.fillStyle = color;
      g.fillText(text, CW / 2, y);
      g.textAlign = "left";
    };

    const drawHUD = () => {
      g.fillStyle = "rgba(0,0,0,0.4)";
      g.fillRect(0, 0, CW, 24);
      for (let i = 0; i < S.lives; i++) heart(g, 6 + i * 16, 6, 2, "#ff4d79");
      g.font = `8px ${FONT}`;
      g.textBaseline = "middle";
      g.textAlign = "left";
      coinIcon(g, 98, 12, 5);
      g.fillStyle = "#fff";
      g.fillText(`x${pad(S.coins, 2)}`, 108, 13);
      g.fillText(`PONTOS ${pad(S.score, 6)}`, 158, 13);
      g.fillText(`FASE ${S.lvl + 1}-${CFG.length}`, 296, 13);
      const hurry = S.timeLeft <= 30;
      g.fillStyle = hurry && S.frame % 30 < 15 ? "#ff4d4d" : "#fff";
      g.fillText(`TEMPO ${pad(S.timeLeft, 3)}`, 428, 13);
    };

    const render = () => {
      const cam = camera();
      const theme = L.cfg.theme;
      g.save();
      if (S.shake > 0)
        g.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);
      drawBackground(g, theme, cam, S.frame);

      g.save();
      g.translate(-Math.round(cam), 0);
      const x0 = Math.floor(cam / T) - 1;
      const x1 = x0 + VW + 3;
      if (theme === "masmorra")
        for (let x = x0 - (x0 % 7); x <= x1; x += 7) if (x > 0) drawTorch(x * T, 3 * T);
      if (L.cfg.end === "J") drawCastle();
      drawCheckpoint();
      for (let y = 0; y < H; y++)
        for (let x = x0; x <= x1; x++) {
          const ch = L.map[y]?.[x];
          if (ch && ch !== ".") drawTile(ch, x, y, x * T, y * T);
        }
      if (L.cfg.end === "F") drawFlag();
      for (const pp of L.pops)
        coinIcon(g, pp.x + 16, pp.y - pp.t * 2.5, Math.abs(Math.sin(pp.t / 3)) * 9 + 2);
      L.enemies.forEach(drawEnemy);
      L.bats.forEach(drawBat);

      // Jack
      if (!(p.inv > 0 && S.frame % 6 < 3)) {
        let pose = 0;
        if (S.phase === "dying") pose = 3;
        else if (!p.ground && (S.phase === "play" || S.phase === "intro")) pose = 3;
        else if (p.walk > 0) pose = 1 + (Math.floor(p.walk / 10) % 2);
        if (S.phase === "end" && Math.floor(S.frame / 30) % 2 === 1) pose = 3;
        person(g, p.x, p.y - (S.phase === "end" && pose === 3 ? 6 : 0), JACK, p.flip, pose);
      }

      // partículas
      for (const q of parts) {
        const a = Math.min(1, q.life / (q.max * 0.4));
        g.globalAlpha = a;
        if (q.kind === "sq") {
          g.fillStyle = q.color;
          g.fillRect(q.x, q.y, 4, 4);
        } else if (q.kind === "heart") heart(g, q.x, q.y, 2, q.color);
        else {
          g.font = `8px ${FONT}`;
          g.fillStyle = "#000";
          g.fillText(q.text ?? "", q.x + 1, q.y + 1);
          g.fillStyle = q.color;
          g.fillText(q.text ?? "", q.x, q.y);
        }
        g.globalAlpha = 1;
      }
      g.restore();

      // iluminação da masmorra: luz ao redor de Jack + tochas
      if (theme === "masmorra") {
        const px = p.x - cam + PW / 2;
        const py = p.y + PH / 2;
        const light = g.createRadialGradient(px, py, 50, px, py, 300);
        light.addColorStop(0, "rgba(5,3,12,0)");
        light.addColorStop(1, "rgba(5,3,12,0.82)");
        g.fillStyle = light;
        g.fillRect(0, 0, CW, CH);
        g.globalCompositeOperation = "lighter";
        for (let x = x0 - (x0 % 7); x <= x1; x += 7) {
          if (x <= 0) continue;
          const tx = x * T - cam + 16;
          const r = 70 + Math.sin(S.frame / 5 + x) * 6;
          const glow = g.createRadialGradient(tx, 3 * T + 8, 2, tx, 3 * T + 8, r);
          glow.addColorStop(0, "rgba(255,150,40,0.35)");
          glow.addColorStop(1, "rgba(255,150,40,0)");
          g.fillStyle = glow;
          g.fillRect(tx - r, 3 * T + 8 - r, r * 2, r * 2);
        }
        g.globalCompositeOperation = "source-over";
      }

      if (S.phase !== "title") drawHUD();

      if (S.phase === "intro") {
        g.fillStyle = "rgba(10,6,20,0.8)";
        g.fillRect(0, CH / 2 - 56, CW, 112);
        centerText(`FASE ${S.lvl + 1}`, CH / 2 - 30, 10, "#ffd54a");
        centerText(L.cfg.name, CH / 2, 16, "#fff");
        heart(g, CW / 2 - 40, CH / 2 + 24, 2, "#ff4d79");
        g.font = `10px ${FONT}`;
        g.fillStyle = "#fff";
        g.textBaseline = "middle";
        g.fillText(`JACK x ${S.lives}`, CW / 2 - 20, CH / 2 + 31);
      }
      if (S.phase === "clear" && S.phaseT > 30) {
        g.fillStyle = "rgba(10,6,20,0.7)";
        g.fillRect(0, CH / 2 - 44, CW, 88);
        centerText("FASE CONCLUÍDA!", CH / 2 - 14, 14, "#ffd54a");
        centerText(`BÔNUS DE TEMPO  ${pad(S.bonus, 4)}`, CH / 2 + 16, 8, "#fff");
      }
      if (S.paused) {
        g.fillStyle = "rgba(0,0,0,0.5)";
        g.fillRect(0, 0, CW, CH);
      }
      g.restore();
    };

    /* ── loop com passo fixo ── */
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;
      if (S.paused) acc = 0;
      let n = 0;
      while (acc >= STEP && n < 5) {
        step();
        acc -= STEP;
        n++;
      }
      if (n === 5) acc = 0;
      render();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    /* ── API p/ os botões React ── */
    const inGame = () => S.phase !== "title" && S.phase !== "over" && S.phase !== "end";
    const togglePause = () => {
      if (!inGame()) return;
      S.paused = !S.paused;
      keys.current = { l: false, r: false, j: false, jEdge: false };
      sfx("pause");
      show(S.paused ? "pause" : "play");
    };
    const start = (lvl = 0) => {
      audio.unlock();
      S.lives = 3;
      S.coins = 0;
      S.score = 0;
      S.paused = false;
      loadLevel(Math.max(0, Math.min(lvl, CFG.length - 1)), false);
      show("play");
    };
    const cont = () => {
      audio.unlock();
      S.lives = 3;
      S.score = 0;
      S.paused = false;
      loadLevel(S.lvl, false);
      show("play");
    };
    const toggleMute = () => {
      isMuted = !isMuted;
      audio.setMuted(isMuted);
      setMuted(isMuted);
      try {
        localStorage.setItem("superjack.muted", isMuted ? "1" : "0");
      } catch {
        /* ignore */
      }
    };
    api.current = { start, cont, togglePause, toggleMute, unlock: audio.unlock };

    /* ── teclado ── */
    const KEYMAP: Record<string, "l" | "r" | "j"> = {
      ArrowLeft: "l",
      KeyA: "l",
      ArrowRight: "r",
      KeyD: "r",
      ArrowUp: "j",
      KeyW: "j",
      Space: "j",
      KeyZ: "j",
      KeyK: "j",
    };
    const down = (e: KeyboardEvent) => {
      if (e.code === "KeyM") return toggleMute();
      if (e.code === "KeyP" || e.code === "Escape") return togglePause();
      if (e.code === "Enter") {
        if (S.phase === "title" || S.phase === "end") {
          e.preventDefault();
          return start();
        }
        if (S.phase === "over") {
          e.preventDefault();
          return cont();
        }
        if (S.paused) return togglePause();
      }
      const k = KEYMAP[e.code];
      if (!k) return;
      e.preventDefault();
      if (S.paused) return;
      keys.current[k] = true;
      if (k === "j" && !e.repeat) keys.current.jEdge = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYMAP[e.code];
      if (k) keys.current[k] = false;
    };
    const blur = () => {
      keys.current = { l: false, r: false, j: false, jEdge: false };
      if (inGame() && !S.paused) togglePause();
    };
    const vis = () => document.hidden && blur();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", vis);
      api.current = null;
    };
  }, []);

  const press = (k: "l" | "r" | "j", v: boolean) => {
    keys.current[k] = v;
    if (k === "j" && v) keys.current.jEdge = true;
    if (v) api.current?.unlock();
  };
  const btn = (k: "l" | "r" | "j", label: string, cls = "h-16 w-16") => (
    <button
      type="button"
      aria-label={k === "l" ? "Esquerda" : k === "r" ? "Direita" : "Pular"}
      className={`game-btn ${cls} select-none touch-none text-lg`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        press(k, true);
      }}
      onPointerUp={() => press(k, false)}
      onPointerCancel={() => press(k, false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative w-full max-w-[768px] overflow-hidden rounded-md border-4 border-border shadow-[var(--shadow-glow)]">
        <canvas
          ref={ref}
          width={CW}
          height={CH}
          className="block w-full [image-rendering:pixelated]"
        />

        <div className="absolute right-2 bottom-2 flex gap-2">
          {screen === "play" && (
            <button
              type="button"
              className="game-btn px-2 py-1 opacity-80"
              onClick={() => api.current?.togglePause()}
              aria-label="Pausar"
            >
              ❚❚
            </button>
          )}
          <button
            type="button"
            className="game-btn px-2 py-1 opacity-80"
            onClick={() => api.current?.toggleMute()}
            aria-label={muted ? "Ativar som" : "Silenciar"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        {screen !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-background/85 p-4 text-center">
            {screen === "title" && (
              <>
                <p className="font-pixel text-lg text-primary sm:text-2xl">SUPER JACK</p>
                <p className="font-pixel text-[10px] text-foreground sm:text-xs">
                  em busca de Jean
                </p>
                <p className="max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Atravesse os campos, a masmorra, o mundo digital, a cidade anime e o castelo. Pule
                  nos monstros, pegue moedas e encontre o amor da sua vida.
                </p>
                <button
                  type="button"
                  className="game-btn px-5 py-3 text-xs"
                  onClick={() => api.current?.start()}
                >
                  ▶ COMEÇAR
                </button>
                {unlocked > 0 && (
                  <div className="flex max-w-sm flex-wrap justify-center gap-2">
                    <span className="w-full font-pixel text-[9px] text-muted-foreground">
                      ESCOLHER FASE
                    </span>
                    {CFG.slice(0, unlocked + 1).map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        className="game-btn px-3 py-2"
                        onClick={() => api.current?.start(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
                {summary.best > 0 && (
                  <p className="font-pixel text-[10px] text-muted-foreground">
                    RECORDE {pad(summary.best, 6)}
                  </p>
                )}
              </>
            )}
            {screen === "pause" && (
              <>
                <p className="font-pixel text-xl text-primary">PAUSADO</p>
                <button
                  type="button"
                  className="game-btn px-4 py-2"
                  onClick={() => api.current?.togglePause()}
                >
                  CONTINUAR
                </button>
              </>
            )}
            {screen === "over" && (
              <>
                <p className="font-pixel text-xl text-destructive">FIM DE JOGO</p>
                <p className="font-pixel text-xs text-foreground">PONTOS {pad(summary.score, 6)}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className="game-btn px-4 py-2"
                    onClick={() => api.current?.cont()}
                  >
                    CONTINUAR (FASE {summary.lvl + 1})
                  </button>
                  <button
                    type="button"
                    className="game-btn px-4 py-2"
                    onClick={() => api.current?.start()}
                  >
                    DO INÍCIO
                  </button>
                </div>
              </>
            )}
            {screen === "love" && (
              <>
                <p className="animate-pulse text-4xl text-primary">♥</p>
                <p className="font-pixel text-sm text-primary sm:text-base">JACK ENCONTROU JEAN!</p>
                <div className="max-w-xs rounded-md border-2 border-primary bg-card p-3">
                  <p className="font-pixel text-[10px] text-muted-foreground">JEAN DIZ:</p>
                  <p className="mt-2 font-pixel text-xs leading-relaxed text-primary sm:text-sm">
                    "Feliz aniversário! 🎂"
                  </p>
                </div>
                <p className="font-pixel text-[10px] text-foreground">
                  PONTOS {pad(summary.score, 6)} · 🪙 {summary.coins}
                </p>
                <p className="font-pixel text-[10px] text-muted-foreground">
                  {summary.newBest ? "★ NOVO RECORDE! ★" : `RECORDE ${pad(summary.best, 6)}`}
                </p>
                <button
                  type="button"
                  className="game-btn px-4 py-2"
                  onClick={() => api.current?.start()}
                >
                  JOGAR DE NOVO
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div
        className={`w-full max-w-[768px] items-center justify-between ${touch ? "flex" : "flex md:hidden"}`}
      >
        <div className="flex gap-3">
          {btn("l", "◀")}
          {btn("r", "▶")}
        </div>
        {btn("j", "A", "h-20 w-20")}
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Setas/WASD para andar · ↑, W ou espaço para pular (segure para pular mais alto) · P pausa ·
        M som. Pule em cima dos inimigos, cuidado com os espinhos e chegue à bandeira. Na última
        fase, Jean te espera no castelo.
      </p>
    </div>
  );
}
