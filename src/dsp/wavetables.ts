export const SAMPLE_RATE = 16000;
export const NOTE_A4 = 69;
export const FREQ_A4 = 440.0;
export const DELAY_BUFFER_SIZE = Math.floor((256 * SAMPLE_RATE) / 8000); // 512 samples

export const SINE_TABLE = new Int16Array(256);
export const TRIANGLE_TABLE = new Int16Array(256);
export const SQUARE_TABLE = new Int16Array(256);
export const SAW_TABLE = new Int16Array(256);
export const BRIGHT_TRIANGLE_TABLE = new Int16Array(256);
export const WARM_TRIANGLE_TABLE = new Int16Array(256);
export const SINE_TABLE_F = new Float32Array(256);

export const MIDI_PHASE = new Uint32Array(128);

// Initialize tables exactly as in the C++ firmware
for (let i = 0; i < 256; i++) {
  const rad = (2.0 * Math.PI * i) / 256.0;
  const sine = Math.sin(rad);
  const triangle = (i < 128) ? (-1.0 + (2.0 * i / 128.0)) : (3.0 - (2.0 * i / 128.0));
  
  SINE_TABLE_F[i] = sine;
  SINE_TABLE[i] = Math.round(sine * 32767.0);
  TRIANGLE_TABLE[i] = Math.round(triangle * 32767.0);

  const bright_tri = Math.sign(triangle) * Math.pow(Math.abs(triangle), 0.88);
  const warm_tri = Math.sign(triangle) * Math.pow(Math.abs(triangle), 1.12);

  BRIGHT_TRIANGLE_TABLE[i] = Math.round(bright_tri * 32767.0);
  WARM_TRIANGLE_TABLE[i] = Math.round(warm_tri * 32767.0);
  SQUARE_TABLE[i] = (i < 128) ? 32767 : -32767;
  SAW_TABLE[i] = Math.round((-1.0 + (2.0 * i / 256.0)) * 32767.0);
}

for (let n = 0; n < 128; n++) {
  const freq = FREQ_A4 * Math.pow(2.0, (n - NOTE_A4) / 12.0);
  MIDI_PHASE[n] = Math.floor((freq * 4294967296.0) / SAMPLE_RATE);
}

// Fast sine lookup with linear interpolation, identical to C++ sineTableLookup
export function sineLUT(phase_table_units: number): number {
  let phase = phase_table_units;
  while (phase >= 256.0) phase -= 256.0;
  while (phase < 0.0) phase += 256.0;

  const idx = Math.floor(phase) & 0xFF;
  const idx_next = (idx + 1) & 0xFF;
  const frac = phase - Math.floor(phase);
  const a = SINE_TABLE_F[idx];
  const b = SINE_TABLE_F[idx_next];
  return a + frac * (b - a);
}

// Volume logarithmic (audio-taper) curve
export const VOLUME_TAPER_MIN_DB = -45.0;

export function volumeLevelToGainPercent(level: number, max_level: number): number {
  if (level === 0 || max_level === 0) {
    return 0.0;
  }
  if (level >= max_level) {
    return 100.0;
  }
  const level_fraction = level / max_level;
  const db = VOLUME_TAPER_MIN_DB * (1.0 - level_fraction);
  const gain = Math.pow(10.0, db / 20.0);
  return gain * 100.0;
}
