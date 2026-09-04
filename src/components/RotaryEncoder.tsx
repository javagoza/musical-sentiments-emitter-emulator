import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RotateCcw } from 'lucide-react';

interface RotaryEncoderProps {
  onRotate: (clockwise: boolean) => void;
  onPressStart: () => void;
  onPressEnd: () => void;
  isPressed: boolean;
  disabled?: boolean;
}

export const RotaryEncoder: React.FC<RotaryEncoderProps> = ({
  onRotate,
  onPressStart,
  onPressEnd,
  isPressed,
  disabled = false
}) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdDuration, setHoldDuration] = useState<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const knobRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastAngleRef = useRef<number>(0);

  // Sound feedback for mechanical detent click
  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.015);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const handleStep = (clockwise: boolean) => {
    if (disabled) return;
    setRotationAngle(prev => prev + (clockwise ? 18 : -18));
    playClickSound();
    onRotate(clockwise);
  };

  // Drag rotation logic
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || (e.target as HTMLElement).dataset.action === 'button') return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = knobRef.current?.getBoundingClientRect();
    if (rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      lastAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    let diff = currentAngle - lastAngleRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // Threshold for 1 detent = 18 degrees
    if (Math.abs(diff) >= 16) {
      const clockwise = diff > 0;
      handleStep(clockwise);
      lastAngleRef.current = currentAngle;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel rotation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.deltaY < 0) {
      handleStep(true);
    } else if (e.deltaY > 0) {
      handleStep(false);
    }
  };

  // Press handlers with hold timer
  const handleButtonDown = () => {
    if (disabled) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    setHoldDuration(0);
    onPressStart();

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = window.setInterval(() => {
      setHoldDuration(Date.now() - startTimeRef.current);
    }, 50);
  };

  const handleButtonUp = () => {
    if (!isHolding) return;
    setIsHolding(false);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    onPressEnd();
    setHoldDuration(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  // Determine active action state based on hold ms
  // < 600ms: Short press (Play / Toggle Edit / Stop)
  // >= 600ms & < 1800ms: Long press (Demo Mode Toggle / Exit Settings)
  // >= 1800ms: Settings Press (Enter Settings Mode)
  let holdLabel = 'Short Click';
  let holdColor = 'text-neutral-400 border-neutral-600';
  if (holdDuration >= 1800) {
    holdLabel = '⚙️ SETTINGS (>1.8s)';
    holdColor = 'text-amber-400 border-amber-500 bg-amber-950/30';
  } else if (holdDuration >= 600) {
    holdLabel = '🔁 DEMO MODE (>0.6s)';
    holdColor = 'text-cyan-400 border-cyan-500 bg-cyan-950/30';
  }

  return (
    <div className="flex flex-col items-center select-none" id="rotary-encoder-container">
      {/* Knob assembly */}
      <div className="relative flex flex-col items-center">
        {/* Outer bezel ring with angle ticks */}
        <div
          ref={knobRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-neutral-800 bg-gradient-to-b from-neutral-700 via-neutral-900 to-black p-2 shadow-[0_10px_25px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing"
          title="Drag to rotate, scroll wheel, or click center button"
        >
          {/* Metallic knurled circular dial */}
          <div
            className="relative flex h-full w-full items-center justify-center rounded-full border border-neutral-600 bg-gradient-to-tr from-neutral-800 via-neutral-600 to-neutral-700 shadow-inner transition-transform duration-75"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          >
            {/* Knob notch indicator */}
            <div className="absolute top-2 h-4 w-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

            {/* Radial grip grooves */}
            <div className="absolute inset-2 rounded-full border border-dashed border-neutral-500/30 pointer-events-none" />
          </div>

          {/* Center Push Button (SW) */}
          <button
            id="encoder-push-button"
            data-action="button"
            onPointerDown={e => {
              e.stopPropagation();
              handleButtonDown();
            }}
            onPointerUp={e => {
              e.stopPropagation();
              handleButtonUp();
            }}
            onPointerLeave={handleButtonUp}
            className={`absolute flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all active:scale-95 shadow-lg ${
              isPressed || isHolding
                ? 'border-cyan-400 bg-cyan-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.6)]'
                : 'border-neutral-500 bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-300 hover:border-neutral-400 hover:text-white'
            }`}
          >
            <span className="text-[11px] font-mono font-bold tracking-tight">PUSH</span>
          </button>
        </div>

        {/* Quick Stepper Buttons for precise single detents */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleStep(false)}
            className="flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:bg-neutral-800 active:scale-95 transition-transform"
            title="Step Counter-Clockwise (Left)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
            <span>CCW</span>
          </button>

          <button
            type="button"
            onClick={() => handleStep(true)}
            className="flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:bg-neutral-800 active:scale-95 transition-transform"
            title="Step Clockwise (Right)"
          >
            <span>CW</span>
            <RotateCw className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        </div>

        {/* Hold status badge */}
        <div className="mt-2 h-6 flex items-center justify-center">
          {isHolding ? (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold animate-pulse ${holdColor}`}>
              {holdLabel} ({(holdDuration / 1000).toFixed(1)}s)
            </span>
          ) : (
            <span className="text-[10px] font-mono text-neutral-300">
              Turn: Navigate | Push: Action / Hold
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
