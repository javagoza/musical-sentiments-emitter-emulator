import React from 'react';
import { Radio, Waves, Sliders, Volume2 } from 'lucide-react';
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 select-none" id="am-radio-receiver-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
            isTunedIn
              ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-xs'
              : 'border-[#00979C]/30 bg-[#00979C]/10 text-[#00979C]'
          }`}>
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2 font-mono">
              <span>ARDUINO AM / MW RADIO DEMODULATOR</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-[#00979C] font-semibold border border-slate-200">
                531 - 1602 kHz
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-mono">Simulating Pin 9 GPT7 PWM carrier envelope detection</p>
          </div>
        </div>

        {/* Sync with TX button */}
        <button
          type="button"
          onClick={() => onTunedFreqChange(transmitterFreqKhz)}
          className="flex items-center gap-1.5 rounded-lg border border-[#00979C]/40 bg-[#E8F5F5] px-2.5 py-1 text-xs font-mono font-bold text-[#008184] hover:bg-[#00979C] hover:text-white transition-all shadow-xs"
          title="Align receiver frequency with the Sound Messenger transmitter"
        >
          <Waves className="h-3.5 w-3.5" />
          <span>SYNC TX ({transmitterFreqKhz} kHz)</span>
        </button>
      </div>

      {/* Tuner scale & frequency readout */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Frequency Digital Readout */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">TUNED FREQUENCY</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-slate-900">
              {radioTunedKhz}
            </span>
            <span className="text-xs font-mono font-bold text-[#00979C]">kHz</span>
          </div>
          <span className="mt-1 text-[10px] font-mono text-slate-500">
            Carrier: {transmitterFreqKhz} kHz {isTunedIn ? '(LOCKED)' : '(OFF-TUNE)'}
          </span>
        </div>

        {/* S-Meter & Signal Indicators */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1 font-semibold">
            <span>S-METER (CARRIER STRENGTH)</span>
            <span className="font-bold text-[#00979C]">{signalStrength > 0 ? `S${signalStrength}` : 'NO CARRIER'}</span>
          </div>
          <div className="flex h-3 gap-1 rounded bg-slate-200 p-0.5 border border-slate-300">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors ${
                  i < signalStrength
                    ? i < 6 ? 'bg-emerald-500' : i < 8 ? 'bg-amber-400' : 'bg-red-500'
                    : 'bg-slate-300/60'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>RF Carrier: <strong className="text-slate-700">{isRfTransmitting ? 'TRANSMITTING' : 'IDLE / OFF'}</strong></span>
            <span className={isTunedIn ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
              {isTunedIn ? 'AUDIO RECOVERED' : freqDelta < 15 ? 'HETERODYNE WHISTLE' : 'ATMOSPHERIC STATIC'}
            </span>
          </div>
        </div>

        {/* Tuning controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTuneStep(-9)}
              className="flex-1 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-mono font-semibold text-slate-700 hover:border-[#00979C] hover:text-[#00979C] hover:bg-[#F2F8F8] active:scale-95 shadow-xs transition-all"
            >
              -9 kHz
            </button>
            <button
              type="button"
              onClick={() => handleTuneStep(-1)}
              className="w-10 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-mono font-semibold text-slate-700 hover:border-[#00979C] hover:text-[#00979C] hover:bg-[#F2F8F8] active:scale-95 shadow-xs transition-all"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => handleTuneStep(1)}
              className="w-10 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-mono font-semibold text-slate-700 hover:border-[#00979C] hover:text-[#00979C] hover:bg-[#F2F8F8] active:scale-95 shadow-xs transition-all"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleTuneStep(9)}
              className="flex-1 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-mono font-semibold text-slate-700 hover:border-[#00979C] hover:text-[#00979C] hover:bg-[#F2F8F8] active:scale-95 shadow-xs transition-all"
            >
              +9 kHz
            </button>
          </div>

          {/* Atmospheric Static Slider */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 shadow-xs">
            <Sliders className="h-3.5 w-3.5 text-[#00979C]" />
            <span className="text-[10px] font-mono text-slate-600 font-medium">Static Noise:</span>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={noiseAmount}
              onChange={e => onNoiseAmountChange(parseFloat(e.target.value))}
              className="flex-1 accent-[#00979C] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-700 font-bold w-8 text-right">
              {Math.round(noiseAmount * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Analog Frequency Dial Visualizer (Arduino Style) */}
      <div className="mt-4 relative h-8 rounded-lg border border-slate-300 bg-slate-100 overflow-hidden px-4 flex items-center shadow-inner">
        {/* Scale tick marks */}
        <div className="absolute inset-0 flex justify-between items-end pb-1 px-4 pointer-events-none opacity-80">
          {[531, 600, 700, 800, 900, 1000, 1200, 1400, 1602].map(f => (
            <div key={f} className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-500 font-bold">{f}</span>
              <div className="h-2 w-0.5 bg-slate-400" />
            </div>
          ))}
        </div>

        {/* Carrier TX marker in Arduino Teal */}
        {isRfTransmitting && (
          <div
            className="absolute top-0 bottom-0 w-2 bg-[#00979C] transition-all pointer-events-none z-10 opacity-70"
            style={{
              left: `${Math.max(2, Math.min(98, ((transmitterFreqKhz - 531) / (1602 - 531)) * 100))}%`
            }}
            title={`Transmitter Carrier: ${transmitterFreqKhz} kHz`}
          />
        )}

        {/* Receiver needle in Amber/Orange */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#E47128] shadow-[0_0_8px_rgba(228,113,40,0.9)] transition-all pointer-events-none z-20"
          style={{
            left: `${Math.max(2, Math.min(98, ((radioTunedKhz - 531) / (1602 - 531)) * 100))}%`
          }}
        />
      </div>
    </div>
  );
};
