import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../ui/cn';

interface PageStackProps {
  side: 'left' | 'right';
  count: number;
  total: number;
  onJump: (pageIndex: number) => void;
  currentPage: number;
}

export const PageStack = React.memo(function PageStack({ side, count, total, onJump, currentPage }: PageStackProps) {
  const [hoverInfo, setHoverInfo] = React.useState<{ pageNum: number; y: number; x: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Thickness scales with how many pages are on this side
  const visualThickness = count <= 0
    ? 0
    : Math.min(36, Math.max(2, (count / total) * 34 + 1));
  const interactiveWidth = Math.max(24, visualThickness + 14);

  // Draw the page stack — renk resimlerle eşleştirildi: açık krem/altın ton
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visualThickness < 1) return;

    const body = canvas.parentElement!;
    const w = Math.round(visualThickness);
    const h = Math.round(body.offsetHeight || 400);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);

    // ── 1. Base fill: resimdeki gibi açık altın/krem tonu
    ctx.fillStyle = '#d2cdb0';
    ctx.fillRect(0, 0, w, h);

    // ── 2. Sayfa yüzey dokusu — çok hafif yatay bantlar
    for (let y = 0; y < h; y += 3) {
      const alpha = y % 9 === 0 ? 0.025 : 0.01;
      ctx.fillStyle = `rgba(255,252,235,${alpha})`;
      ctx.fillRect(0, y, w, 1);
    }

    // ── 3. 3D derinlik gradyanı
    //    Sol stack: dış (sol) kenar koyu → kitaba bakan (sağ) kenar açık/parlak
    //    Sağ stack: kitaba bakan (sol) kenar açık → dış (sağ) kenar koyu
    const grad = ctx.createLinearGradient(
      side === 'left' ? 0 : w, 0,
      side === 'left' ? w : 0, 0
    );
    if (side === 'left') {
      grad.addColorStop(0,    'rgba(50,35,5,0.40)');   // dış kenar — en koyu
      grad.addColorStop(0.06, 'rgba(50,35,5,0.18)');
      grad.addColorStop(0.18, 'rgba(50,35,5,0.06)');
      grad.addColorStop(0.45, 'rgba(0,0,0,0.01)');
      grad.addColorStop(0.70, 'rgba(255,248,210,0.08)');
      grad.addColorStop(0.88, 'rgba(255,248,210,0.20)'); // kitaba yakın — parlak
      grad.addColorStop(1,    'rgba(255,248,210,0.06)');
    } else {
      grad.addColorStop(0,    'rgba(255,248,210,0.06)');
      grad.addColorStop(0.12, 'rgba(255,248,210,0.20)'); // kitaba yakın — parlak
      grad.addColorStop(0.30, 'rgba(255,248,210,0.08)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.01)');
      grad.addColorStop(0.82, 'rgba(50,35,5,0.06)');
      grad.addColorStop(0.94, 'rgba(50,35,5,0.18)');
      grad.addColorStop(1,    'rgba(50,35,5,0.40)');   // dış kenar — en koyu
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // ── 4. Sayfa ayraç çizgileri — ince dikey bantlar
    const lineCount = Math.min(55, Math.max(3, Math.floor(count / 11)));
    for (let i = 1; i <= lineCount; i++) {
      const x = (i / (lineCount + 1)) * w;
      let alpha: number;
      if (i % 5 === 0)      alpha = 0.11;
      else if (i % 2 === 0) alpha = 0.055;
      else                  alpha = 0.028;
      ctx.strokeStyle = `rgba(90,65,20,${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // ── 5. Üst kenar koyulaştırma
    const topG = ctx.createLinearGradient(0, 0, 0, 20);
    topG.addColorStop(0, 'rgba(40,28,5,0.28)');
    topG.addColorStop(0.6, 'rgba(40,28,5,0.06)');
    topG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topG;
    ctx.fillRect(0, 0, w, 20);

    // ── 6. Alt kenar koyulaştırma
    const botG = ctx.createLinearGradient(0, h - 20, 0, h);
    botG.addColorStop(0, 'rgba(0,0,0,0)');
    botG.addColorStop(0.4, 'rgba(40,28,5,0.06)');
    botG.addColorStop(1, 'rgba(40,28,5,0.28)');
    ctx.fillStyle = botG;
    ctx.fillRect(0, h - 20, w, 20);

  }, [count, total, side, visualThickness]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate mouse position relative to the actual visual stack area
    let visualX: number;
    if (side === 'left') {
      visualX = mouseX - (interactiveWidth - visualThickness);
    } else {
      visualX = mouseX;
    }

    const clampedX = Math.max(0, Math.min(visualThickness, visualX));
    const relX = clampedX / Math.max(1, visualThickness);

    let pageNum: number;
    if (side === 'left') {
      pageNum = Math.round(1 + relX * Math.max(0, currentPage - 1));
    } else {
      const startPage = currentPage + 3;
      pageNum = Math.round(startPage + relX * Math.max(0, total - startPage));
    }
    pageNum = Math.max(1, Math.min(total, pageNum));
    setHoverInfo({ pageNum, y: mouseY, x: clampedX });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hoverInfo) return;
    onJump(hoverInfo.pageNum - 1);
  };

  if (count <= 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverInfo(null)}
      onMouseDown={handleClick}
      className={cn(
        'absolute top-0 bottom-0 z-[500] cursor-pointer flex items-stretch pointer-events-auto',
        side === 'left'
          ? 'right-full mr-[-1px] justify-end'
          : 'left-full ml-[-1px] justify-start'
      )}
      style={{ width: `${interactiveWidth}px` }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: `${visualThickness}px`,
          border: hoverInfo
            ? '1.5px solid rgba(120,90,40,0.55)'
            : '1px solid rgba(90,65,20,0.13)',
          boxShadow: side === 'left'
            ? '-3px 0 10px rgba(30,20,5,0.16), -1px 0 3px rgba(30,20,5,0.10)'
            : '3px 0 10px rgba(30,20,5,0.16), 1px 0 3px rgba(30,20,5,0.10)',
          borderRadius: side === 'left' ? '6px 0 0 6px' : '0 6px 6px 0',
          transition: 'border-color 0.15s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: `${visualThickness}px`,
            height: '100%',
          }}
        />

        {hoverInfo && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${hoverInfo.x}px`,
              width: '1px',
              background: 'rgba(70,45,10,0.85)',
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {hoverInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-[600] pointer-events-none',
              'bg-zinc-900/90 text-white backdrop-blur-xl',
              'px-2.5 py-1 rounded-lg shadow-xl',
              'text-[11px] font-bold border border-white/10 whitespace-nowrap',
              side === 'left' ? 'right-full mr-3' : 'left-full ml-3'
            )}
            style={{ top: Math.max(0, hoverInfo.y - 14) }}
          >
            Sayfa {hoverInfo.pageNum}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});