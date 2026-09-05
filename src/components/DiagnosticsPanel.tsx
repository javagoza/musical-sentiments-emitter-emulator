import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Cpu, Disc, Zap, Terminal, Music, Download, Trash2 } from 'lucide-react';
import type { AudioEngine } from '../dsp/AudioEngine';
import { type AudioDiagnostics, type Song, VoiceType } from '../types/synth';

interface DiagnosticsPanelProps {
  audioEngine: AudioEngine;
  currentSong: Song;
  isBrowsingDemo: boolean;
  onSelectSong: (index: number) => void;
  allSongs: Song[];
  selectedIndex: number;
  onExportSongMp3?: (song: Song) => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  audioEngine,
  currentSong,
  isBrowsingDemo,
  onSelectSong,
  allSongs,
  selectedIndex,
  onExportSongMp3
}) => {
  const [diagnostics, setDiagnostics] = useState<AudioDiagnostics>(audioEngine.getDiagnostics());
  const [activeVoices, setActiveVoices] = useState(audioEngine.getActiveVoicesInfo());
  const [activeTab, setActiveTab] = useState<'voices' | 'serial' | 'catalog'>('voices');
  const [serialLogCleared, setSerialLogCleared] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(audioEngine.getDiagnostics());
      setActiveVoices(audioEngine.getActiveVoicesInfo());
    }, 100);
    return () => clearInterval(interval);
  }, [audioEngine]);

  const budgetUs = (1000000.0 / 16000).toFixed(1); // 62.5 us
  const dspUsagePercent = Math.min(100, Math.round((diagnostics.dspAverageUs / 62.5) * 100));

  const melodicVoicesInSong = currentSong?.voices?.filter(v => v.type === VoiceType.MELODY) || [];
  const melodicVoices = (activeVoices?.melodic || []).map(mVoice => {
    const songVoice = melodicVoicesInSong[mVoice.index];
    return {
      index: mVoice.index,
      stateLabel: mVoice.state || 'IDLE',
      levelVal: Math.max(0, Math.min(1, mVoice.level ?? 0)),
      instrument: songVoice?.instrument
    };
  });
  const percussionVoices = activeVoices?.percussion || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 select-none" id="diagnostics-panel">
      {/* Top tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00979C]/30 bg-[#00979C]/10 text-[#00979C]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 font-mono">
              ARDUINO TELEMETRY & SERIAL MONITOR
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">Real-time DSP voices, ISR latency & memory registers</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('voices')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              activeTab === 'voices' ? 'bg-[#00979C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Voices</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('serial')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              activeTab === 'serial' ? 'bg-[#00979C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Serial (115200)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              activeTab === 'catalog' ? 'bg-[#00979C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>Song Book ({allSongs.length})</span>
          </button>
        </div>
      </div>

      {/* Real-time DSP Metrics Grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
            <span>DSP LOAD / BUDGET</span>
            <Cpu className="h-3.5 w-3.5 text-[#00979C]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-slate-800">
              {diagnostics.dspAverageUs.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">/ {budgetUs} µs</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-slate-200">
            <div
              className={`h-full transition-all ${
                dspUsagePercent < 50 ? 'bg-emerald-500' : dspUsagePercent < 80 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(4, dspUsagePercent)}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
            <span>WORST CASE ISR</span>
            <AlertTriangle className={`h-3.5 w-3.5 ${diagnostics.dspWorstUs > 62.5 ? 'text-red-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-slate-800">
              {diagnostics.dspWorstUs.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">µs peak</span>
          </div>
          <span className="mt-1 block text-[9px] font-mono text-slate-500">
            {diagnostics.dspWorstUs > 62.5 ? 'WARNING: ISR overrun risk' : 'Nominal ISR margin OK'}
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
            <span>CIRCULAR BUFFER</span>
            <Disc className="h-3.5 w-3.5 text-[#00979C]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-slate-800">
              {diagnostics.bufferLevel}
            </span>
            <span className="text-[10px] font-mono text-slate-500">/ 512 smp</span>
          </div>
          <span className="mt-1 block text-[9px] font-mono text-slate-500">
            Underruns: {diagnostics.underrunEvents} ({diagnostics.underrunSamples} smp)
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
            <span>SATURATION / AGC</span>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-slate-800">
              {diagnostics.clippingCount}
            </span>
            <span className="text-[10px] font-mono text-slate-500">clips</span>
          </div>
          <span className="mt-1 block text-[9px] font-mono text-slate-500">
            tanh() soft limiters: {diagnostics.preventedOverloads}
          </span>
        </div>
      </div>

      {/* Tab 1: 4 Polyphonic Voices Breakdown */}
      {activeTab === 'voices' && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-[11px] font-mono text-slate-500 font-semibold mb-2">
              POLYPHONIC MELODIC CHANNELS (REAL-TIME DSP SYNTHESIS):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {melodicVoices.map(voice => {
                const instName = voice.instrument?.name || 'ACTIVE CHANNEL';
                const stateLabel = voice.stateLabel;
                const levelVal = voice.levelVal;

                return (
                  <div
                    key={voice.index}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-700 block">
                          VOICE #{voice.index + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#00979C] truncate block max-w-[90px]">
                          {instName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          stateLabel === 'ATTACK'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : stateLabel === 'DECAY' || stateLabel === 'SUSTAIN'
                            ? 'border-[#00979C] bg-[#E8F5F5] text-[#008184]'
                            : stateLabel === 'RELEASE'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {stateLabel}
                      </span>
                    </div>

                    {/* Level bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                        <span>ADSR Level</span>
                        <span>{Math.round(levelVal * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-[#00979C] transition-all duration-75"
                          style={{ width: `${Math.round(levelVal * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Instrument Parameters */}
                    {voice.instrument ? (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[9px] font-mono text-slate-500">
                        <span>A:{voice.instrument.adsr.attack_ms}ms D:{voice.instrument.adsr.decay_ms}ms</span>
                        <span>S:{Math.round(voice.instrument.adsr.sustain_level * 100)}% R:{voice.instrument.adsr.release_ms}ms</span>
                        {voice.instrument.arpeg.active && (
                          <span className="text-amber-600 font-bold">ARP +{voice.instrument.arpeg.semitones}st</span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[9px] font-mono text-slate-400">
                        Wavetable DSP Engine
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Percussion channels */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[11px] font-mono text-slate-500 font-semibold mb-1.5">
              ANALOG PERCUSSION GENERATORS:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {percussionVoices.map(pVoice => (
                <div
                  key={pVoice.index}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-700">
                      PERC #{pVoice.index + 1}:
                    </span>
                    <span className="text-xs font-mono font-bold text-[#00979C]">
                      {pVoice.type === 0 ? 'IDLE' : `CHANNEL #${pVoice.type}`}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      pVoice.active
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pVoice.active ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Serial Monitor Terminal Logs (Arduino IDE 2.x Light Aesthetic) */}
      {activeTab === 'serial' && (
        <div className="mt-3 rounded-lg border border-slate-300 bg-slate-900 p-3 font-mono text-xs text-emerald-400 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ARDUINO SERIAL MONITOR — COM4 (115200 BAUD)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSerialLogCleared(true)}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white"
                title="Clear Output"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
              <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-600/40">
                FIRMWARE_OK
              </span>
            </div>
          </div>
          <pre className="mt-2 max-h-56 overflow-y-auto leading-relaxed text-[11px] text-slate-200">
            {serialLogCleared ? 'Serial log buffer cleared. Waiting for ISR events...' : `[0.000s] Arduino Sound Messenger Firmware v2.4 booted.
[0.002s] Renesas RA4M1 48MHz Cortex-M4 initialized.
[0.005s] DAC12 hardware channel active on Pin A0 (DAC_OUTPUT).
[0.008s] Timer GPT7 configured for AM PWM RF carrier on Pin 9 (${audioEngine.am_frequency_khz} kHz).
[0.012s] Audio sampling timer ISR locked at 16,000 Hz (T = 62.50 µs).
[0.015s] Wavetables cached: SINE, SQUARE, SAW, TRIANGLE, NOISE (16-bit).
======================================================
              DSP RUNTIME PERFORMANCE REPORT
======================================================
DSP execution state:     ${diagnostics.dspAverageUs > 0 ? 'ACTIVE (PUMPING ISR)' : 'STANDBY'}
Average ISR cycle time:  ${diagnostics.dspAverageUs.toFixed(2)} µs
Worst ISR cycle peak:    ${diagnostics.dspWorstUs.toFixed(2)} µs
Budget per sample:       62.50 µs (@ 16.0 kHz sample rate)
Circular ring buffer:    ${diagnostics.bufferLevel} / 512 samples
Clipping limiter hits:   ${diagnostics.clippingCount} events
Underrun dropouts:       ${diagnostics.underrunEvents} (${diagnostics.underrunSamples} samples)
LAME MP3 Engine:         Online (44.1 kHz, 192 kbps CBR Export)
======================================================`}
          </pre>
        </div>
      )}

      {/* Tab 3: Song Catalog & Quick Picker with MP3 Download Buttons */}
      {activeTab === 'catalog' && (
        <div className="mt-3">
          <div className="text-[11px] font-mono text-slate-600 mb-2 flex items-center justify-between font-medium">
            <span>LOAD SONG INTO SEQUENCER ({isBrowsingDemo ? 'DEMO SHOWCASE' : 'SENTIMENT SONGS'}):</span>
            <span className="text-[#00979C] font-semibold">{allSongs.length} SONGS AVAILABLE • CLICK ⬇ MP3 TO EXPORT</span>
          </div>
          <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-1">
            {allSongs.map((song, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs font-mono transition-all ${
                  selectedIndex === i
                    ? 'border-[#00979C] bg-[#E8F5F5] text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSong(i)}
                  className="flex items-center gap-2 truncate flex-1 text-left"
                >
                  <span className="text-[#00979C] font-bold text-[10px]">
                    {(i + 1 < 10 ? '0' : '') + (i + 1)}
                  </span>
                  <div className="truncate">
                    <span className="truncate font-semibold block">{song.title}</span>
                    <span className="text-[10px] text-slate-400 block">{song.bpm} BPM</span>
                  </div>
                </button>

                {onExportSongMp3 && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onExportSongMp3(song);
                    }}
                    className="ml-2 flex items-center gap-1 rounded bg-[#00979C]/10 hover:bg-[#00979C] text-[#00979C] hover:text-white px-2 py-1 text-[10px] font-bold border border-[#00979C]/30 transition-colors shadow-xs"
                    title={`Export "${song.title}" as MP3 audio`}
                  >
                    <Download className="h-3 w-3" />
                    <span>MP3</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
