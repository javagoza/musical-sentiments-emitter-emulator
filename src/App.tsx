import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Settings,
  Radio,
  Sliders,
  RotateCw,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  Headphones
} from 'lucide-react';
import {
  UIState,
  SettingItem,
  OutputMode,
  type Song
} from './types/synth';
import { PLAYER_SONGS, DEMO_SONGS } from './data/songs';
import { AudioEngine } from './dsp/AudioEngine';
import { volumeLevelToGainPercent } from './dsp/wavetables';
import { OledDisplay, type OledTheme } from './components/OledDisplay';
import { RotaryEncoder } from './components/RotaryEncoder';
import { AmRadioReceiver } from './components/AmRadioReceiver';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';

export default function App() {
  const engineRef = useRef<AudioEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new AudioEngine();
  }
  const engine = engineRef.current;

  // System UI State
  const [uiState, setUiState] = useState<UIState>(UIState.UI_MENU_SELECTION);
  const [isBrowsingDemo, setIsBrowsingDemo] = useState<boolean>(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number>(0);
  const [activeSongIndex, setActiveSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Settings Parameters
  const [masterVolumeLevel, setMasterVolumeLevel] = useState<number>(20);
  const [melodyVolumeLevel, setMelodyVolumeLevel] = useState<number>(20);
  const [percussionVolumeLevel, setPercussionVolumeLevel] = useState<number>(20);
  const [amFrequencyKhz, setAmFrequencyKhz] = useState<number>(594);
  const [outputMode, setOutputMode] = useState<OutputMode>(OutputMode.DAC_AND_RF);
  const [settingsSelectedItem, setSettingsSelectedItem] = useState<SettingItem>(SettingItem.MASTER_VOLUME);
  const [isSettingsEditing, setIsSettingsEditing] = useState<boolean>(false);

  // Receiver Simulation State
  const [radioTunedKhz, setRadioTunedKhz] = useState<number>(594);
  const [radioNoiseAmount, setRadioNoiseAmount] = useState<number>(0.04);

  // Appearance
  const [oledTheme, setOledTheme] = useState<OledTheme>('cyan');
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Inactivity timer ref
  const settingsLastActivityRef = useRef<number>(Date.now());
  const buttonPressStartRef = useRef<number>(0);
  const buttonHoldFiredRef = useRef<boolean>(false);
  const [isEncoderPressed, setIsEncoderPressed] = useState<boolean>(false);

  const currentSongList: Song[] = isBrowsingDemo ? DEMO_SONGS : PLAYER_SONGS;
  const currentSong = currentSongList[selectedSongIndex] || currentSongList[0];

  // Sync engine levels on change
  useEffect(() => {
    engine.output_volume = volumeLevelToGainPercent(masterVolumeLevel, 20) * 0.01;
    engine.melodic_level = volumeLevelToGainPercent(melodyVolumeLevel, 20) * 0.01;
    engine.percussion_level = volumeLevelToGainPercent(percussionVolumeLevel, 20) * 0.01;
    engine.output_mode = outputMode;
    engine.am_frequency_khz = amFrequencyKhz;
    engine.radio_tuned_khz = radioTunedKhz;
    engine.radio_noise_amount = radioNoiseAmount;
  }, [
    masterVolumeLevel,
    melodyVolumeLevel,
    percussionVolumeLevel,
    outputMode,
    amFrequencyKhz,
    radioTunedKhz,
    radioNoiseAmount,
    engine
  ]);

  // Handle song completion from engine
  useEffect(() => {
    engine.onSongFinished = () => {
      setIsPlaying(false);
      setUiState(UIState.UI_MENU_SELECTION);
    };
  }, [engine]);

  // Settings inactivity timeout (5000 ms)
  useEffect(() => {
    if (uiState !== UIState.UI_SETTINGS) return;
    const interval = setInterval(() => {
      if (Date.now() - settingsLastActivityRef.current >= 5000) {
        setIsSettingsEditing(false);
        setUiState(UIState.UI_MENU_SELECTION);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [uiState]);

  // Start / Stop Playback
  const handleStartPlayback = useCallback((index: number = selectedSongIndex) => {
    setAudioStarted(true);
    engine.initAudio();
    setActiveSongIndex(index);
    engine.startSong(currentSongList, index);
    setIsPlaying(true);
    setUiState(UIState.UI_PLAYING);
  }, [currentSongList, engine, selectedSongIndex]);

  const handleStopPlayback = useCallback(() => {
    engine.stopSong();
    setIsPlaying(false);
    setUiState(UIState.UI_MENU_SELECTION);
  }, [engine]);

  // Toggle Song List (Normal Songs <-> Showcase Demos)
  const handleToggleSongList = useCallback(() => {
    setIsBrowsingDemo(prev => {
      const next = !prev;
      setSelectedSongIndex(0);
      return next;
    });
  }, []);

  // Enter / Exit Settings
  const handleEnterSettings = useCallback(() => {
    settingsLastActivityRef.current = Date.now();
    setUiState(UIState.UI_SETTINGS);
    setSettingsSelectedItem(SettingItem.MELODY_VOLUME);
    setIsSettingsEditing(false);
  }, []);

  const handleExitSettings = useCallback(() => {
    setIsSettingsEditing(false);
    setUiState(UIState.UI_MENU_SELECTION);
  }, []);

  // Rotary rotation handler
  const handleRotate = useCallback((clockwise: boolean) => {
    if (uiState === UIState.UI_PLAYING) {
      // Adjust playback oscilloscope zoom (-9 to +9)
      engine.adjustZoom(clockwise);
    } else if (uiState === UIState.UI_SETTINGS) {
      settingsLastActivityRef.current = Date.now();
      if (isSettingsEditing) {
        // Adjust selected setting value
        switch (settingsSelectedItem) {
          case SettingItem.MELODY_VOLUME:
            setMelodyVolumeLevel(prev => Math.max(0, Math.min(20, prev + (clockwise ? 1 : -1))));
            break;
          case SettingItem.PERCUSSION_VOLUME:
            setPercussionVolumeLevel(prev => Math.max(0, Math.min(20, prev + (clockwise ? 1 : -1))));
            break;
          case SettingItem.MASTER_VOLUME:
            setMasterVolumeLevel(prev => Math.max(0, Math.min(20, prev + (clockwise ? 1 : -1))));
            break;
          case SettingItem.AM_FREQUENCY:
            setAmFrequencyKhz(prev => {
              const next = prev + (clockwise ? 9 : -9);
              return Math.max(531, Math.min(1602, next));
            });
            break;
          case SettingItem.OUTPUT_SELECTION:
            setOutputMode(prev => {
              const count = 4;
              return ((prev + (clockwise ? 1 : -1) + count) % count) as OutputMode;
            });
            break;
        }
      } else {
        // Navigate between items
        setSettingsSelectedItem(prev => {
          const count = SettingItem.SETTINGS_ITEM_COUNT;
          return ((prev + (clockwise ? 1 : -1) + count) % count) as SettingItem;
        });
      }
    } else {
      // Menu selection: next / previous song
      setSelectedSongIndex(prev => {
        const count = currentSongList.length;
        return (prev + (clockwise ? 1 : -1) + count) % count;
      });
    }
  }, [
    uiState,
    isSettingsEditing,
    settingsSelectedItem,
    currentSongList.length,
    engine
  ]);

  // Button press & hold handler
  const handlePressStart = useCallback(() => {
    setIsEncoderPressed(true);
    buttonPressStartRef.current = Date.now();
    buttonHoldFiredRef.current = false;
  }, []);

  const handlePressEnd = useCallback(() => {
    setIsEncoderPressed(false);
    const heldMs = Date.now() - buttonPressStartRef.current;

    if (uiState === UIState.UI_PLAYING) {
      // In playback, single click triggers immediate emergency stop!
      handleStopPlayback();
      return;
    }

    if (uiState === UIState.UI_SETTINGS) {
      settingsLastActivityRef.current = Date.now();
      if (heldMs >= 600) {
        // Long press in settings exits to menu
        handleExitSettings();
      } else {
        // Short press toggles edit vs browse mode
        setIsSettingsEditing(prev => !prev);
      }
      return;
    }

    // In UI_MENU_SELECTION:
    if (heldMs >= 1800) {
      // Settings long-hold (> 1.8s)
      handleEnterSettings();
    } else if (heldMs >= 600) {
      // Toggle demo list hold (> 0.6s)
      handleToggleSongList();
    } else {
      // Short click starts playback!
      handleStartPlayback();
    }
  }, [
    uiState,
    handleStopPlayback,
    handleExitSettings,
    handleEnterSettings,
    handleToggleSongList,
    handleStartPlayback
  ]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing input if focused on an input element
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleRotate(true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleRotate(false);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (uiState === UIState.UI_PLAYING) {
          handleStopPlayback();
        } else if (uiState === UIState.UI_SETTINGS) {
          setIsSettingsEditing(prev => !prev);
        } else {
          handleStartPlayback();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (uiState === UIState.UI_PLAYING) {
          handleStopPlayback();
        } else if (uiState === UIState.UI_SETTINGS) {
          handleExitSettings();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotate, handleStartPlayback, handleStopPlayback, handleExitSettings, uiState]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Top Application Header */}
      <header className="w-full max-w-6xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Radio className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              SOUND MESSENGER <span className="text-cyan-400 font-semibold text-sm">AM / PWM SYNTH</span>
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            4-Voice Polyphonic Synthesizer, Analog Percussion & AM RF Modulator Hardware Emulator
          </p>
        </div>

        {/* Audio Start / Power Prompt */}
        <div className="flex items-center gap-3">
          {!audioStarted && (
            <button
              type="button"
              onClick={() => {
                engine.initAudio();
                setAudioStarted(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black px-3.5 py-1.5 text-xs font-mono font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all animate-pulse"
            >
              <Headphones className="h-4 w-4" />
              <span>ENABLE AUDIO ENGINE</span>
            </button>
          )}

          {/* OLED Color Theme Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-1">
            {(['cyan', 'amber', 'green', 'white'] as OledTheme[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setOledTheme(t)}
                className={`h-5 w-5 rounded-full border transition-transform ${
                  oledTheme === t ? 'scale-110 ring-2 ring-white/50' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    t === 'cyan' ? '#38bdf8' : t === 'amber' ? '#fbbf24' : t === 'green' ? '#4ade80' : '#f8fafc'
                }}
                title={`OLED Color: ${t.toUpperCase()}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowHelp(prev => !prev)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:text-white transition-colors"
            title="Hardware controls & keyboard guide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Interactive Controls Help Drawer */}
      {showHelp && (
        <div className="w-full max-w-6xl mb-6 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs font-mono text-cyan-200">
          <div className="flex items-center justify-between font-bold text-white mb-2">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              HARDWARE EMULATOR OPERATION GUIDE
            </span>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
            <div>
              <strong className="text-white block mb-1">Rotary Encoder (Turn):</strong>
              • Menu: Browse songs (Clockwise = Next, Counter-Clockwise = Previous)<br />
              • While Playing: Zoom live oscilloscope (-9 to +9 steps)<br />
              • In Settings: Navigate settings or adjust values (Volume, Frequency, Output Mode)
            </div>
            <div>
              <strong className="text-white block mb-1">Push Button (Short vs Hold):</strong>
              • Short Click: Play song (in menu), toggle edit (in settings), or panic STOP during playback<br />
              • Hold 0.6s - 1.8s: Toggle between 20 Sentiment songs and 29 Demo feature songs<br />
              • Hold &gt; 1.8s: Enter hardware Settings Menu (or hold 0.6s in settings to exit)
            </div>
            <div>
              <strong className="text-white block mb-1">Keyboard Shortcuts:</strong>
              • Left / Right Arrows: Rotate encoder knob<br />
              • Space / Enter: Push encoder button<br />
              • Escape: Stop playback or exit settings<br />
              • Mouse wheel over knob also rotates!
            </div>
          </div>
        </div>
      )}

      {/* Main Hardware Chassis */}
      <main className="w-full max-w-6xl flex flex-col gap-6">
        {/* Physical Enclosure Case */}
        <div className="relative rounded-2xl border-4 border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          {/* Top Chassis Screws & Branding */}
          <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-neutral-500 shadow-inner" />
              <span>ARDUINO / RA4M1 DSP EMBEDDED ENGINE</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-300">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
                <span>PWR / DSP ACTIVE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${outputMode !== OutputMode.MUTE && isPlaying ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-neutral-600'}`} />
                <span>RF CARRIER (PIN 9)</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-neutral-500 shadow-inner" />
            </div>
          </div>

          {/* Front Panel Grid: OLED Screen on Left, Rotary Assembly on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 128x32 OLED Display Section (Columns 1 to 7) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[512px]">
                <OledDisplay
                  uiState={uiState}
                  currentSongList={currentSongList}
                  selectedSongIndex={selectedSongIndex}
                  isBrowsingDemo={isBrowsingDemo}
                  activeSongIndex={activeSongIndex}
                  outputMode={outputMode}
                  masterVolumeLevel={masterVolumeLevel}
                  melodyVolumeLevel={melodyVolumeLevel}
                  percussionVolumeLevel={percussionVolumeLevel}
                  amFrequencyKhz={amFrequencyKhz}
                  settingsSelectedItem={settingsSelectedItem}
                  isSettingsEditing={isSettingsEditing}
                  audioEngine={engine}
                  theme={oledTheme}
                />
              </div>

              {/* Status info bar under display */}
              <div className="mt-3 flex w-full max-w-[512px] items-center justify-between text-xs font-mono text-neutral-400 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Mode: <strong className="text-neutral-200">{isBrowsingDemo ? '29 DEMOS (D)' : '20 SENTIMENTS (♫)'}</strong>
                </span>
                <span className="text-neutral-400">
                  {uiState === UIState.UI_PLAYING
                    ? `OSCILLOSCOPE ${engine.scope_fullscreen ? `ZOOM: ${engine.scope_zoom_level}` : 'NORMAL'}`
                    : uiState === UIState.UI_SETTINGS
                    ? (isSettingsEditing ? 'EDITING VALUE' : 'BROWSING MENU')
                    : 'STANDBY'}
                </span>
              </div>
            </div>

            {/* Hardware Controls & Rotary Encoder Section (Columns 8 to 12) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800 bg-neutral-950/60">
              <RotaryEncoder
                onRotate={handleRotate}
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
                isPressed={isEncoderPressed}
              />

              {/* Quick Action Buttons for users with mice/touchscreens */}
              <div className="mt-4 w-full grid grid-cols-3 gap-2">
                {isPlaying ? (
                  <button
                    type="button"
                    onClick={handleStopPlayback}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/50 bg-red-950/40 py-2 text-xs font-mono font-bold text-red-300 hover:bg-red-900/60 active:scale-95 transition-all"
                  >
                    <Square className="h-3.5 w-3.5 fill-red-400" />
                    <span>STOP</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartPlayback()}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/40 py-2 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-900/60 active:scale-95 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-emerald-400" />
                    <span>PLAY</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleSongList}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 py-2 text-xs font-mono text-neutral-300 hover:bg-neutral-800 active:scale-95 transition-all"
                  title="Toggle Song List between 20 Sentiments and 29 Demo Showcase Songs"
                >
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{isBrowsingDemo ? 'NORMAL' : 'DEMO'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (uiState === UIState.UI_SETTINGS) {
                      handleExitSettings();
                    } else {
                      handleEnterSettings();
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-mono font-medium transition-all ${
                    uiState === UIState.UI_SETTINGS
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Open Hardware Settings Menu"
                >
                  <Settings className="h-3.5 w-3.5 text-amber-400" />
                  <span>SETTINGS</span>
                </button>
              </div>

              {/* Hardware Output Selector Mode Shortcuts */}
              <div className="mt-3 w-full flex items-center justify-between border-t border-neutral-800 pt-2.5">
                <span className="text-[10px] font-mono text-neutral-400">ROUTING:</span>
                <div className="flex gap-1">
                  {[
                    { mode: OutputMode.DAC_ONLY, label: 'DAC' },
                    { mode: OutputMode.RF_ONLY, label: 'RF' },
                    { mode: OutputMode.DAC_AND_RF, label: 'A+RF' },
                    { mode: OutputMode.MUTE, label: 'MUTE' }
                  ].map(m => (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => setOutputMode(m.mode)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                        outputMode === m.mode
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Bottom Connectors & Jacks */}
          <div className="mt-6 border-t border-neutral-800/80 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-neutral-600 bg-black flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                </div>
                <span>DAC OUT (PIN A0): 12-Bit 0-4095</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-amber-500/60 bg-black flex items-center justify-center">
                  <div className={`h-1.5 w-1.5 rounded-full ${outputMode !== OutputMode.MUTE && isPlaying ? 'bg-amber-400 animate-ping' : 'bg-neutral-700'}`} />
                </div>
                <span>AM PWM RF (PIN 9): {amFrequencyKhz} kHz</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-300">
              Rotary: Ben Buxton State Machine | Sample Rate: 16,000 Hz
            </div>
          </div>
        </div>

        {/* AM Radio Receiver Simulator */}
        <AmRadioReceiver
          transmitterFreqKhz={amFrequencyKhz}
          outputMode={outputMode}
          radioTunedKhz={radioTunedKhz}
          onTunedFreqChange={setRadioTunedKhz}
          noiseAmount={radioNoiseAmount}
          onNoiseAmountChange={setRadioNoiseAmount}
          isPlaying={isPlaying}
        />

        {/* Telemetry, Voice Inspector, and Serial Monitor Logs */}
        <DiagnosticsPanel
          audioEngine={engine}
          currentSong={currentSong}
          isBrowsingDemo={isBrowsingDemo}
          onSelectSong={idx => {
            setSelectedSongIndex(idx);
            if (isPlaying) {
              handleStartPlayback(idx);
            }
          }}
          allSongs={currentSongList}
          selectedIndex={selectedSongIndex}
        />
      </main>
    </div>
  );
}
