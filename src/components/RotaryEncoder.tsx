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
  let holdColor = 'text-slate-600 border-slate-300 bg-slate-50';
  if (holdDuration >= 1800) {
    holdLabel = '⚙️ SETTINGS (>1.8s)';
    holdColor = 'text-[#D97706] border-[#D97706] bg-amber-50 shadow-sm';
  } else if (holdDuration >= 600) {
    holdLabel = '🔁 DEMO MODE (>0.6s)';
    holdColor = 'text-[#00979C] border-[#00979C] bg-[#E8F5F5] shadow-sm';
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
          className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-300 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 p-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)] cursor-grab active:cursor-grabbing ring-1 ring-black/5"
          title="Drag to rotate, scroll wheel, or click center button"
        >
          {/* Metallic knurled circular dial */}
          <div
            className="relative flex h-full w-full items-center justify-center rounded-full border border-slate-300 bg-gradient-to-tr from-slate-100 via-white to-slate-200 shadow-inner transition-transform duration-75"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          >
            {/* Knob notch indicator in Arduino Teal */}
            <div className="absolute top-2 h-4 w-1.5 rounded-full bg-[#00979C] shadow-[0_0_6px_rgba(0,151,156,0.7)]" />

            {/* Radial grip grooves */}
            <div className="absolute inset-2 rounded-full border border-dashed border-slate-300/80 pointer-events-none" />
          </div>

          {/* Center Push Button (SW) - Arduino Style */}
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
            className={`absolute flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all active:scale-95 shadow-md ${
              isPressed || isHolding
                ? 'border-[#00979C] bg-[#00979C] text-white shadow-[0_0_12px_rgba(0,151,156,0.6)]'
                : 'border-slate-300 bg-white text-slate-700 hover:border-[#00979C] hover:text-[#00979C]'
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
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono font-medium text-slate-700 hover:border-[#00979C] hover:text-[#00979C] hover:bg-[#F2F8F8] active:scale-95 shadow-xs transition-all"
            title="Step Counter-Clockwise (Left)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>CCW</span>
          </button>

          <button
            type="button"
            onClick={() => handleStep(true)}
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono font-medium text-slate-700 hover:border-[#00979C] hover:text-[#00979C] hover:bg-[#F2F8F8] active:scale-95 shadow-xs transition-all"
            title="Step Clockwise (Right)"
          >
            <span>CW</span>
            <RotateCw className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Hold status badge */}
        <div className="mt-2 h-6 flex items-center justify-center">
          {isHolding ? (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold animate-pulse ${holdColor}`}>
              {holdLabel} ({(holdDuration / 1000).toFixed(1)}s)
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 font-medium">
              Turn: Navigate | Push: Action / Hold
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
