import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Cpu, Disc, Zap, Terminal, Music, Info } from 'lucide-react';
import type { AudioEngine } from '../dsp/AudioEngine';
import type { AudioDiagnostics, Song } from '../types/synth';

interface DiagnosticsPanelProps {
  audioEngine: AudioEngine;
  currentSong: Song;
  isBrowsingDemo: boolean;
  onSelectSong: (index: number) => void;
  allSongs: Song[];
  selectedIndex: number;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  audioEngine,
  currentSong,
  isBrowsingDemo,
  onSelectSong,
  allSongs,
  selectedIndex
}) => {
  const [diagnostics, setDiagnostics] = useState<AudioDiagnostics>(audioEngine.getDiagnostics());
  const [activeVoices, setActiveVoices] = useState(audioEngine.getActiveVoicesInfo());
  const [activeTab, setActiveTab] = useState<'voices' | 'serial' | 'catalog'>('voices');

  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(audioEngine.getDiagnostics());
      setActiveVoices(audioEngine.getActiveVoicesInfo());
    }, 100);
    return () => clearInterval(interval);
  }, [audioEngine]);

  const budgetUs = (1000000.0 / 16000).toFixed(1); // 62.5 us
  const dspUsagePercent = Math.min(100, Math.round((diagnostics.dspAverageUs / 62.5) * 100));

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-sm" id="diagnostics-panel">
      {/* Top tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-tight text-white">SYSTEM TELEMETRY & HARDWARE MONITOR</h3>
        </div>

        <div className="flex gap-1 rounded-lg bg-neutral-950 p-1 border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('voices')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
              activeTab === 'voices' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Voices</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('serial')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
              activeTab === 'serial' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Serial Logs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
              activeTab === 'catalog' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>Song Book</span>
          </button>
        </div>
      </div>

      {/* Real-time DSP Metrics Grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-neutral-800 bg-black/50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>DSP LOAD / BUDGET</span>
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-white">
              {diagnostics.dspAverageUs.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">/ {budgetUs} µs</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-neutral-800">
            <div
              className={`h-full transition-all ${
                dspUsagePercent < 50 ? 'bg-emerald-500' : dspUsagePercent < 80 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(4, dspUsagePercent)}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-black/50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>RING BUFFER LEVEL</span>
            <Disc className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-white">
              {diagnostics.bufferLevel}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">/ 512 smp</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-neutral-800">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${(diagnostics.bufferLevel / 512) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-black/50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>CLIPPING & OVERLOAD</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-lg font-mono font-bold ${diagnostics.clippingCount > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
              {diagnostics.clippingCount}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              ({diagnostics.preventedOverloads} saved)
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 mt-1 block truncate">
            Soft-knee saturation: OK
          </span>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-black/50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>UNDERRUNS</span>
            <Zap className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-lg font-mono font-bold ${diagnostics.underrunEvents > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {diagnostics.underrunEvents}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              ({diagnostics.underrunSamples} samples)
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
            ISR Sample Rate: 16 kHz
          </span>
        </div>
      </div>

      {/* Tab 1: Real-time Voice Monitor */}
      {activeTab === 'voices' && (
        <div className="mt-4 space-y-3">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>ACTIVE 4-VOICE SYNTHESIS PIPELINE:</span>
            <span className="text-neutral-300">
              Song: <strong className="text-white">{currentSong.title}</strong> ({currentSong.bpm} BPM)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentSong.voices.map((voice, idx) => {
              const melState = activeVoices.melodic[idx];
              const isMelody = voice.type === 0;
              const isPerc = voice.type === 1;
              const percState = activeVoices.percussion[0];

              let stateLabel = 'IDLE';
              let levelVal = 0;
              let instName = voice.instrument?.name || 'Percussion Suite';

              if (isMelody && melState) {
                stateLabel = melState.state;
                levelVal = melState.level;
              } else if (isPerc && percState) {
                stateLabel = percState.active ? `HIT: ${percState.type}` : 'IDLE';
                levelVal = percState.active ? 1.0 : 0.0;
              }

              return (
                <div
                  key={idx}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800 text-[10px] font-mono font-bold text-cyan-400">
                        V{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-medium text-white truncate max-w-[150px]">
                        {instName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        stateLabel === 'ATTACK'
                          ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                          : stateLabel === 'DECAY' || stateLabel === 'SUSTAIN'
                          ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                          : stateLabel === 'RELEASE'
                          ? 'border-amber-500/60 bg-amber-500/20 text-amber-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      {stateLabel}
                    </span>
                  </div>

                  {/* Level bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[9px] font-mono text-neutral-400 mb-1">
                      <span>Envelope Level</span>
                      <span>{Math.round(levelVal * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-75"
                        style={{ width: `${Math.round(levelVal * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Instrument Parameters */}
                  {voice.instrument && (
                    <div className="mt-2 pt-2 border-t border-neutral-900 flex justify-between text-[9px] font-mono text-neutral-400">
                      <span>A:{voice.instrument.adsr.attack_ms}ms D:{voice.instrument.adsr.decay_ms}ms</span>
                      <span>S:{Math.round(voice.instrument.adsr.sustain_level * 100)}% R:{voice.instrument.adsr.release_ms}ms</span>
                      {voice.instrument.arpeg.active && (
                        <span className="text-amber-400 font-bold">ARP +{voice.instrument.arpeg.semitones}st</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Serial Monitor Terminal Logs */}
      {activeTab === 'serial' && (
        <div className="mt-3 rounded-lg border border-neutral-800 bg-black p-3 font-mono text-xs text-neutral-300">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[10px] text-neutral-400">
            <span>SERIAL MONITOR (115200 BAUD) — FIRMWARE DIAGNOSTIC REPORT</span>
            <span className="text-emerald-400">SYS_READY</span>
          </div>
          <pre className="mt-2 max-h-56 overflow-y-auto leading-relaxed text-[11px] text-neutral-300">
            {`========================================
        DSP PERFORMANCE REPORT
========================================
DSP calls:            ${diagnostics.dspAverageUs > 0 ? 'ACTIVE (PUMPING)' : 'IDLE'}
DSP average time:     ${diagnostics.dspAverageUs.toFixed(2)} µs
DSP worst time:       ${diagnostics.dspWorstUs.toFixed(2)} µs
Sample budget:        62.50 µs (@ 16.0 kHz)
ISR ticks:            ACTIVE (HARDWARE FspTimer)
========================================
             CLIPPING REPORT
========================================
Events:               ${diagnostics.clippingCount}
Prevented overloads:  ${diagnostics.preventedOverloads}
Limiter:              Soft-knee saturation (tanh)
Final AGC gain:       1.00000
========================================
        AUDIO ARTIFACT REPORT
========================================
Audio underrun samples: ${diagnostics.underrunSamples}
Audio underrun events:  ${diagnostics.underrunEvents}
Circular buffer size:   512 samples
Current buffer level:   ${diagnostics.bufferLevel} samples
Hardware DAC channel:   DAC12 CH0 (PIN A0)
PWM AM Carrier pin:     GPT7 / PIN 9 (${audioEngine.am_frequency_khz} kHz)
========================================`}
          </pre>
        </div>
      )}

      {/* Tab 3: Song Catalog & Quick Picker */}
      {activeTab === 'catalog' && (
        <div className="mt-3">
          <div className="text-[11px] font-mono text-neutral-400 mb-2 flex justify-between">
            <span>LOAD SONG INTO SEQUENCER ({isBrowsingDemo ? 'DEMO SHOWCASE' : 'SENTIMENT SONGS'}):</span>
            <span className="text-neutral-300">{allSongs.length} SONGS AVAILABLE</span>
          </div>
          <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pr-1">
            {allSongs.map((song, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectSong(i)}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-left text-xs font-mono transition-colors ${
                  selectedIndex === i
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-neutral-400 text-[10px]">
                    {(i + 1 < 10 ? '0' : '') + (i + 1)}
                  </span>
                  <span className="truncate font-medium">{song.title}</span>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0 ml-1">
                  {song.bpm} BPM
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
