import React, { useEffect, useRef } from 'react';
import {
  UIState,
  SettingItem,
  OutputMode,
  type Song
} from '../types/synth';
import type { AudioEngine } from '../dsp/AudioEngine';
import { FONT_5X7 } from '../utils/oledFont';

export type OledTheme = 'cyan' | 'amber' | 'green' | 'white';

interface OledDisplayProps {
  uiState: UIState;
  currentSongList: Song[];
  selectedSongIndex: number;
  isBrowsingDemo: boolean;
  activeSongIndex: number;
  outputMode: OutputMode;
  masterVolumeLevel: number;
  melodyVolumeLevel: number;
  percussionVolumeLevel: number;
  amFrequencyKhz: number;
  settingsSelectedItem: SettingItem;
  isSettingsEditing: boolean;
  audioEngine: AudioEngine;
  theme?: OledTheme;
}

export const OledDisplay: React.FC<OledDisplayProps> = ({
  uiState,
  currentSongList,
  selectedSongIndex,
  isBrowsingDemo,
  activeSongIndex,
  outputMode,
  masterVolumeLevel,
  melodyVolumeLevel,
  percussionVolumeLevel,
  amFrequencyKhz,
  settingsSelectedItem,
  isSettingsEditing,
  audioEngine,
  theme = 'cyan'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 128x32 display buffer (1 bit per pixel)
  const displayBuffer = useRef<Uint8Array>(new Uint8Array(128 * 32));

  // Color mappings
  const themeColors: Record<OledTheme, { on: string; off: string; glow: string }> = {
    cyan: { on: '#38bdf8', off: '#031726', glow: 'rgba(56, 189, 248, 0.4)' },
    amber: { on: '#fbbf24', off: '#241402', glow: 'rgba(251, 191, 36, 0.4)' },
    green: { on: '#4ade80', off: '#052210', glow: 'rgba(74, 222, 128, 0.4)' },
    white: { on: '#f1f5f9', off: '#0f172a', glow: 'rgba(241, 245, 249, 0.35)' }
  };

  // Clear buffer (0 = black/off)
  const clearDisplay = () => {
    displayBuffer.current.fill(0);
  };

  // Set pixel
  const setPixel = (x: number, y: number, color: 0 | 1 = 1) => {
    if (x < 0 || x >= 128 || y < 0 || y >= 32) return;
    displayBuffer.current[y * 128 + x] = color;
  };

  // Draw line (Bresenham)
  const drawLine = (x0: number, y0: number, x1: number, y1: number, color: 0 | 1 = 1) => {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      setPixel(x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  const drawFastHLine = (x: number, y: number, w: number, color: 0 | 1 = 1) => {
    for (let i = 0; i < w; i++) {
      setPixel(x + i, y, color);
    }
  };

  const drawFastVLine = (x: number, y: number, h: number, color: 0 | 1 = 1) => {
    for (let i = 0; i < h; i++) {
      setPixel(x, y + i, color);
    }
  };

  const drawRect = (x: number, y: number, w: number, h: number, color: 0 | 1 = 1) => {
    drawFastHLine(x, y, w, color);
    drawFastHLine(x, y + h - 1, w, color);
    drawFastVLine(x, y, h, color);
    drawFastVLine(x + w - 1, y, h, color);
  };

  const fillRect = (x: number, y: number, w: number, h: number, color: 0 | 1 = 1) => {
    for (let j = 0; j < h; j++) {
      drawFastHLine(x, y + j, w, color);
    }
  };

  const fillCircle = (xm: number, ym: number, r: number, color: 0 | 1 = 1) => {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) {
          setPixel(xm + x, ym + y, color);
        }
      }
    }
  };

  const fillTriangle = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: 0 | 1 = 1) => {
    const minX = Math.max(0, Math.min(x0, x1, x2));
    const maxX = Math.min(127, Math.max(x0, x1, x2));
    const minY = Math.max(0, Math.min(y0, y1, y2));
    const maxY = Math.min(31, Math.max(y0, y1, y2));

    const sign = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) => {
      return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
    };

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d1 = sign(x, y, x0, y0, x1, y1);
        const d2 = sign(x, y, x1, y1, x2, y2);
        const d3 = sign(x, y, x2, y2, x0, y0);

        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        if (!(has_neg && has_pos)) {
          setPixel(x, y, color);
        }
      }
    }
  };

  // Draw text using 5x7 Adafruit font (6px step per char)
  const drawString = (str: string, x: number, y: number, color: 0 | 1 = 1) => {
    let cursorX = x;
    for (let c = 0; c < str.length; c++) {
      const char = str[c];
      const bitmap = FONT_5X7[char] || FONT_5X7[' '];
      for (let col = 0; col < 5; col++) {
        const byte = bitmap[col];
        for (let row = 0; row < 7; row++) {
          if ((byte >> row) & 1) {
            setPixel(cursorX + col, y + row, color);
          }
        }
      }
      cursorX += 6;
    }
  };

  const truncate = (str: string, maxChars: number) => {
    if (str.length <= maxChars) return str;
    return str.substring(0, maxChars - 3) + '...';
  };

  // Render routine identical to C++ renderMenuScreen()
  const renderMenuScreen = () => {
    clearDisplay();
    const song = currentSongList[selectedSongIndex] || currentSongList[0];

    // Top: Song / Demo Icon
    if (isBrowsingDemo) {
      drawString('D', 0, 0);
    } else {
      // drawSongIcon(0, 0)
      drawFastVLine(4, 2, 6, 1);
      drawFastHLine(4, 2, 3, 1);
      fillCircle(2, 7, 1, 1);
    }

    // 2-digit index
    const indexStr = (selectedSongIndex + 1 < 10 ? '0' : '') + (selectedSongIndex + 1);
    drawString(indexStr, 11, 0);

    // Song title truncated to 14 chars
    drawString(truncate(song.title, 14), 25, 0);

    // Play triangle at (120, 0)
    fillTriangle(120, 0, 120, 8, 127, 4, 1);

    // Separator line
    drawFastHLine(0, 10, 128, 1);

    // Status boxes: RF and AUDIO
    const rfEnabled = outputMode === OutputMode.RF_ONLY || outputMode === OutputMode.DAC_AND_RF;
    const dacEnabled = outputMode === OutputMode.DAC_ONLY || outputMode === OutputMode.DAC_AND_RF;
    drawString(rfEnabled ? 'ON' : 'OFF', 3, 19);
    drawString(dacEnabled ? 'ON' : 'OFF', 23, 19);

    // 10-segment volume graphic bar
    const x = 40;
    const y = 18;
    const clampedVol = Math.max(0, Math.min(20, masterVolumeLevel));
    const fullSegments = Math.floor(clampedVol / 2);
    const halfSegment = (clampedVol % 2) !== 0;

    for (let i = 0; i < 10; i++) {
      const segX = x + i * 5;
      drawRect(segX, y, 4, 6, 1);
      if (i < fullSegments) {
        fillRect(segX + 1, y + 1, 2, 4, 1);
      } else if (i === fullSegments && halfSegment) {
        fillRect(segX + 1, y + 1, 1, 4, 1);
      }
    }

    // Volume marker
    const markerIndex = clampedVol >= 20 ? 9 : Math.floor(clampedVol / 2);
    const markerX = x + markerIndex * 5 + 1;
    drawFastVLine(markerX, y - 2, 10, 1);

    // Numbers: Volume & AM frequency
    drawString(String(masterVolumeLevel), 90, 19);
    drawString(String(amFrequencyKhz), 104, 19);
  };

  // Render routine identical to C++ renderPlayingScreen() & drawWaveformFrame()
  const renderPlayingScreen = () => {
    clearDisplay();

    if (audioEngine.scope_fullscreen) {
      // Fullscreen oscilloscope (zoom -9 to +9)
      const WAVEFORM_WIDTH = 124;
      const METER_X = 124;
      const centre_y = 16;
      const amplitude = 15;

      const rms = audioEngine.scope_sample_count > 0
        ? Math.sqrt(audioEngine.scope_sum_sq / audioEngine.scope_sample_count)
        : 0.0;
      const peak = audioEngine.scope_peak;

      for (let x = 0; x < WAVEFORM_WIDTH - 1; x++) {
        const i0 = Math.floor((x * 127) / (WAVEFORM_WIDTH - 1));
        const i1 = Math.floor(((x + 1) * 127) / (WAVEFORM_WIDTH - 1));

        const y0 = centre_y - Math.floor((audioEngine.wave_capture_buf[i0] * amplitude) / 127);
        const y1 = centre_y - Math.floor((audioEngine.wave_capture_buf[i1] * amplitude) / 127);

        const min_y0 = centre_y - Math.floor((audioEngine.wave_capture_max_buf[i0] * amplitude) / 127);
        const max_y0 = centre_y - Math.floor((audioEngine.wave_capture_min_buf[i0] * amplitude) / 127);
        const min_y1 = centre_y - Math.floor((audioEngine.wave_capture_max_buf[i1] * amplitude) / 127);
        const max_y1 = centre_y - Math.floor((audioEngine.wave_capture_min_buf[i1] * amplitude) / 127);

        drawLine(x, y0, x + 1, y1, 1);
        drawFastVLine(x, min_y0, Math.max(1, max_y0 - min_y0 + 1), 1);
        drawFastVLine(x + 1, min_y1, Math.max(1, max_y1 - min_y1 + 1), 1);
      }

      // Dashed reference axis
      for (let x = 0; x < WAVEFORM_WIDTH; x += 8) {
        setPixel(x, centre_y, 1);
      }

      // Vertical RMS power bar
      const rms_height = Math.max(0, Math.min(31, Math.floor(rms * 31)));
      const peak_y = Math.max(0, Math.min(31, 31 - Math.floor(peak * 31)));

      drawFastVLine(METER_X, 0, 32, 1);
      drawFastVLine(METER_X + 1, 0, 32, 1);

      if (rms_height > 0) {
        fillRect(METER_X + 2, 32 - rms_height, 2, rms_height, 1);
      }
      drawFastHLine(METER_X, peak_y, 4, 1);

      return;
    }

    // Normal Playback Layout (compact status, waveform, bottom meter)
    const rms = audioEngine.scope_sample_count > 0
      ? Math.sqrt(audioEngine.scope_sum_sq / audioEngine.scope_sample_count)
      : 0.0;
    const peak = audioEngine.scope_peak;

    let freq_hz = 0.0;
    if (audioEngine.scope_sample_count > 1 && audioEngine.scope_zero_crossings >= 2 && audioEngine.wave_capture_stride > 0) {
      const window_seconds = (audioEngine.scope_sample_count * audioEngine.wave_capture_stride) / 16000;
      if (window_seconds > 0) {
        freq_hz = (audioEngine.scope_zero_crossings * 0.5) / window_seconds;
      }
    }

    const activeVoices = audioEngine.getActiveVoicesInfo().melodic.filter(m => m.state !== 'IDLE').length +
      audioEngine.getActiveVoicesInfo().percussion.filter(p => p.active).length;

    // Row 0: P<pk> R<rms> V<voices> <freq>
    const peakText = `P${Math.floor(peak * 100)}`;
    const rmsText = `R${Math.floor(rms * 100)}`;
    const voicesText = `V${activeVoices}`;
    drawString(`${peakText} ${rmsText} ${voicesText}`, 0, 0);

    let freqText = '--Hz';
    if (freq_hz >= 1000) {
      freqText = `${(freq_hz / 1000).toFixed(1)}k`;
    } else if (freq_hz >= 10) {
      freqText = `${Math.floor(freq_hz)}Hz`;
    }
    drawString(freqText, 74, 0);

    // Middle rows 8..25: waveform
    for (let x = 0; x < 127; x++) {
      const y0 = 17 - Math.floor((audioEngine.wave_capture_buf[x] * 8) / 127);
      const y1 = 17 - Math.floor((audioEngine.wave_capture_buf[x + 1] * 8) / 127);
      const min_y = 17 - Math.floor((audioEngine.wave_capture_max_buf[x] * 8) / 127);
      const max_y = 17 - Math.floor((audioEngine.wave_capture_min_buf[x] * 8) / 127);

      drawLine(x, y0, x + 1, y1, 1);
      drawFastVLine(x, min_y, Math.max(1, max_y - min_y + 1), 1);
    }
    for (let x = 0; x < 128; x += 8) {
      setPixel(x, 17, 1);
    }

    // Bottom meter (rows 27..31)
    const meter_width = 126;
    const rms_width = Math.max(0, Math.min(meter_width, Math.floor(rms * meter_width)));
    const peak_x = Math.max(0, Math.min(meter_width - 1, Math.floor(peak * meter_width)));

    drawRect(0, 27, 128, 5, 1);
    if (rms_width > 1) {
      fillRect(1, 28, rms_width, 3, 1);
    }
    drawFastVLine(1 + peak_x, 27, 5, 1);

    // Overload '!' warning
    if (peak >= 0.95) {
      fillRect(118, 1, 9, 5, 1);
      drawString('!', 120, 0, 0);
    }
  };

  // Render routine identical to C++ renderSettingsScreen()
  const renderSettingsScreen = () => {
    clearDisplay();

    // Header
    if (isSettingsEditing) {
      fillRect(0, 0, 7, 8, 1);
      drawString('E', 1, 0, 0);
      drawString(getSettingTitle(settingsSelectedItem), 9, 0, 1);
    } else {
      drawString('>', 0, 0, 1);
      drawString(getSettingTitle(settingsSelectedItem), 9, 0, 1);
    }

    drawFastHLine(0, 8, 128, 1);

    // Content based on setting item
    switch (settingsSelectedItem) {
      case SettingItem.MELODY_VOLUME:
        drawSettingBar(melodyVolumeLevel, 0, 20);
        drawString('0', 0, 22);
        drawString('20', 116, 22);
        drawString(`${melodyVolumeLevel} / 20`, 42, 24);
        break;

      case SettingItem.PERCUSSION_VOLUME:
        drawSettingBar(percussionVolumeLevel, 0, 20);
        drawString('0', 0, 22);
        drawString('20', 116, 22);
        drawString(`${percussionVolumeLevel} / 20`, 42, 24);
        break;

      case SettingItem.MASTER_VOLUME:
        drawSettingBar(masterVolumeLevel, 0, 20);
        drawString('0', 0, 22);
        drawString('20', 116, 22);
        drawString(`${masterVolumeLevel} / 20`, 42, 24);
        break;

      case SettingItem.AM_FREQUENCY:
        drawSettingBar(amFrequencyKhz, 531, 1602);
        drawString('531k', 0, 22);
        drawString('1602k', 98, 22);
        drawString(`${amFrequencyKhz} kHz`, 40, 24);
        break;

      case SettingItem.OUTPUT_SELECTION:
        drawOutputBar();
        drawString(`${outputMode + 1} ${getOutputModeName(outputMode)}`, 24, 24);
        break;
    }
  };

  const getSettingTitle = (item: SettingItem): string => {
    switch (item) {
      case SettingItem.MELODY_VOLUME: return 'MELODY VOL';
      case SettingItem.PERCUSSION_VOLUME: return 'PERC VOL';
      case SettingItem.MASTER_VOLUME: return 'MASTER VOL';
      case SettingItem.AM_FREQUENCY: return 'AM FREQUENCY';
      case SettingItem.OUTPUT_SELECTION: return 'OUTPUT';
      default: return 'SETTINGS';
    }
  };

  const getOutputModeName = (mode: OutputMode): string => {
    switch (mode) {
      case OutputMode.DAC_ONLY: return 'AUDIO ONLY';
      case OutputMode.RF_ONLY: return 'RF ONLY';
      case OutputMode.DAC_AND_RF: return 'AUDIO + RF';
      case OutputMode.MUTE: return 'MUTE';
    }
  };

  const drawSettingBar = (value: number, minVal: number, maxVal: number) => {
    const x0 = 8;
    const x1 = 119;
    const y = 14;
    const width = x1 - x0;

    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const marker_x = x0 + Math.floor(((clamped - minVal) * width) / (maxVal - minVal));

    drawRect(x0, y, width + 1, 5, 1);
    if (marker_x > x0) {
      fillRect(x0 + 1, y + 1, marker_x - x0, 3, 1);
    }
    // Triangle marker above
    fillTriangle(marker_x - 3, y - 4, marker_x + 3, y - 4, marker_x, y - 1, 1);
  };

  const drawOutputBar = () => {
    const x0 = 7;
    const y = 12;
    const total_width = 114;
    const seg_w = Math.floor(total_width / 4);
    const labels = ['AUDIO', 'RF', 'A+RF', 'MUTE'];

    for (let i = 0; i < 4; i++) {
      const segX = x0 + i * seg_w;
      if (i === outputMode) {
        fillRect(segX, y, seg_w, 9, 1);
        drawString(labels[i], segX + 3, y + 1, 0);
      } else {
        drawRect(segX, y, seg_w, 9, 1);
        drawString(labels[i], segX + 3, y + 1, 1);
      }
    }
  };

  // Main rendering loop (updates every frame to animate oscilloscope smoothly)
  useEffect(() => {
    let animId: number;

    const render = () => {
      switch (uiState) {
        case UIState.UI_MENU_SELECTION:
          renderMenuScreen();
          break;
        case UIState.UI_PLAYING:
          renderPlayingScreen();
          break;
        case UIState.UI_SETTINGS:
          renderSettingsScreen();
          break;
      }

      // Draw displayBuffer onto canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = themeColors[theme].off;
          ctx.fillRect(0, 0, 128, 32);

          ctx.fillStyle = themeColors[theme].on;
          for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 128; x++) {
              if (displayBuffer.current[y * 128 + x] === 1) {
                ctx.fillRect(x, y, 1, 1);
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    uiState,
    currentSongList,
    selectedSongIndex,
    isBrowsingDemo,
    activeSongIndex,
    outputMode,
    masterVolumeLevel,
    melodyVolumeLevel,
    percussionVolumeLevel,
    amFrequencyKhz,
    settingsSelectedItem,
    isSettingsEditing,
    theme
  ]);

  return (
    <div className="relative rounded-xl border-2 border-slate-300 bg-slate-100 p-2.5 shadow-md ring-1 ring-slate-900/5">
      {/* 4 Arduino Standoff Brass Mounting Holes in corners */}
      <div className="absolute top-1.5 left-1.5 h-3 w-3 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
        <div className="h-1 w-1 rounded-full bg-slate-700" />
      </div>
      <div className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
        <div className="h-1 w-1 rounded-full bg-slate-700" />
      </div>
      <div className="absolute bottom-1.5 left-1.5 h-3 w-3 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
        <div className="h-1 w-1 rounded-full bg-slate-700" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full border-2 border-[#C29B38] bg-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
        <div className="h-1 w-1 rounded-full bg-slate-700" />
      </div>

      {/* Top Silkscreen Pin Headers */}
      <div className="mb-1 flex items-center justify-between px-6 text-[9px] font-mono text-slate-500 font-bold select-none">
        <span className="text-[#00979C]">SSD1306 128x32 OLED</span>
        <div className="flex gap-2 text-slate-600">
          <span>GND</span>
          <span>VCC</span>
          <span className="text-[#00979C]">SCL</span>
          <span className="text-[#00979C]">SDA</span>
        </div>
      </div>

      {/* Front panel OLED glass bezel */}
      <div className="relative overflow-hidden rounded bg-black border-2 border-slate-800 shadow-inner">
        {/* CRT / OLED scanline & phosphor glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 2px)',
            backgroundSize: '100% 2px'
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-screen"
          style={{
            boxShadow: `inset 0 0 16px ${themeColors[theme].glow}`
          }}
        />

        <canvas
          ref={canvasRef}
          width={128}
          height={32}
          id="oled-screen-canvas"
          className="block w-full max-w-[512px] h-[128px] image-rendering-pixelated cursor-pointer"
          style={{
            imageRendering: 'pixelated'
          }}
        />
      </div>

      {/* Physical silkscreen labels below screen matching C++ note: "RF | AUDIO | VOL | FR" */}
      <div className="mt-2 flex items-center justify-between px-4 text-[10px] font-mono tracking-wider text-slate-600 select-none font-bold">
        <span className="w-12 text-left text-slate-700">RF</span>
        <span className="w-16 text-left text-slate-700">AUDIO</span>
        <span className="flex-1 text-center text-[#00979C]">VOLUME</span>
        <span className="w-14 text-right text-slate-700">FR (kHz)</span>
      </div>
    </div>
  );
};
