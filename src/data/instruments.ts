import type { Instrument } from '../types/synth';
import {
  SINE_TABLE,
  TRIANGLE_TABLE,
  SQUARE_TABLE,
  SAW_TABLE,
  BRIGHT_TRIANGLE_TABLE,
  WARM_TRIANGLE_TABLE
} from '../dsp/wavetables';

const DEMO_WAVE_ADSR = { attack_ms: 30, decay_ms: 200, sustain_level: 0.75, release_ms: 400 };

export const INST_DEMO_WAVE_SINE: Instrument = {
  name: 'Demo Wave Sine',
  wave_table: SINE_TABLE,
  adsr: DEMO_WAVE_ADSR,
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.92,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_WAVE_TRIANGLE: Instrument = {
  name: 'Demo Wave Triangle',
  wave_table: TRIANGLE_TABLE,
  adsr: DEMO_WAVE_ADSR,
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_WAVE_SQUARE: Instrument = {
  name: 'Demo Wave Square',
  wave_table: SQUARE_TABLE,
  adsr: DEMO_WAVE_ADSR,
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.60,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_WAVE_SAW: Instrument = {
  name: 'Demo Wave Saw',
  wave_table: SAW_TABLE,
  adsr: DEMO_WAVE_ADSR,
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_WAVE_BRIGHTTRI: Instrument = {
  name: 'Demo Wave Bright Tri',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: DEMO_WAVE_ADSR,
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.78,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_WAVE_WARMTRI: Instrument = {
  name: 'Demo Wave Warm Tri',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: DEMO_WAVE_ADSR,
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.78,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_ADSR_STACCATO: Instrument = {
  name: 'Demo ADSR Staccato',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 80, sustain_level: 0.50, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_ADSR_LONGTAIL: Instrument = {
  name: 'Demo ADSR Long Release',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 60, sustain_level: 0.60, release_ms: 600 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_VIBRATO_LIGHT: Instrument = {
  name: 'Demo Vibrato Light',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 200, decay_ms: 300, sustain_level: 0.85, release_ms: 400 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.002,
  vibrato_freq: 3.0
};

export const INST_DEMO_VIBRATO_MEDIUM: Instrument = {
  name: 'Demo Vibrato Medium',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 200, decay_ms: 300, sustain_level: 0.85, release_ms: 400 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.006,
  vibrato_freq: 5.0
};

export const INST_DEMO_VIBRATO_DEEP: Instrument = {
  name: 'Demo Vibrato Deep',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 200, decay_ms: 300, sustain_level: 0.85, release_ms: 400 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.014,
  vibrato_freq: 7.0
};

export const INST_DEMO_ARPEG_M3: Instrument = {
  name: 'Demo Arpeg Maj 3rd',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 10, decay_ms: 150, sustain_level: 0.70, release_ms: 150 },
  arpeg: { active: true, semitones: 4, speed: 6 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_ARPEG_P5: Instrument = {
  name: 'Demo Arpeg Perf 5th',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 10, decay_ms: 150, sustain_level: 0.70, release_ms: 150 },
  arpeg: { active: true, semitones: 7, speed: 8 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_ARPEG_OCT: Instrument = {
  name: 'Demo Arpeg Octave',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 10, decay_ms: 150, sustain_level: 0.70, release_ms: 150 },
  arpeg: { active: true, semitones: 12, speed: 10 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_LIMITER_ROOT: Instrument = {
  name: 'Demo Limiter Root',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 50, sustain_level: 0.95, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 1.0,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_LIMITER_THIRD: Instrument = {
  name: 'Demo Limiter Third',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 5, decay_ms: 50, sustain_level: 0.95, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 1.0,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_LIMITER_FIFTH: Instrument = {
  name: 'Demo Limiter Fifth',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 50, sustain_level: 0.95, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 1.0,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_DELAY_PLUCK: Instrument = {
  name: 'Demo Delay Pluck',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 4, decay_ms: 140, sustain_level: 0.15, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DEMO_FULL_LEAD: Instrument = {
  name: 'Demo Full Lead',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 15, decay_ms: 150, sustain_level: 0.70, release_ms: 250 },
  arpeg: { active: true, semitones: 7, speed: 5 },
  volume: 0.85,
  vibrato_depth: 0.006,
  vibrato_freq: 5.0
};

export const INST_DEMO_FULL_HARMONY: Instrument = {
  name: 'Demo Full Harmony',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 200, sustain_level: 0.60, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.50,
  vibrato_depth: 0.003,
  vibrato_freq: 3.0
};

export const INST_DEMO_FULL_BASS: Instrument = {
  name: 'Demo Full Bass',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 120, sustain_level: 0.85, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_GUITAR_BASS: Instrument = {
  name: 'Acoustic Guitar Bass',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 6, decay_ms: 500, sustain_level: 0.12, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_GUITAR_MID: Instrument = {
  name: 'Acoustic Guitar Mid',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 4, decay_ms: 400, sustain_level: 0.10, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.0015,
  vibrato_freq: 4.5
};

export const INST_GUITAR_HIGH: Instrument = {
  name: 'Acoustic Guitar High',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 350, sustain_level: 0.08, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.002,
  vibrato_freq: 5.0
};

export const INST_BELL_FUNDAMENTAL: Instrument = {
  name: 'Tubular Bell Fundamental',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 700, sustain_level: 0.15, release_ms: 750 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_BELL_STRIKE_M5: Instrument = {
  name: 'Tubular Bell Strike M5',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 1, decay_ms: 500, sustain_level: 0.05, release_ms: 600 },
  arpeg: { active: true, semitones: 7, speed: 2 },
  volume: 0.75,
  vibrato_depth: 0.001,
  vibrato_freq: 3.0
};

export const INST_BELL_HIGH_OCT: Instrument = {
  name: 'Tubular Bell High Oct',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 1, decay_ms: 400, sustain_level: 0.02, release_ms: 450 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_BELL_SUB: Instrument = {
  name: 'Tubular Bell Sub',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 750, sustain_level: 0.10, release_ms: 750 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_PIANO_BASS: Instrument = {
  name: 'Piano Bass',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 450, sustain_level: 0.28, release_ms: 350 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_PIANO_CHORD: Instrument = {
  name: 'Piano Chord',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 4, decay_ms: 400, sustain_level: 0.25, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_PIANO_TREBLE: Instrument = {
  name: 'Piano Treble',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 350, sustain_level: 0.20, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.001,
  vibrato_freq: 4.0
};

export const INST_TRUMPET_LEAD: Instrument = {
  name: 'Trumpet Lead',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 35, decay_ms: 120, sustain_level: 0.85, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.007,
  vibrato_freq: 5.8
};

export const INST_TRUMPET_SECTION: Instrument = {
  name: 'Trumpet Section',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 45, decay_ms: 140, sustain_level: 0.80, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.68,
  vibrato_depth: 0.004,
  vibrato_freq: 5.4
};

export const INST_FRENCH_HORN: Instrument = {
  name: 'French Horn',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 60, decay_ms: 160, sustain_level: 0.82, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.002,
  vibrato_freq: 4.8
};

export const INST_VIOLIN_SOLO: Instrument = {
  name: 'Violin Solo',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 110, decay_ms: 180, sustain_level: 0.88, release_ms: 220 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.82,
  vibrato_depth: 0.009,
  vibrato_freq: 5.5
};

export const INST_VIOLA_WARM: Instrument = {
  name: 'Viola Warm',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 140, decay_ms: 200, sustain_level: 0.85, release_ms: 240 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.004,
  vibrato_freq: 5.0
};

export const INST_CELLO_BODY: Instrument = {
  name: 'Cello Body',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 160, decay_ms: 220, sustain_level: 0.85, release_ms: 260 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.002,
  vibrato_freq: 4.5
};

export const INST_BASS_PIZZ_WOOD: Instrument = {
  name: 'Double Bass Pizz Wood',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 8, decay_ms: 320, sustain_level: 0.22, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.95,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_BASS_SUB_BODY: Instrument = {
  name: 'Bass Sub Body',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 12, decay_ms: 380, sustain_level: 0.25, release_ms: 240 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.88,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_BASS_ATTACK: Instrument = {
  name: 'Bass Attack',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 80, sustain_level: 0.02, release_ms: 60 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.55,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_ORGAN_16FT: Instrument = {
  name: 'Organ 16ft',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 50, sustain_level: 0.95, release_ms: 50 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_ORGAN_8FT: Instrument = {
  name: 'Organ 8ft',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 6, decay_ms: 60, sustain_level: 0.90, release_ms: 60 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.001,
  vibrato_freq: 5.0
};

export const INST_ORGAN_4FT: Instrument = {
  name: 'Organ 4ft',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 50, sustain_level: 0.85, release_ms: 50 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_ORGAN_MIXTURE: Instrument = {
  name: 'Organ Mixture',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 4, decay_ms: 40, sustain_level: 0.80, release_ms: 40 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.55,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MARIMBA_LOW: Instrument = {
  name: 'Marimba Low',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 380, sustain_level: 0.0, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MARIMBA_MID: Instrument = {
  name: 'Marimba Mid',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 300, sustain_level: 0.0, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MARIMBA_HIGH: Instrument = {
  name: 'Marimba High',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 1, decay_ms: 240, sustain_level: 0.0, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_HARPSICHORD_BASS: Instrument = {
  name: 'Harpsichord Bass',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 2, decay_ms: 300, sustain_level: 0.05, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_HARPSICHORD_MID: Instrument = {
  name: 'Harpsichord Mid',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 240, sustain_level: 0.04, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_HARPSICHORD_TREB: Instrument = {
  name: 'Harpsichord Treble',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 1, decay_ms: 200, sustain_level: 0.03, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_FLUTE_SOLO: Instrument = {
  name: 'Flute Solo',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 60, decay_ms: 160, sustain_level: 0.85, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.82,
  vibrato_depth: 0.007,
  vibrato_freq: 5.2
};

export const INST_FLUTE_TENOR: Instrument = {
  name: 'Flute Tenor',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 70, decay_ms: 180, sustain_level: 0.82, release_ms: 220 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.004,
  vibrato_freq: 5.0
};

export const INST_FLUTE_BASS: Instrument = {
  name: 'Flute Bass',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 80, decay_ms: 200, sustain_level: 0.80, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.002,
  vibrato_freq: 4.5
};

export const INST_ACCORDION_LEAD: Instrument = {
  name: 'Accordion Lead',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 25, decay_ms: 120, sustain_level: 0.88, release_ms: 80 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.005,
  vibrato_freq: 6.2
};

export const INST_ACCORDION_REED2: Instrument = {
  name: 'Accordion Reed 2',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 25, decay_ms: 120, sustain_level: 0.85, release_ms: 80 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.003,
  vibrato_freq: 5.8
};

export const INST_ACCORDION_BASS: Instrument = {
  name: 'Accordion Bass',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 20, decay_ms: 100, sustain_level: 0.80, release_ms: 70 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

// --- Sentiment Instruments ---

export const INST_UKULELE_LEAD: Instrument = {
  name: 'Ukulele Lead',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 120, sustain_level: 0.40, release_ms: 250 },
  arpeg: { active: true, semitones: 4, speed: 1 },
  volume: 0.82,
  vibrato_depth: 0.025,
  vibrato_freq: 6.0
};

export const INST_GLOCKENSPIEL: Instrument = {
  name: 'Glockenspiel',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 200, sustain_level: 0.20, release_ms: 400 },
  arpeg: { active: true, semitones: 7, speed: 2 },
  volume: 0.75,
  vibrato_depth: 0.015,
  vibrato_freq: 7.0
};

export const INST_WARM_SHIMMER_PAD: Instrument = {
  name: 'Warm Shimmer Pad',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 250, sustain_level: 0.70, release_ms: 800 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.008,
  vibrato_freq: 4.5
};

export const INST_UKULELE_BASS: Instrument = {
  name: 'Ukulele Bass',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 150, sustain_level: 0.50, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.78,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MELANCHOLIC_CELLO: Instrument = {
  name: 'Melancholic Cello',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 120, decay_ms: 250, sustain_level: 0.40, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.009,
  vibrato_freq: 6.0
};

export const INST_DISTORTED_GUITAR: Instrument = {
  name: 'Distorted Guitar',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 0, decay_ms: 80, sustain_level: 0.80, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.95,
  vibrato_depth: 0.040,
  vibrato_freq: 20.0
};

export const INST_SNAPPING_SNARE: Instrument = {
  name: 'Snapping Snare Body',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 60, sustain_level: 0.70, release_ms: 80 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.045,
  vibrato_freq: 22.0
};

export const INST_ABRASIVE_NOISE: Instrument = {
  name: 'Abrasive Noise Tone',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 70, sustain_level: 0.75, release_ms: 90 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.050,
  vibrato_freq: 25.0
};

export const INST_FURY_SUB: Instrument = {
  name: 'Fury Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 90, sustain_level: 0.90, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.98,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_FRANTIC_ALARM: Instrument = {
  name: 'Frantic Alarm',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 0, decay_ms: 50, sustain_level: 0.20, release_ms: 10 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.040,
  vibrato_freq: 18.0
};

export const INST_SCUTTLING_SCRAPE: Instrument = {
  name: 'Scuttling Scrape',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 40, sustain_level: 0.15, release_ms: 10 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.045,
  vibrato_freq: 20.0
};

export const INST_ADRENALINE_CLUSTER: Instrument = {
  name: 'Adrenaline Cluster',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 45, sustain_level: 0.18, release_ms: 10 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.035,
  vibrato_freq: 16.0
};

export const INST_ADRENALINE_SUB: Instrument = {
  name: 'Adrenaline Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 60, sustain_level: 0.10, release_ms: 5 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.95,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_CONFIDENCE_BRASS: Instrument = {
  name: 'Confidence Brass',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 5, decay_ms: 120, sustain_level: 0.75, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.002,
  vibrato_freq: 3.0
};

export const INST_CONFIDENCE_HORN: Instrument = {
  name: 'Confidence Horn',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 8, decay_ms: 140, sustain_level: 0.70, release_ms: 160 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.003,
  vibrato_freq: 3.5
};

export const INST_CONFIDENCE_STACK: Instrument = {
  name: 'Confidence Stack',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 6, decay_ms: 130, sustain_level: 0.80, release_ms: 140 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.001,
  vibrato_freq: 2.5
};

export const INST_CONFIDENCE_SUB: Instrument = {
  name: 'Confidence Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 4, decay_ms: 100, sustain_level: 0.85, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MUTED_PIZZ: Instrument = {
  name: 'Muted Pizz',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 25, decay_ms: 150, sustain_level: 0.30, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.003,
  vibrato_freq: 4.0
};

export const INST_DETUNED_SYNTH: Instrument = {
  name: 'Detuned Synth',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 30, decay_ms: 200, sustain_level: 0.40, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.012,
  vibrato_freq: 6.5
};

export const INST_DOUBT_SUSPENSION: Instrument = {
  name: 'Doubt Suspension',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 180, sustain_level: 0.35, release_ms: 220 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.008,
  vibrato_freq: 5.0
};

export const INST_DOUBT_SUB: Instrument = {
  name: 'Doubt Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 15, decay_ms: 100, sustain_level: 0.50, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_FATIGUE_EPICANO: Instrument = {
  name: 'Fatigue Electric Piano',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 250, sustain_level: 0.20, release_ms: 350 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.008,
  vibrato_freq: 4.5
};

export const INST_FATIGUE_CHORD_STACK: Instrument = {
  name: 'Fatigue Chord Stack',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 50, decay_ms: 300, sustain_level: 0.15, release_ms: 400 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.010,
  vibrato_freq: 5.0
};

export const INST_FATIGUE_MUTED: Instrument = {
  name: 'Fatigue Muted',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 35, decay_ms: 200, sustain_level: 0.25, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.006,
  vibrato_freq: 4.0
};

export const INST_FATIGUE_THUD: Instrument = {
  name: 'Fatigue Thud',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 180, sustain_level: 0.10, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_FESTIVE_PARTY_HORN: Instrument = {
  name: 'Festive Party Horn',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 2, decay_ms: 80, sustain_level: 0.70, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.005,
  vibrato_freq: 5.0
};

export const INST_WIND_CHIMES: Instrument = {
  name: 'Wind Chimes',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 1, decay_ms: 60, sustain_level: 0.40, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.010,
  vibrato_freq: 8.0
};

export const INST_SYNTH_SPARKLE: Instrument = {
  name: 'Synth Sparkle',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 70, sustain_level: 0.60, release_ms: 110 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.008,
  vibrato_freq: 7.0
};

export const INST_MAJOR_TRIAD_STACK: Instrument = {
  name: 'Major Triad Stack',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 90, sustain_level: 0.65, release_ms: 130 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.003,
  vibrato_freq: 4.0
};

export const INST_FRAGILE_HARP: Instrument = {
  name: 'Fragile Harp',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 80, decay_ms: 250, sustain_level: 0.20, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.008,
  vibrato_freq: 6.5
};

export const INST_DIGITAL_GLASS_EXPLOSION: Instrument = {
  name: 'Digital Glass Explosion',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 0, decay_ms: 40, sustain_level: 0.20, release_ms: 5 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.95,
  vibrato_depth: 0.040,
  vibrato_freq: 22.0
};

export const INST_VIBRATING_SUB_THUD: Instrument = {
  name: 'Vibrating Sub Thud',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 80, sustain_level: 0.40, release_ms: 10 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.98,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_POLYCHORD_CLUSTER: Instrument = {
  name: 'Polychord Cluster',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 50, sustain_level: 0.25, release_ms: 8 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.035,
  vibrato_freq: 18.0
};

export const INST_HIGH_PASS_SNAP: Instrument = {
  name: 'High Pass Snap',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 0, decay_ms: 45, sustain_level: 0.15, release_ms: 6 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.045,
  vibrato_freq: 20.0
};

export const INST_TENDER_GUITAR: Instrument = {
  name: 'Tender Guitar',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 15, decay_ms: 100, sustain_level: 0.40, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.002,
  vibrato_freq: 4.5
};

export const INST_TENDER_MUSICBOX: Instrument = {
  name: 'Tender Music Box',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 10, decay_ms: 150, sustain_level: 0.30, release_ms: 250 },
  arpeg: { active: true, semitones: 4, speed: 1 },
  volume: 0.75,
  vibrato_depth: 0.004,
  vibrato_freq: 5.0
};

export const INST_TENDER_PAD: Instrument = {
  name: 'Tender Pad',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 200, sustain_level: 0.70, release_ms: 350 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.003,
  vibrato_freq: 4.0
};

export const INST_BONE_CHILL_CHIME: Instrument = {
  name: 'Bone Chill Chime',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 10, decay_ms: 80, sustain_level: 0.50, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.95,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_BOREDOM_DRONE: Instrument = {
  name: 'Boredom Drone',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 100, sustain_level: 0.50, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.60,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MISCHIEF_PIZZ: Instrument = {
  name: 'Mischief Pizz',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 60, sustain_level: 0.20, release_ms: 80 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.020,
  vibrato_freq: 10.0
};

export const INST_CARTOON_WOODWIND: Instrument = {
  name: 'Cartoon Woodwind',
  wave_table: SQUARE_TABLE,
  adsr: { attack_ms: 3, decay_ms: 50, sustain_level: 0.15, release_ms: 70 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.025,
  vibrato_freq: 12.0
};

export const INST_MISCHIEF_STACK: Instrument = {
  name: 'Mischief Stack',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 4, decay_ms: 70, sustain_level: 0.25, release_ms: 90 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.015,
  vibrato_freq: 8.0
};

export const INST_MISCHIEF_SUB: Instrument = {
  name: 'Mischief Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 2, decay_ms: 80, sustain_level: 0.30, release_ms: 100 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MUTED_GUITAR: Instrument = {
  name: 'Muted Guitar',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 30, decay_ms: 200, sustain_level: 0.20, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.010,
  vibrato_freq: 4.0
};

export const INST_BREATHY_SIGH: Instrument = {
  name: 'Breathy Sigh',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 250, sustain_level: 0.15, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.015,
  vibrato_freq: 5.0
};

export const INST_RESIGNATION_PAD: Instrument = {
  name: 'Resignation Pad',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 35, decay_ms: 220, sustain_level: 0.25, release_ms: 280 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.012,
  vibrato_freq: 4.5
};

export const INST_RESIGNATION_SUB: Instrument = {
  name: 'Resignation Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 150, sustain_level: 0.10, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_MUTED_HARP: Instrument = {
  name: 'Muted Harp',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 30, decay_ms: 200, sustain_level: 0.20, release_ms: 250 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.008,
  vibrato_freq: 5.0
};

export const INST_SHIMMERING_MUSIC_BOX: Instrument = {
  name: 'Shimmering Music Box',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 150, sustain_level: 0.15, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.010,
  vibrato_freq: 6.0
};

export const INST_MYSTERY_PAD: Instrument = {
  name: 'Mystery Pad',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 250, sustain_level: 0.25, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.65,
  vibrato_depth: 0.006,
  vibrato_freq: 4.0
};

export const INST_MYSTERY_SUB: Instrument = {
  name: 'Mystery Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 25, decay_ms: 180, sustain_level: 0.10, release_ms: 220 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_DREAD_DOUBLE_BASS: Instrument = {
  name: 'Dread Double Bass',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: { attack_ms: 40, decay_ms: 250, sustain_level: 0.40, release_ms: 300 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.015,
  vibrato_freq: 7.0
};

export const INST_SUB_BASS_DRONE: Instrument = {
  name: 'Sub Bass Drone',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 50, decay_ms: 300, sustain_level: 0.50, release_ms: 350 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_CREEPING_SCRAPE: Instrument = {
  name: 'Creeping Scrape',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 45, decay_ms: 280, sustain_level: 0.35, release_ms: 320 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.020,
  vibrato_freq: 8.5
};

export const INST_DOOM_CLUSTER: Instrument = {
  name: 'Doom Cluster',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 35, decay_ms: 220, sustain_level: 0.45, release_ms: 280 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.70,
  vibrato_depth: 0.010,
  vibrato_freq: 6.0
};

export const INST_CATHEDRAL_ORGAN: Instrument = {
  name: 'Cathedral Organ',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 10, decay_ms: 100, sustain_level: 0.70, release_ms: 150 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.005,
  vibrato_freq: 5.0
};

export const INST_GLASS_HARP_SWEEP: Instrument = {
  name: 'Glass Harp Sweep',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 5, decay_ms: 80, sustain_level: 0.50, release_ms: 120 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.008,
  vibrato_freq: 7.0
};

export const INST_AWE_PAD: Instrument = {
  name: 'Awe Pad',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 15, decay_ms: 120, sustain_level: 0.80, release_ms: 180 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.003,
  vibrato_freq: 4.0
};

export const INST_AWE_SUB: Instrument = {
  name: 'Awe Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 8, decay_ms: 90, sustain_level: 0.90, release_ms: 140 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};

export const INST_SUPERSONIC_BLADE: Instrument = {
  name: 'Supersonic Blade',
  wave_table: SAW_TABLE,
  adsr: { attack_ms: 0, decay_ms: 30, sustain_level: 0.10, release_ms: 5 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.95,
  vibrato_depth: 0.045,
  vibrato_freq: 24.0
};

export const INST_CRYSTAL_BOWL: Instrument = {
  name: 'Crystal Bowl',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 20, decay_ms: 150, sustain_level: 0.80, release_ms: 200 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.85,
  vibrato_depth: 0.002,
  vibrato_freq: 1.5
};

export const INST_ANALOG_PAD_MURMUR: Instrument = {
  name: 'Analog Pad Murmur',
  wave_table: TRIANGLE_TABLE,
  adsr: { attack_ms: 30, decay_ms: 180, sustain_level: 0.70, release_ms: 220 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.80,
  vibrato_depth: 0.003,
  vibrato_freq: 2.0
};

export const INST_SERENITY_STACK: Instrument = {
  name: 'Serenity Stack',
  wave_table: BRIGHT_TRIANGLE_TABLE,
  adsr: { attack_ms: 25, decay_ms: 160, sustain_level: 0.75, release_ms: 210 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.75,
  vibrato_depth: 0.002,
  vibrato_freq: 1.8
};

export const INST_SERENITY_SUB: Instrument = {
  name: 'Serenity Sub',
  wave_table: SINE_TABLE,
  adsr: { attack_ms: 15, decay_ms: 120, sustain_level: 0.90, release_ms: 160 },
  arpeg: { active: false, semitones: 0, speed: 0 },
  volume: 0.90,
  vibrato_depth: 0.0,
  vibrato_freq: 0.0
};
