import React, { useState } from 'react';
import { Radio, Volume2, Waves, Sliders } from 'lucide-react';
import { OutputMode } from '../types/synth';

interface AmRadioReceiverProps {
  transmitterFreqKhz: number;
  outputMode: OutputMode;
  radioTunedKhz: number;
  onTunedFreqChange: (freq: number) => void;
  noiseAmount: number;
  onNoiseAmountChange: (amount: number) => void;
  isPlaying: boolean;
}

export const AmRadioReceiver: React.FC<AmRadioReceiverProps> = ({
  transmitterFreqKhz,
  outputMode,
  radioTunedKhz,
  onTunedFreqChange,
  noiseAmount,
  onNoiseAmountChange,
  isPlaying
}) => {
  const isRfTransmitting = (outputMode === OutputMode.RF_ONLY || outputMode === OutputMode.DAC_AND_RF) && isPlaying;
  const freqDelta = Math.abs(radioTunedKhz - transmitterFreqKhz);
  const isTunedIn = isRfTransmitting && freqDelta <= 9;
  
  // Calculate Signal Strength (S-Meter: 0 to 9 +30dB)
  let signalStrength = 0;
  if (isRfTransmitting) {
    signalStrength = Math.max(0, Math.min(10, Math.round(10 * Math.exp(-Math.pow(freqDelta / 9, 2)))));
  }

  const handleTuneStep = (delta: number) => {
    const next = Math.max(531, Math.min(1602, radioTunedKhz + delta));
    onTunedFreqChange(next);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-sm" id="am-radio-receiver-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            isTunedIn ? 'border-amber-500 bg-amber-500/20 text-amber-400 animate-pulse' : 'border-neutral-700 bg-neutral-800 text-neutral-400'
          }`}>
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>AM / MW RADIO RECEIVER</span>
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
                531 - 1602 kHz
              </span>
            </h3>
            <p className="text-xs text-neutral-400">Demodulating PWM-modulated RF carrier</p>
          </div>
        </div>

        {/* Sync with TX button */}
        <button
          type="button"
          onClick={() => onTunedFreqChange(transmitterFreqKhz)}
          className="flex items-center gap-1.5 rounded-lg border border-amber-600/40 bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
          title="Align receiver frequency with the Sound Messenger transmitter"
        >
          <Waves className="h-3.5 w-3.5" />
          <span>SYNC TX ({transmitterFreqKhz} kHz)</span>
        </button>
      </div>

      {/* Tuner scale & frequency readout */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Frequency Digital Readout */}
        <div className="rounded-lg border border-neutral-800 bg-black/60 p-3 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">TUNED FREQUENCY</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-amber-400">
              {radioTunedKhz}
            </span>
            <span className="text-xs font-mono text-amber-400/80">kHz</span>
          </div>
          <span className="mt-1 text-[10px] font-mono text-neutral-300">
            Carrier: {transmitterFreqKhz} kHz {isTunedIn ? '(LOCKED)' : '(OFF-TUNE)'}
          </span>
        </div>

        {/* S-Meter & Signal Indicators */}
        <div className="rounded-lg border border-neutral-800 bg-black/60 p-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
            <span>S-METER (SIGNAL STRENGTH)</span>
            <span className="font-bold text-amber-400">{signalStrength > 0 ? `S${signalStrength}` : 'NO CARRIER'}</span>
          </div>
          <div className="flex h-3 gap-1 rounded bg-neutral-900 p-0.5 border border-neutral-800">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors ${
                  i < signalStrength
                    ? i < 6 ? 'bg-emerald-500' : i < 8 ? 'bg-amber-400' : 'bg-red-500'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>RF Carrier: {isRfTransmitting ? 'TRANSMITTING' : 'IDLE / OFF'}</span>
            <span className={isTunedIn ? 'text-emerald-400' : 'text-neutral-400'}>
              {isTunedIn ? 'AUDIO RECOVERED' : freqDelta < 15 ? 'HETERODYNE WHISTLE' : 'STATIC'}
            </span>
          </div>
        </div>

        {/* Tuning controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTuneStep(-9)}
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-1.5 text-xs font-mono font-semibold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all"
            >
              -9 kHz
            </button>
            <button
              type="button"
              onClick={() => handleTuneStep(-1)}
              className="w-10 rounded-lg border border-neutral-700 bg-neutral-800 py-1.5 text-xs font-mono font-semibold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => handleTuneStep(1)}
              className="w-10 rounded-lg border border-neutral-700 bg-neutral-800 py-1.5 text-xs font-mono font-semibold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleTuneStep(9)}
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-1.5 text-xs font-mono font-semibold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all"
            >
              +9 kHz
            </button>
          </div>

          {/* Atmospheric Static Slider */}
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-black/40 px-2.5 py-1.5">
            <Sliders className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-[10px] font-mono text-neutral-300">Static Noise:</span>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={noiseAmount}
              onChange={e => onNoiseAmountChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-neutral-300 w-8 text-right">
              {Math.round(noiseAmount * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Analog Frequency Dial Visualizer */}
      <div className="mt-4 relative h-8 rounded-lg border border-neutral-800 bg-black/80 overflow-hidden px-4 flex items-center">
        {/* Scale tick marks */}
        <div className="absolute inset-0 flex justify-between items-end pb-1 px-4 pointer-events-none opacity-60">
          {[531, 600, 700, 800, 900, 1000, 1200, 1400, 1602].map(f => (
            <div key={f} className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-neutral-400">{f}</span>
              <div className="h-2 w-0.5 bg-neutral-600" />
            </div>
          ))}
        </div>

        {/* Carrier TX marker */}
        {isRfTransmitting && (
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-cyan-400/60 transition-all pointer-events-none z-10"
            style={{
              left: `${Math.max(2, Math.min(98, ((transmitterFreqKhz - 531) / (1602 - 531)) * 100))}%`
            }}
            title={`Transmitter Carrier: ${transmitterFreqKhz} kHz`}
          />
        )}

        {/* Receiver needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)] transition-all pointer-events-none z-20"
          style={{
            left: `${Math.max(2, Math.min(98, ((radioTunedKhz - 531) / (1602 - 531)) * 100))}%`
          }}
        />
      </div>
    </div>
  );
};
