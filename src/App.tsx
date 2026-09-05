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
  Headphones,
  Download,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  Music,
  Cpu
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
import { exportSongToMp3, triggerFileDownload } from './utils/mp3Exporter';

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

  // Appearance & Audio Engine init
  const [oledTheme, setOledTheme] = useState<OledTheme>('white');
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // MP3 Download / Export State
  const [isExportingMp3, setIsExportingMp3] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportPhase, setExportPhase] = useState<'synthesis' | 'resample' | 'encode' | 'complete' | 'error'>('synthesis');
  const [exportStatusMessage, setExportStatusMessage] = useState<string>('');
  const [exportTargetSong, setExportTargetSong] = useState<Song | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Inactivity timer ref
  const settingsLastActivityRef = useRef<number>(Date.now());
  const buttonPressStartRef = useRef<number>(0);
  const buttonHoldFiredRef = useRef<boolean>(false);
  const [isEncoderPressed, setIsEncoderPressed] = useState<boolean>(false);

  const currentSongList: Song[] = isBrowsingDemo ? DEMO_SONGS : PLAYER_SONGS;
  const currentSong = currentSongList[selectedSongIndex] || currentSongList[0];
  const activePlayingSong = currentSongList[activeSongIndex] || currentSong;

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
  }, [engine, currentSongList, selectedSongIndex]);

  const handleStopPlayback = useCallback(() => {
    engine.stopSong();
    setIsPlaying(false);
    setUiState(UIState.UI_MENU_SELECTION);
  }, [engine]);

  // Enter / Exit Settings
  const handleEnterSettings = useCallback(() => {
    if (isPlaying) {
      handleStopPlayback();
    }
    setUiState(UIState.UI_SETTINGS);
    setSettingsSelectedItem(SettingItem.MASTER_VOLUME);
    setIsSettingsEditing(false);
    settingsLastActivityRef.current = Date.now();
  }, [isPlaying, handleStopPlayback]);

  const handleExitSettings = useCallback(() => {
    setIsSettingsEditing(false);
    setUiState(UIState.UI_MENU_SELECTION);
  }, []);

  // Toggle Song List (Sentiments <-> Demos)
  const handleToggleSongList = useCallback(() => {
    if (isPlaying) {
      handleStopPlayback();
    }
    setIsBrowsingDemo(prev => !prev);
    setSelectedSongIndex(0);
    setActiveSongIndex(0);
  }, [isPlaying, handleStopPlayback]);

  // MP3 Export Handler for Active or Target Song
  const handleExportSong = async (songToExport: Song = (isPlaying ? activePlayingSong : currentSong)) => {
    try {
      setIsExportingMp3(true);
      setExportTargetSong(songToExport);
      setExportProgress(0);
      setExportPhase('synthesis');
      setExportStatusMessage('Initializing offline DSP synthesizer (16 kHz)...');
      setShowExportModal(true);

      const result = await exportSongToMp3(songToExport, {
        masterVolume: masterVolumeLevel,
        melodyVolume: melodyVolumeLevel,
        percussionVolume: percussionVolumeLevel,
        outputMode: OutputMode.DAC_ONLY, // Direct pristine 16-bit audio output
        onProgress: (percent: number, stepText: string) => {
          setExportProgress(Math.round(percent));
          if (percent < 50) {
            setExportPhase('synthesis');
          } else if (percent < 65) {
            setExportPhase('resample');
          } else if (percent < 100) {
            setExportPhase('encode');
          }
          setExportStatusMessage(stepText);
        }
      });

      triggerFileDownload(result.blob, result.filename);

      setExportPhase('complete');
      setExportStatusMessage(`File generated! (${(result.sizeBytes / 1024).toFixed(1)} KB)`);
      setExportSuccessNotice(`"${result.filename}" downloaded successfully`);

      setTimeout(() => {
        setExportSuccessNotice(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error exporting song to MP3:', err);
      setExportPhase('error');
      setExportStatusMessage(err?.message || 'Unknown error encoding MP3');
    } finally {
      setIsExportingMp3(false);
    }
  };

  // Rotary Encoder Rotation Logic
  const handleRotate = useCallback((clockwise: boolean) => {
    settingsLastActivityRef.current = Date.now();

    if (uiState === UIState.UI_MENU_SELECTION) {
      setSelectedSongIndex(prev => {
        const total = currentSongList.length;
        if (clockwise) {
          return (prev + 1) % total;
        } else {
          return (prev - 1 + total) % total;
        }
      });
    } else if (uiState === UIState.UI_PLAYING) {
      // While playing, encoder rotates oscilloscope zoom (-9 to +9)
      const currentZoom = engine.scope_zoom_level;
      const nextZoom = clockwise
        ? Math.min(9, currentZoom + 1)
        : Math.max(-9, currentZoom - 1);
      engine.scope_zoom_level = nextZoom;
      engine.scope_fullscreen = (nextZoom !== 0);
    } else if (uiState === UIState.UI_SETTINGS) {
      if (!isSettingsEditing) {
        // Browse Settings Items
        setSettingsSelectedItem(prev => {
          const items = [
            SettingItem.MASTER_VOLUME,
            SettingItem.MELODY_VOLUME,
            SettingItem.PERCUSSION_VOLUME,
            SettingItem.AM_FREQUENCY,
            SettingItem.OUTPUT_SELECTION
          ];
          const currIdx = items.indexOf(prev);
          const nextIdx = clockwise
            ? (currIdx + 1) % items.length
            : (currIdx - 1 + items.length) % items.length;
          return items[nextIdx];
        });
      } else {
        // Edit Setting Value
        switch (settingsSelectedItem) {
          case SettingItem.MASTER_VOLUME:
            setMasterVolumeLevel(prev => clockwise ? Math.min(20, prev + 1) : Math.max(0, prev - 1));
            break;
          case SettingItem.MELODY_VOLUME:
            setMelodyVolumeLevel(prev => clockwise ? Math.min(20, prev + 1) : Math.max(0, prev - 1));
            break;
          case SettingItem.PERCUSSION_VOLUME:
            setPercussionVolumeLevel(prev => clockwise ? Math.min(20, prev + 1) : Math.max(0, prev - 1));
            break;
          case SettingItem.AM_FREQUENCY:
            setAmFrequencyKhz(prev => {
              const delta = clockwise ? 9 : -9;
              return Math.max(531, Math.min(1602, prev + delta));
            });
            break;
          case SettingItem.OUTPUT_SELECTION:
            setOutputMode(prev => {
              const modes = [
                OutputMode.DAC_ONLY,
                OutputMode.RF_ONLY,
                OutputMode.DAC_AND_RF,
                OutputMode.MUTE
              ];
              const idx = modes.indexOf(prev);
              const nextIdx = clockwise
                ? (idx + 1) % modes.length
                : (idx - 1 + modes.length) % modes.length;
              return modes[nextIdx];
            });
            break;
        }
      }
    }
  }, [
    uiState,
    currentSongList.length,
    engine,
    isSettingsEditing,
    settingsSelectedItem
  ]);

  // Rotary Encoder Push Button Handlers
  const handlePressStart = useCallback(() => {
    buttonPressStartRef.current = Date.now();
    buttonHoldFiredRef.current = false;
    setIsEncoderPressed(true);
    settingsLastActivityRef.current = Date.now();
  }, []);

  const handlePressEnd = useCallback(() => {
    setIsEncoderPressed(false);
    const duration = Date.now() - buttonPressStartRef.current;
    settingsLastActivityRef.current = Date.now();

    if (uiState === UIState.UI_SETTINGS) {
      if (duration >= 600) {
        handleExitSettings();
      } else {
        setIsSettingsEditing(prev => !prev);
      }
      return;
    }

    if (uiState === UIState.UI_PLAYING) {
      handleStopPlayback();
      return;
    }

    // UIState.UI_MENU_SELECTION:
    if (duration >= 1800) {
      handleEnterSettings();
    } else if (duration >= 600) {
      handleToggleSongList();
    } else {
      handleStartPlayback();
    }
  }, [
    uiState,
    handleStopPlayback,
    handleExitSettings,
    handleEnterSettings,
    handleToggleSongList,
    handleStartPlayback,
    settingsSelectedItem
  ]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.key === 'd' || e.key === 'D') {
        // Keyboard shortcut 'D' to export MP3
        e.preventDefault();
        if (!isExportingMp3) {
          handleExportSong();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotate, handleStartPlayback, handleStopPlayback, handleExitSettings, uiState, isExportingMp3]);

  return (
    <div className="min-h-screen bg-[#F0F4F4] text-slate-800 p-3 sm:p-5 lg:p-7 flex flex-col items-center select-none font-sans">
      {/* Top Application Header Ribbon (Arduino Laboratory Aesthetic) */}
      <header className="w-full max-w-6xl mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border-2 border-slate-200 p-3.5 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex items-center gap-3">
          {/* Arduino Infinity Logo Badge */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00979C] text-white shadow-xs font-mono font-black text-sm tracking-tighter">
            (∞)
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-mono flex items-center gap-1.5">
                ARDUINO® <span className="text-[#00979C]">SOUND MESSENGER</span>
              </h1>
              <span className="rounded bg-[#00979C]/10 text-[#00979C] border border-[#00979C]/30 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                REV 3 SHIELD
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              4-Voice Polyphonic Synthesizer, Analog Percussion & AM RF Modulator (Renesas RA4M1 DSP)
            </p>
          </div>
        </div>

        {/* Action Controls in Header: MP3 Download, Audio Enable, Theme Dots, Help */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Main Direct MP3 Download Button */}
          <button
            type="button"
            onClick={() => handleExportSong(isPlaying ? activePlayingSong : currentSong)}
            disabled={isExportingMp3}
            className="flex items-center gap-2 rounded-lg bg-[#00979C] hover:bg-[#008184] text-white px-3.5 py-2 text-xs font-mono font-bold shadow-xs hover:shadow transition-all active:scale-95 disabled:opacity-50"
            title={`Download active song "${isPlaying ? activePlayingSong.title : currentSong.title}" in .MP3 format`}
          >
            {isExportingMp3 ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Download className="h-4 w-4 text-white" />
            )}
            <span>DOWNLOAD .MP3</span>
          </button>

          {/* Audio Engine Enable Toggle */}
          {!audioStarted ? (
            <button
              type="button"
              onClick={() => {
                engine.initAudio();
                setAudioStarted(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-xs"
            >
              <Headphones className="h-3.5 w-3.5 text-emerald-600" />
              <span>ENABLE AUDIO</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DSP ACTIVE</span>
            </div>
          )}

          {/* OLED Color Theme Picker */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1" title="OLED Screen Theme">
            {(['white', 'cyan', 'amber', 'green'] as OledTheme[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setOledTheme(t)}
                className={`h-4 w-4 rounded-full border transition-all ${
                  oledTheme === t ? 'scale-125 ring-2 ring-[#00979C]' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    t === 'cyan' ? '#06b6d4' : t === 'amber' ? '#f59e0b' : t === 'green' ? '#10b981' : '#f8fafc'
                }}
                title={`OLED: ${t.toUpperCase()}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowHelp(prev => !prev)}
            className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
            title="Arduino hardware controls guide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {exportSuccessNotice && (
        <div className="w-full max-w-6xl mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-mono text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span><strong>MP3 DOWNLOADED:</strong> {exportSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Controls Help Drawer */}
      {showHelp && (
        <div className="w-full max-w-6xl mb-5 rounded-xl border border-[#00979C]/30 bg-[#E8F5F5] p-4 text-xs font-mono text-[#006468] shadow-sm">
          <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#00979C]" />
              ARDUINO HARDWARE OPERATION GUIDE
            </span>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-slate-500 hover:text-slate-900 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
            <div>
              <strong className="text-slate-900 block mb-1">Rotary Encoder (Turn Knob):</strong>
              • In menu: Browse songs (Clockwise = Next, Counter-Clockwise = Prev)<br />
              • Playing: Oscilloscope zoom (-9 to +9 steps)<br />
              • In settings: Change parameters (Volume, AM Frequency, Output Mode)
            </div>
            <div>
              <strong className="text-slate-900 block mb-1">Push Button (Short Click vs Hold):</strong>
              • Short click: Play / Pause / Edit value<br />
              • Hold 0.6s - 1.8s: Toggle between 20 Sentiments and 29 Demos<br />
              • Hold &gt; 1.8s: Open Hardware Settings Menu
            </div>
            <div>
              <strong className="text-slate-900 block mb-1">MP3 Download & Keyboard Shortcuts:</strong>
              • <strong>DOWNLOAD .MP3</strong> Button: Offline 44.1 kHz CBR audio export<br />
              • Left / Right Arrows: Rotate encoder<br />
              • Space / Enter: Press encoder | D key: Download MP3
            </div>
          </div>
        </div>
      )}

      {/* Main Hardware Chassis: Authentic Arduino Shield Aesthetic */}
      <main className="w-full max-w-6xl flex flex-col gap-6">
        {/* Physical Enclosure Case (Crisp White PCB & Arduino Teal Trim) */}
        <div className="relative rounded-2xl border-4 border-[#00979C] bg-white p-5 sm:p-7 shadow-lg ring-1 ring-slate-900/10">
          {/* 4 Corner Brass Mounting Holes (Authentic Arduino PCB Hardware) */}
          <div className="absolute top-2.5 left-2.5 h-4 w-4 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>
          <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>
          <div className="absolute bottom-2.5 left-2.5 h-4 w-4 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>
          <div className="absolute bottom-2.5 right-2.5 h-4 w-4 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Top Arduino Header Socket Rail Pin Silkscreen */}
          <div className="mb-4 border-b-2 border-slate-200 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 font-bold px-1 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[#00979C] font-black">ARDUINO® UNO R4 / GIGA</span>
                <span className="text-slate-300">|</span>
                <span>HEADER:</span>
                <div className="flex gap-1.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <span>AREF</span>
                  <span>GND</span>
                  <span className="text-[#E47128]">~13(L)</span>
                  <span>~12</span>
                  <span>~11</span>
                  <span>~10</span>
                  <span className="text-[#00979C] font-black">~9(PWM RF)</span>
                  <span>8</span>
                  <span className="text-slate-300">|</span>
                  <span>7</span>
                  <span>~6</span>
                  <span>~5</span>
                  <span>4</span>
                  <span>~3</span>
                  <span>2</span>
                  <span>TX&gt;1</span>
                  <span>RX&lt;0</span>
                </div>
              </div>

              {/* Real-time Hardware LEDs */}
              <div className="flex items-center gap-4 text-[10px] font-mono">
                {/* ON Power LED */}
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span className="font-bold text-slate-700">ON</span>
                </span>
                {/* L LED (Pin 13 - Blinks with Synth notes) */}
                <span className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full transition-all ${
                    isPlaying ? 'bg-[#E47128] shadow-[0_0_8px_rgba(228,113,40,1)] animate-pulse' : 'bg-slate-300'
                  }`} />
                  <span className="font-bold text-slate-700">L (PIN 13)</span>
                </span>
                {/* TX RF LED */}
                <span className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full transition-all ${
                    outputMode !== OutputMode.MUTE && isPlaying ? 'bg-[#00979C] shadow-[0_0_8px_rgba(0,151,156,0.9)] animate-ping' : 'bg-slate-300'
                  }`} />
                  <span className="font-bold text-slate-700">TX (RF 594kHz)</span>
                </span>
              </div>
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
              <div className="mt-3 flex w-full max-w-[512px] items-center justify-between text-xs font-mono text-slate-600 px-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#00979C]" />
                  Catalog: <strong className="text-slate-900">{isBrowsingDemo ? '29 DEMOS (D)' : '20 SENTIMENTS (♫)'}</strong>
                </span>
                <span className="text-slate-600">
                  {uiState === UIState.UI_PLAYING
                    ? `OSCILLOSCOPE ${engine.scope_fullscreen ? `ZOOM: ${engine.scope_zoom_level}` : 'NORMAL'}`
                    : uiState === UIState.UI_SETTINGS
                    ? (isSettingsEditing ? 'EDITING VALUE' : 'BROWSING SETTINGS')
                    : 'STANDBY'}
                </span>
              </div>
            </div>

            {/* Hardware Controls & Rotary Encoder Section (Columns 8 to 12) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-slate-50 shadow-xs">
              <RotaryEncoder
                onRotate={handleRotate}
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
                isPressed={isEncoderPressed}
              />

              {/* Main MP3 Download Button (Prominent Action) */}
              <div className="mt-4 w-full">
                <button
                  type="button"
                  onClick={() => handleExportSong(isPlaying ? activePlayingSong : currentSong)}
                  disabled={isExportingMp3}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-[#00979C] bg-[#00979C] hover:bg-[#008184] text-white py-2.5 px-4 text-xs font-mono font-bold shadow-xs hover:shadow transition-all active:scale-98 disabled:opacity-50"
                  title={`Download active song "${isPlaying ? activePlayingSong.title : currentSong.title}" in MP3 format`}
                >
                  {isExportingMp3 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>DOWNLOAD .MP3: &quot;{isPlaying ? activePlayingSong.title : currentSong.title}&quot;</span>
                </button>
              </div>

              {/* Quick Action Hardware Buttons (Play/Stop, Normal/Demo, Settings) */}
              <div className="mt-2.5 w-full grid grid-cols-3 gap-2">
                {isPlaying ? (
                  <button
                    type="button"
                    onClick={handleStopPlayback}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 py-2 text-xs font-mono font-bold text-red-700 hover:bg-red-100 active:scale-95 transition-all shadow-xs"
                  >
                    <Square className="h-3.5 w-3.5 fill-red-600" />
                    <span>STOP</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartPlayback()}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 py-2 text-xs font-mono font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5 fill-emerald-600" />
                    <span>PLAY</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleSongList}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2 text-xs font-mono font-bold text-slate-700 hover:border-[#00979C] hover:text-[#00979C] active:scale-95 transition-all shadow-xs"
                  title="Switch catalog between 20 Sentiments and 29 Demos"
                >
                  <Layers className="h-3.5 w-3.5 text-[#00979C]" />
                  <span>{isBrowsingDemo ? 'SENTIMENTS' : 'DEMOS'}</span>
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
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-mono font-bold transition-all shadow-xs ${
                    uiState === UIState.UI_SETTINGS
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-amber-500 hover:text-amber-700'
                  }`}
                  title="Open hardware settings menu"
                >
                  <Settings className="h-3.5 w-3.5 text-amber-500" />
                  <span>SETTINGS</span>
                </button>
              </div>

              {/* Hardware Output Selector Mode Shortcuts */}
              <div className="mt-3 w-full flex items-center justify-between border-t border-slate-200 pt-2.5">
                <span className="text-[10px] font-mono text-slate-500 font-bold">OUTPUT:</span>
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
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors shadow-xs ${
                        outputMode === m.mode
                          ? 'border-[#00979C] bg-[#E8F5F5] text-[#008184]'
                          : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Bottom Silkscreen Header Pin Rail & Hardware Jacks */}
          <div className="mt-6 border-t-2 border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-6">
              {/* Pin A0 DAC Output */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/40 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                </div>
                <span className="font-bold text-slate-700">DAC OUT (PIN A0): 12-Bit 0-4095</span>
              </div>

              {/* Pin 9 PWM RF Transmitter */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-[#00979C] bg-[#00979C]/20 flex items-center justify-center">
                  <div className={`h-1.5 w-1.5 rounded-full ${outputMode !== OutputMode.MUTE && isPlaying ? 'bg-[#00979C] animate-ping' : 'bg-slate-400'}`} />
                </div>
                <span className="font-bold text-slate-700">AM PWM RF (PIN 9): {amFrequencyKhz} kHz</span>
              </div>
            </div>

            {/* Microcontroller Silkscreen Badge */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
              <Cpu className="h-3.5 w-3.5 text-[#00979C]" />
              <span>RENESAS RA4M1 48MHz Cortex-M4 | Fs: 16.000 kHz | MP3: LAME CBR 192k</span>
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

        {/* Telemetry, Voice Inspector, and Serial Monitor Logs with MP3 song export */}
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
          onExportSongMp3={song => handleExportSong(song)}
        />
      </main>

      {/* MP3 Export Progress Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border-2 border-[#00979C] bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00979C] text-white">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-900">
                    MP3 AUDIO EXPORTER
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">Arduino Offline DSP & LAME Encoder</p>
                </div>
              </div>
              {!isExportingMp3 && (
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Song details */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500">Song:</span>
                <span className="font-bold text-slate-900 truncate max-w-[240px]">
                  {exportTargetSong?.title || currentSong.title}
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500">Tempo / BPM:</span>
                <span className="font-bold text-slate-800">
                  {exportTargetSong?.bpm || currentSong.bpm} BPM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-bold text-[#00979C]">
                  MP3 44.1 kHz, 192 kbps CBR Stereo
                </span>
              </div>
            </div>

            {/* Progress Bar & Status */}
            <div className="mt-5">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-600 font-semibold">{exportStatusMessage}</span>
                <span className="font-bold text-[#00979C]">{exportProgress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    exportPhase === 'error'
                      ? 'bg-red-500'
                      : exportPhase === 'complete'
                      ? 'bg-emerald-500'
                      : 'bg-[#00979C]'
                  }`}
                  style={{ width: `${Math.max(3, exportProgress)}%` }}
                />
              </div>

              {/* Export Phase Steps */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className={`p-1.5 rounded border ${
                  exportPhase === 'synthesis'
                    ? 'border-[#00979C] bg-[#E8F5F5] text-[#008184] font-bold'
                    : exportProgress > 40
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}>
                  1. DSP Synthesis
                </div>
                <div className={`p-1.5 rounded border ${
                  exportPhase === 'resample'
                    ? 'border-[#00979C] bg-[#E8F5F5] text-[#008184] font-bold'
                    : exportProgress > 60
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}>
                  2. Resample 44.1k
                </div>
                <div className={`p-1.5 rounded border ${
                  exportPhase === 'encode'
                    ? 'border-[#00979C] bg-[#E8F5F5] text-[#008184] font-bold'
                    : exportProgress >= 100
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}>
                  3. LAME MP3
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex justify-end">
              {exportPhase === 'complete' ? (
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-mono font-bold shadow-xs transition-colors"
                >
                  DONE / CLOSE
                </button>
              ) : exportPhase === 'error' ? (
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-mono font-bold shadow-xs transition-colors"
                >
                  CLOSE
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-[#00979C]" />
                  <span>Processing audio...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
