import { useEffect, useRef, useState } from "react";

// PandaParticles.tsx
// Canvas de partículas que se agrupan para formar un panda (emoji 🐼)
// Interacciones: mover mouse (repulsión), click (dispersar), botones para dispersar/ensamblar,
// sliders para resolución de puntos y tamaño de partícula.

export default function PandaParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef<number>(1);

  // UI
  const [gap, setGap] = useState<number>(5); // resolución de muestreo (px)
  const [dotSize, setDotSize] = useState<number>(2);

  // Estado interno en refs (evita re-render en animación)
  const particlesRef = useRef<Particle[]>([]);
  const targetsRef = useRef<Target[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, down: false });

  // Config
  const glyph = "🐼"; // Cambia por otro emoji o carácter si quieres otra figura

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      dprRef.current = Math.min(window.devicePixelRatio || 1, 2);
      const DPR = dprRef.current;
      const w = Math.floor(window.innerWidth * DPR);
      const h = Math.floor(window.innerHeight * DPR);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      computeTargetMap(ctx, w, h, gap, glyph);
      morphToTargets(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) * dprRef.current;
      mouseRef.current.y = (e.clientY - rect.top) * dprRef.current;
    };
    const handleMouseDown = () => {
      mouseRef.current.down = true;
      scatterAll();
    };
    const handleMouseUp = () => {
      mouseRef.current.down = false;
      morphToTargets();
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    resize();
    morphToTargets();
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcular targets cuando cambia el gap
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    computeTargetMap(ctx, canvas.width, canvas.height, gap, glyph);
    morphToTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gap]);

  // ====== Tipos ======
  type Particle = {
    x: number; y: number; vx: number; vy: number; tx: number; ty: number; color: string; speed: number;
  };
  type Target = { x: number; y: number; color: string };

  // ====== Utilidades ======
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const makeParticle = (W: number, H: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(W, H) * 0.7;
    const x = W / 2 + Math.cos(angle) * radius + rand(-40, 40);
    const y = H / 2 + Math.sin(angle) * radius + rand(-40, 40);
    return { x, y, vx: 0, vy: 0, tx: x, ty: y, color: "white", speed: rand(0.02, 0.06) };
  };

  const computeTargetMap = (
    _ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    step: number,
    glyphChar: string
  ) => {
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;

    const margin = 0.08;
    const size = Math.floor(Math.min(W, H) * (1 - margin));
    off.width = Math.max(1, size);
    off.height = Math.max(1, size);

    octx.clearRect(0, 0, off.width, off.height);
    const fontPx = Math.floor(size * 0.88);
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.font = `bold ${fontPx}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif`;
    octx.fillText(glyphChar, off.width / 2, off.height / 2);

    const { data, width, height } = octx.getImageData(0, 0, off.width, off.height);

    const newTargets: Target[] = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const a = data[idx + 3];
        if (a > 30) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const color = `rgb(${r},${g},${b})`;
          const tx = (W - width) / 2 + x;
          const ty = (H - height) / 2 + y;
          newTargets.push({ x: tx, y: ty, color });
        }
      }
    }

    targetsRef.current = newTargets;

    const deficit = targetsRef.current.length - particlesRef.current.length;
    if (deficit > 0) {
      for (let i = 0; i < deficit; i++) particlesRef.current.push(makeParticle(W, H));
    } else if (deficit < 0) {
      particlesRef.current.splice(targetsRef.current.length);
    }
  };

  const morphToTargets = (jump = false) => {
    const particles = particlesRef.current;
    const targets = targetsRef.current;
    const n = Math.min(particles.length, targets.length);
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const t = targets[i];
      p.tx = t.x; p.ty = t.y;
      p.color = t.color;
      p.speed = rand(0.018, 0.055);
      if (jump) { p.x = p.tx + rand(-40, 40); p.y = p.ty + rand(-40, 40); }
    }
  };

  const scatterAll = () => {
    const particles = particlesRef.current;
    const W = canvasRef.current?.width || 0;
    const H = canvasRef.current?.height || 0;
    for (const p of particles) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.max(W, H) * rand(0.5, 1.1);
      p.tx = W / 2 + Math.cos(ang) * rad;
      p.ty = H / 2 + Math.sin(ang) * rad;
      p.speed = rand(0.02, 0.07);
    }
  };

  const tick = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Fondo sutil de puntos
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 120; i++) {
      const px = (i * 9973) % W;
      const py = (i * 4337) % H;
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#94a3b8";
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const DPR = dprRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      p.vx += dx * p.speed;
      p.vy += dy * p.speed;

      const mx = p.x - mouse.x;
      const my = p.y - mouse.y;
      const dist2 = mx * mx + my * my;
      const repelRadius = 80 * DPR;
      if (dist2 < repelRadius * repelRadius) {
        const f = (repelRadius * repelRadius - dist2) / (repelRadius * repelRadius);
        p.vx += mx * (0.08 * f);
        p.vy += my * (0.08 * f);
      }

      p.vx *= 0.86;
      p.vy *= 0.86;
      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Destellos suaves
    ctx.globalAlpha = 0.07;
    const targets = targetsRef.current;
    for (let i = 0; i < 20; i++) {
      const k = ((Date.now() * 0.001 + i) % 1);
      const idx = Math.floor(k * (targets.length - 1));
      const t = targets[idx];
      if (t) {
        ctx.beginPath();
        ctx.arc(t.x, t.y, dotSize * 2.3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[radial-gradient(1200px_800px_at_70%_-10%,#0f172a_20%,#0b1225_60%,#070d1a_100%)] text-slate-200">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* UI flotante */}
      <div className="pointer-events-none fixed inset-0 flex items-end justify-between p-4">
        <div className="pointer-events-auto rounded-2xl border border-slate-400/20 bg-slate-900/60 p-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <label className="text-sm">Resolución
              <input
                type="range"
                min={3}
                max={10}
                value={gap}
                onChange={(e) => setGap(parseInt(e.target.value, 10))}
                className="ml-2 align-middle"
              />
            </label>
            <label className="text-sm">Tamaño
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={dotSize}
                onChange={(e) => setDotSize(parseFloat(e.target.value))}
                className="ml-2 align-middle"
              />
            </label>
            <button
              onClick={scatterAll}
              className="rounded-2xl border border-slate-400/30 bg-slate-800 px-3 py-2 text-sm hover:-translate-y-0.5 transition"
            >
              Dispersar
            </button>
            <button
              onClick={() => morphToTargets()}
              className="rounded-2xl border border-slate-400/30 bg-slate-800 px-3 py-2 text-sm hover:-translate-y-0.5 transition"
            >
              Formar Panda
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-300/80">Tip: cambia el emoji en <code>glyph</code> para generar otras figuras.</p>
        </div>
        <div className="pointer-events-auto rounded-2xl border border-slate-400/20 bg-slate-900/60 p-3 text-xs text-slate-300/80 backdrop-blur">
          Hecho con ❤️ para Luis · GPU‑friendly · ~10–30k partículas
        </div>
      </div>

      {/* Título */}
      <div className="pointer-events-none fixed left-3 top-3 text-xs font-semibold tracking-wide opacity-90">
        Panda de partículas · mueve el mouse · <span className="rounded-md border border-slate-400/30 bg-slate-700/60 px-1.5 py-0.5 font-mono">click</span> dispersa
      </div>
    </div>
  );
}

