import { PercussionType, VoiceType, type Song, type Voice } from '../types/synth';
import * as Inst from './instruments';

// =============================================================================
// DEMO SONGS (29 Feature Showcase Songs from demo.h)
// =============================================================================

const melody_demo_wave = [0];
const rhythm_demo_wave = [1];

function createWaveDemoVoice(inst: any): Voice[] {
  return [{ type: VoiceType.MELODY, sequence: melody_demo_wave, rhythm: rhythm_demo_wave, total_steps: 1, instrument: inst }];
}

export const song_demo_wave_sine: Song = {
  voices: createWaveDemoVoice(Inst.INST_DEMO_WAVE_SINE),
  total_voices: 1, tonic: 60, bpm: 50, title: '1.1 WAVE: SINE'
};
export const song_demo_wave_triangle: Song = {
  voices: createWaveDemoVoice(Inst.INST_DEMO_WAVE_TRIANGLE),
  total_voices: 1, tonic: 60, bpm: 50, title: '1.2 WAVE: TRIANGLE'
};
export const song_demo_wave_square: Song = {
  voices: createWaveDemoVoice(Inst.INST_DEMO_WAVE_SQUARE),
  total_voices: 1, tonic: 60, bpm: 50, title: '1.3 WAVE: SQUARE'
};
export const song_demo_wave_saw: Song = {
  voices: createWaveDemoVoice(Inst.INST_DEMO_WAVE_SAW),
  total_voices: 1, tonic: 60, bpm: 50, title: '1.4 WAVE: SAWTOOTH'
};
export const song_demo_wave_brighttri: Song = {
  voices: createWaveDemoVoice(Inst.INST_DEMO_WAVE_BRIGHTTRI),
  total_voices: 1, tonic: 60, bpm: 50, title: '1.5 WAVE: BRIGHT TRI'
};
export const song_demo_wave_warmtri: Song = {
  voices: createWaveDemoVoice(Inst.INST_DEMO_WAVE_WARMTRI),
  total_voices: 1, tonic: 60, bpm: 50, title: '1.6 WAVE: WARM TRI'
};

const melody_demo_adsr = [4, 4, 4, 4, 4, 4, 4, 4];
const rhythm_demo_adsr = [8, 8, 8, 8, 8, 8, 8, 8];

export const song_demo_adsr_staccato: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_adsr, rhythm: rhythm_demo_adsr, total_steps: 8, instrument: Inst.INST_DEMO_ADSR_STACCATO }],
  total_voices: 1, tonic: 60, bpm: 140, title: '2.1 ADSR: STACCATO'
};

export const song_demo_adsr_longtail: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_adsr, rhythm: rhythm_demo_adsr, total_steps: 8, instrument: Inst.INST_DEMO_ADSR_LONGTAIL }],
  total_voices: 1, tonic: 60, bpm: 130, title: '2.2 ADSR: LONG RELEASE'
};

const melody_demo_vibrato = [0, 4, 7, 12, 7, 4, 0];
const rhythm_demo_vibrato = [4, 4, 4, 4, 4, 4, 4];

export const song_demo_vibrato_light: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_vibrato, rhythm: rhythm_demo_vibrato, total_steps: 7, instrument: Inst.INST_DEMO_VIBRATO_LIGHT }],
  total_voices: 1, tonic: 60, bpm: 68, title: '3.1 VIBRATO: LIGHT'
};
export const song_demo_vibrato_medium: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_vibrato, rhythm: rhythm_demo_vibrato, total_steps: 7, instrument: Inst.INST_DEMO_VIBRATO_MEDIUM }],
  total_voices: 1, tonic: 60, bpm: 68, title: '3.2 VIBRATO: MEDIUM'
};
export const song_demo_vibrato_deep: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_vibrato, rhythm: rhythm_demo_vibrato, total_steps: 7, instrument: Inst.INST_DEMO_VIBRATO_DEEP }],
  total_voices: 1, tonic: 60, bpm: 68, title: '3.3 VIBRATO: DEEP+FAST'
};

const melody_demo_arpeg = [0, 0, 0, 0];
const rhythm_demo_arpeg = [2, 2, 2, 2];

export const song_demo_arpeg_m3: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_arpeg, rhythm: rhythm_demo_arpeg, total_steps: 4, instrument: Inst.INST_DEMO_ARPEG_M3 }],
  total_voices: 1, tonic: 60, bpm: 90, title: '4.1 ARPEGGIO: MAJ 3RD'
};
export const song_demo_arpeg_p5: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_arpeg, rhythm: rhythm_demo_arpeg, total_steps: 4, instrument: Inst.INST_DEMO_ARPEG_P5 }],
  total_voices: 1, tonic: 60, bpm: 90, title: '4.2 ARPEGGIO: PERF 5TH'
};
export const song_demo_arpeg_oct: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_arpeg, rhythm: rhythm_demo_arpeg, total_steps: 4, instrument: Inst.INST_DEMO_ARPEG_OCT }],
  total_voices: 1, tonic: 60, bpm: 90, title: '4.3 ARPEGGIO: OCTAVE'
};

const percussion_demo_suite = [
  PercussionType.KICK,
  PercussionType.SNARE,
  PercussionType.HIHAT_CLOSED,
  PercussionType.HIHAT_OPEN,
  PercussionType.CLAP,
  PercussionType.TOM_LOW,
  PercussionType.TOM_MID,
  PercussionType.TOM_HIGH,
  PercussionType.CRASH
];
const rhythm_demo_suite = [4, 4, 4, 4, 4, 4, 4, 4, 4];

export const song_demo_percussion: Song = {
  voices: [{ type: VoiceType.PERCUSSION, sequence: percussion_demo_suite, rhythm: rhythm_demo_suite, total_steps: 9, instrument: null }],
  total_voices: 1, tonic: 60, bpm: 100, title: '5.1 PERCUSSION SUITE'
};

const melody_demo_limiter_root = [0, 0, 0, 0];
const melody_demo_limiter_third = [4, 4, 4, 4];
const melody_demo_limiter_fifth = [7, 7, 7, 7];
const rhythm_demo_limiter = [2, 2, 2, 2];
const percussion_demo_limiter = [PercussionType.CRASH, PercussionType.KICK, PercussionType.CRASH, PercussionType.KICK];

export const song_demo_limiter: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: melody_demo_limiter_root, rhythm: rhythm_demo_limiter, total_steps: 4, instrument: Inst.INST_DEMO_LIMITER_ROOT },
    { type: VoiceType.MELODY, sequence: melody_demo_limiter_third, rhythm: rhythm_demo_limiter, total_steps: 4, instrument: Inst.INST_DEMO_LIMITER_THIRD },
    { type: VoiceType.MELODY, sequence: melody_demo_limiter_fifth, rhythm: rhythm_demo_limiter, total_steps: 4, instrument: Inst.INST_DEMO_LIMITER_FIFTH },
    { type: VoiceType.PERCUSSION, sequence: percussion_demo_limiter, rhythm: rhythm_demo_limiter, total_steps: 4, instrument: null }
  ],
  total_voices: 4, tonic: 60, bpm: 100, title: '6.1 LIMITER: MAX CHORD'
};

const melody_demo_delay = [0, 7, 12, 14, 12, 7];
const rhythm_demo_delay = [8, 8, 8, 8, 8, 8];

export const song_demo_delay: Song = {
  voices: [{ type: VoiceType.MELODY, sequence: melody_demo_delay, rhythm: rhythm_demo_delay, total_steps: 6, instrument: Inst.INST_DEMO_DELAY_PLUCK }],
  total_voices: 1, tonic: 60, bpm: 120, title: '7.1 DELAY: ECHO TAIL'
};

const melody_demo_full_lead = [0, 4, 7, 12, 7, 4, 0, 4];
const melody_demo_full_harmony = [7, 11, 14, 11, 12, 11, 7, 11];
const melody_demo_full_bass = [-12, -12, -5, -5, -7, -7, -12, -12];
const rhythm_demo_full = [4, 4, 4, 4, 4, 4, 4, 4];
const percussion_demo_full = [
  PercussionType.KICK, PercussionType.HIHAT_CLOSED,
  PercussionType.SNARE, PercussionType.HIHAT_CLOSED,
  PercussionType.KICK, PercussionType.HIHAT_CLOSED,
  PercussionType.SNARE, PercussionType.CRASH
];

export const song_demo_full_mix: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: melody_demo_full_lead, rhythm: rhythm_demo_full, total_steps: 8, instrument: Inst.INST_DEMO_FULL_LEAD },
    { type: VoiceType.MELODY, sequence: melody_demo_full_harmony, rhythm: rhythm_demo_full, total_steps: 8, instrument: Inst.INST_DEMO_FULL_HARMONY },
    { type: VoiceType.MELODY, sequence: melody_demo_full_bass, rhythm: rhythm_demo_full, total_steps: 8, instrument: Inst.INST_DEMO_FULL_BASS },
    { type: VoiceType.PERCUSSION, sequence: percussion_demo_full, rhythm: rhythm_demo_full, total_steps: 8, instrument: null }
  ],
  total_voices: 4, tonic: 60, bpm: 120, title: '8.1 FULL MIX + RF TX'
};

export const song_demo_guitar: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [-12, -12, -12, -12, -12, -12], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_GUITAR_BASS },
    { type: VoiceType.MELODY, sequence: [-5, -5, -5, -5, -5, -5], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_GUITAR_MID },
    { type: VoiceType.MELODY, sequence: [3, 3, 3, 3, 3, 3], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_GUITAR_MID },
    { type: VoiceType.MELODY, sequence: [7, 12, 10, 7, 3, 0], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_GUITAR_HIGH }
  ],
  total_voices: 4, tonic: 52, bpm: 120, title: '9.1 GUITAR'
};

export const song_demo_tubular_bells: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [4, 0], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_BELL_FUNDAMENTAL },
    { type: VoiceType.MELODY, sequence: [11, 7], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_BELL_STRIKE_M5 },
    { type: VoiceType.MELODY, sequence: [16, 12], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_BELL_HIGH_OCT },
    { type: VoiceType.MELODY, sequence: [-8, -12], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_BELL_SUB }
  ],
  total_voices: 4, tonic: 72, bpm: 80, title: '9.2 TUBULAR BELLS'
};

export const song_demo_piano: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [-12, -12, -5], rhythm: [4, 4, 4], total_steps: 3, instrument: Inst.INST_PIANO_BASS },
    { type: VoiceType.MELODY, sequence: [7, 7, 7], rhythm: [4, 4, 4], total_steps: 3, instrument: Inst.INST_PIANO_CHORD },
    { type: VoiceType.MELODY, sequence: [16, 16, 16], rhythm: [4, 4, 4], total_steps: 3, instrument: Inst.INST_PIANO_CHORD },
    { type: VoiceType.MELODY, sequence: [23, 24, 19], rhythm: [4, 4, 4], total_steps: 3, instrument: Inst.INST_PIANO_TREBLE }
  ],
  total_voices: 4, tonic: 48, bpm: 110, title: '9.3 PIANO'
};

export const song_demo_trumpet: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 12], rhythm: [8, 8, 8, 2], total_steps: 4, instrument: Inst.INST_TRUMPET_LEAD },
    { type: VoiceType.MELODY, sequence: [0, 0, 4, 7], rhythm: [8, 8, 8, 2], total_steps: 4, instrument: Inst.INST_TRUMPET_SECTION },
    { type: VoiceType.MELODY, sequence: [-5, -5, 0, 4], rhythm: [8, 8, 8, 2], total_steps: 4, instrument: Inst.INST_TRUMPET_SECTION },
    { type: VoiceType.MELODY, sequence: [-12, -12, -5, 0], rhythm: [8, 8, 8, 2], total_steps: 4, instrument: Inst.INST_FRENCH_HORN }
  ],
  total_voices: 4, tonic: 58, bpm: 130, title: '9.4 TRUMPET'
};

export const song_demo_violin: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [5, 7], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_VIOLIN_SOLO },
    { type: VoiceType.MELODY, sequence: [0, 2], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_VIOLA_WARM },
    { type: VoiceType.MELODY, sequence: [-4, -2], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_VIOLA_WARM },
    { type: VoiceType.MELODY, sequence: [-17, -19], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_CELLO_BODY }
  ],
  total_voices: 4, tonic: 69, bpm: 80, title: '9.5 VIOLIN'
};

export const song_demo_contrabass: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 3, 5, 6], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_BASS_PIZZ_WOOD },
    { type: VoiceType.MELODY, sequence: [0, 3, 5, 6], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_BASS_SUB_BODY },
    { type: VoiceType.MELODY, sequence: [0, 3, 5, 6], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_BASS_ATTACK },
    { type: VoiceType.MELODY, sequence: [-12, -12, -7, -7], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_BASS_SUB_BODY }
  ],
  total_voices: 4, tonic: 40, bpm: 135, title: '9.6 DOUBLE BASS'
};

export const song_demo_pipe_organ: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [-12, -7], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_ORGAN_16FT },
    { type: VoiceType.MELODY, sequence: [0, 5], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_ORGAN_8FT },
    { type: VoiceType.MELODY, sequence: [7, 9], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_ORGAN_4FT },
    { type: VoiceType.MELODY, sequence: [16, 17], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_ORGAN_MIXTURE }
  ],
  total_voices: 4, tonic: 60, bpm: 80, title: '10.1 PIPE ORGAN'
};

export const song_demo_marimba: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [-12, -12, -9, -9, -5, -5], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_MARIMBA_LOW },
    { type: VoiceType.MELODY, sequence: [0, 0, 0, 0, -1, -1], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_MARIMBA_MID },
    { type: VoiceType.MELODY, sequence: [4, 4, 4, 4, 2, 2], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_MARIMBA_MID },
    { type: VoiceType.MELODY, sequence: [7, 12, 9, 16, 11, 14], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_MARIMBA_HIGH }
  ],
  total_voices: 4, tonic: 60, bpm: 120, title: '10.2 MARIMBA'
};

export const song_demo_harpsichord: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [-12, -12, -10, -8, -7, -12], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_HARPSICHORD_BASS },
    { type: VoiceType.MELODY, sequence: [-5, -5, -5, -3, -2, -5], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_HARPSICHORD_MID },
    { type: VoiceType.MELODY, sequence: [0, 0, 2, 4, 5, 0], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_HARPSICHORD_MID },
    { type: VoiceType.MELODY, sequence: [12, 14, 16, 17, 16, 12], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_HARPSICHORD_TREB }
  ],
  total_voices: 4, tonic: 62, bpm: 120, title: '10.3 HARPSICHORD'
};

export const song_demo_flute: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [7, 5], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_FLUTE_SOLO },
    { type: VoiceType.MELODY, sequence: [4, 0], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_FLUTE_SOLO },
    { type: VoiceType.MELODY, sequence: [0, -3], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_FLUTE_TENOR },
    { type: VoiceType.MELODY, sequence: [-12, -7], rhythm: [2, 2], total_steps: 2, instrument: Inst.INST_FLUTE_BASS }
  ],
  total_voices: 4, tonic: 67, bpm: 80, title: '10.4 FLUTE CONSORT'
};

export const song_demo_accordion: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [12, 12, 11, 9, 8, 12], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_ACCORDION_LEAD },
    { type: VoiceType.MELODY, sequence: [3, 3, 3, 3, 3, 3], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_ACCORDION_REED2 },
    { type: VoiceType.MELODY, sequence: [7, 7, 7, 7, 7, 7], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_ACCORDION_REED2 },
    { type: VoiceType.MELODY, sequence: [-12, -12, -5, -5, -12, -12], rhythm: [8, 8, 8, 8, 8, 8], total_steps: 6, instrument: Inst.INST_ACCORDION_BASS }
  ],
  total_voices: 4, tonic: 57, bpm: 120, title: '10.5 ACCORDION'
};

export const DEMO_SONGS: Song[] = [
  song_demo_wave_sine,
  song_demo_wave_triangle,
  song_demo_wave_square,
  song_demo_wave_saw,
  song_demo_wave_brighttri,
  song_demo_wave_warmtri,
  song_demo_adsr_staccato,
  song_demo_adsr_longtail,
  song_demo_vibrato_light,
  song_demo_vibrato_medium,
  song_demo_vibrato_deep,
  song_demo_arpeg_m3,
  song_demo_arpeg_p5,
  song_demo_arpeg_oct,
  song_demo_percussion,
  song_demo_limiter,
  song_demo_delay,
  song_demo_full_mix,
  song_demo_guitar,
  song_demo_tubular_bells,
  song_demo_piano,
  song_demo_trumpet,
  song_demo_violin,
  song_demo_contrabass,
  song_demo_pipe_organ,
  song_demo_marimba,
  song_demo_harpsichord,
  song_demo_flute,
  song_demo_accordion
];

// =============================================================================
// PLAYER SONGS (20 Emotion & Sound Messenger Songs from emotions.h)
// =============================================================================

export const song_pure_joy: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 12, 7, 11, 14, 12, 9, 12, 16, 14, 5, 9, 12, 12], rhythm: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 16], total_steps: 16, instrument: Inst.INST_UKULELE_LEAD },
    { type: VoiceType.MELODY, sequence: [12, 16, 19, 24, 19, 23, 26, 24, 21, 24, 28, 26, 17, 21, 24, 24], rhythm: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 16], total_steps: 16, instrument: Inst.INST_GLOCKENSPIEL },
    { type: VoiceType.MELODY, sequence: [0, 7, 9, 5], rhythm: [16, 16, 16, 16], total_steps: 4, instrument: Inst.INST_WARM_SHIMMER_PAD },
    { type: VoiceType.MELODY, sequence: [-12, -5, -8, -12], rhythm: [16, 16, 16, 16], total_steps: 4, instrument: Inst.INST_UKULELE_BASS }
  ],
  total_voices: 4, tonic: 60, bpm: 160, title: 'PURE JOY'
};

export const song_melancholy: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [6, 5, 6, 1], rhythm: [8, 8, 8, 8], total_steps: 4, instrument: Inst.INST_MELANCHOLIC_CELLO }
  ],
  total_voices: 1, tonic: 57, bpm: 60, title: 'MELANCHOLY'
};

export const song_fury: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 1, 6, 7, 12, 13, 18, 19], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_DISTORTED_GUITAR },
    { type: VoiceType.MELODY, sequence: [6, 7, 12, 13, 18, 19, 24, 25], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_SNAPPING_SNARE },
    { type: VoiceType.MELODY, sequence: [1, 6, 7, 12, 13, 18, 19, 24], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_ABRASIVE_NOISE },
    { type: VoiceType.MELODY, sequence: [-12, -11, -6, -5, -12, -11, -6, -5], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_FURY_SUB }
  ],
  total_voices: 4, tonic: 48, bpm: 160, title: 'FURY'
};

export const song_panic: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [12, 13, 12, 13, 15, 16, 15, 16], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_FRANTIC_ALARM },
    { type: VoiceType.MELODY, sequence: [13, 12, 13, 12, 16, 15, 16, 15], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_ADRENALINE_CLUSTER },
    { type: VoiceType.MELODY, sequence: [18, 19, 18, 19, 21, 22, 21, 22], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_SCUTTLING_SCRAPE },
    { type: VoiceType.MELODY, sequence: [-12, -11, -12, -11, -12, -11, -12, -11], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_ADRENALINE_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 160, title: 'PANIC'
};

export const song_confidence: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CONFIDENCE_BRASS },
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CONFIDENCE_HORN },
    { type: VoiceType.MELODY, sequence: [7, 11, 14, 19], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CONFIDENCE_STACK },
    { type: VoiceType.MELODY, sequence: [-12, -12, -12, -12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CONFIDENCE_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 130, title: 'CONFIDENCE'
};

export const song_doubt: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [6, 4, 5, 3], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_DETUNED_SYNTH },
    { type: VoiceType.MELODY, sequence: [6, 5, 6, 4], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_DOUBT_SUSPENSION },
    { type: VoiceType.MELODY, sequence: [0, 6, 1, 5], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MUTED_PIZZ },
    { type: VoiceType.MELODY, sequence: [-12, -11, -12, -11], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_DOUBT_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 110, title: 'DOUBT'
};

export const song_fatigue: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, -1, -2, -4], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_FATIGUE_EPICANO },
    { type: VoiceType.MELODY, sequence: [3, 2, 1, -1], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_FATIGUE_CHORD_STACK },
    { type: VoiceType.MELODY, sequence: [-3, -4, -5, -7], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_FATIGUE_MUTED },
    { type: VoiceType.MELODY, sequence: [-12, -14, -15, -17], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_FATIGUE_THUD }
  ],
  total_voices: 4, tonic: 48, bpm: 100, title: 'FATIGUE'
};

export const song_celebration: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_FESTIVE_PARTY_HORN },
    { type: VoiceType.MELODY, sequence: [12, 16, 19, 24], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_WIND_CHIMES },
    { type: VoiceType.MELODY, sequence: [7, 11, 14, 19], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MAJOR_TRIAD_STACK },
    { type: VoiceType.MELODY, sequence: [19, 23, 26, 31], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_SYNTH_SPARKLE }
  ],
  total_voices: 4, tonic: 60, bpm: 160, title: 'CELEBRATION'
};

export const song_vulnerability: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 7, 4, 7], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_FRAGILE_HARP }
  ],
  total_voices: 1, tonic: 60, bpm: 110, title: 'VULNERABILITY'
};

export const song_shock: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 1, 12, 13, 0, 1, 12, 13], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_DIGITAL_GLASS_EXPLOSION },
    { type: VoiceType.MELODY, sequence: [6, 7, 18, 19, 6, 7, 18, 19], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_POLYCHORD_CLUSTER },
    { type: VoiceType.MELODY, sequence: [15, 16, 27, 28, 15, 16, 27, 28], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_HIGH_PASS_SNAP },
    { type: VoiceType.MELODY, sequence: [-12, -12, -12, -12, -12, -12, -12, -12], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_VIBRATING_SUB_THUD }
  ],
  total_voices: 4, tonic: 60, bpm: 160, title: 'SHOCK'
};

export const song_affection: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_TENDER_GUITAR },
    { type: VoiceType.MELODY, sequence: [12, 16, 19, 24], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_TENDER_MUSICBOX },
    { type: VoiceType.MELODY, sequence: [0, 7], rhythm: [8, 8], total_steps: 2, instrument: Inst.INST_TENDER_PAD }
  ],
  total_voices: 3, tonic: 60, bpm: 120, title: 'AFFECTION'
};

export const song_coldness: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [7, 0, 7, 0, 7, 0, 7, 0], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_BONE_CHILL_CHIME }
  ],
  total_voices: 1, tonic: 72, bpm: 160, title: 'COLDNESS'
};

export const song_tedium: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 0, 0, 0], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_BOREDOM_DRONE }
  ],
  total_voices: 1, tonic: 60, bpm: 150, title: 'BOREDOM'
};

export const song_mischief: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 1, 3, 4], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MISCHIEF_PIZZ },
    { type: VoiceType.MELODY, sequence: [12, 13, 15, 16], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CARTOON_WOODWIND },
    { type: VoiceType.MELODY, sequence: [1, 2, 4, 5], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MISCHIEF_STACK },
    { type: VoiceType.MELODY, sequence: [-12, -12, -12, -12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MISCHIEF_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 150, title: 'MISCHIEF'
};

export const song_resignation: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [3, 2, 1, 0], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MUTED_GUITAR },
    { type: VoiceType.MELODY, sequence: [3, 1, 0, -1], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_BREATHY_SIGH },
    { type: VoiceType.MELODY, sequence: [0, -1, -2, -3], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_RESIGNATION_PAD },
    { type: VoiceType.MELODY, sequence: [-12, -13, -14, -15], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_RESIGNATION_SUB }
  ],
  total_voices: 4, tonic: 48, bpm: 110, title: 'RESIGNATION'
};

export const song_mystery: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [6, 7, 6, 1], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MUTED_HARP },
    { type: VoiceType.MELODY, sequence: [18, 19, 18, 13], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_SHIMMERING_MUSIC_BOX },
    { type: VoiceType.MELODY, sequence: [1, 2, 1, -4], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MYSTERY_PAD },
    { type: VoiceType.MELODY, sequence: [-12, -11, -12, -17], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_MYSTERY_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 110, title: 'MYSTERY'
};

export const song_dread: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [6, 5, 4, 1], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_DREAD_DOUBLE_BASS },
    { type: VoiceType.MELODY, sequence: [6, 4, 2, -1], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CREEPING_SCRAPE },
    { type: VoiceType.MELODY, sequence: [0, -1, -2, -6], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_DOOM_CLUSTER },
    { type: VoiceType.MELODY, sequence: [-12, -13, -14, -18], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_SUB_BASS_DRONE }
  ],
  total_voices: 4, tonic: 48, bpm: 100, title: 'DREAD'
};

export const song_awe: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 11], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CATHEDRAL_ORGAN },
    { type: VoiceType.MELODY, sequence: [4, 7, 11, 16], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_GLASS_HARP_SWEEP },
    { type: VoiceType.MELODY, sequence: [12, 16, 19, 23], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_AWE_PAD },
    { type: VoiceType.MELODY, sequence: [-12, -12, -12, -12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_AWE_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 120, title: 'AWE'
};

export const song_speed: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [12, 18, 24, 36, 12, 18, 24, 36], rhythm: [2, 2, 2, 2, 2, 2, 2, 2], total_steps: 8, instrument: Inst.INST_SUPERSONIC_BLADE }
  ],
  total_voices: 1, tonic: 72, bpm: 160, title: 'SPEED'
};

export const song_serenity: Song = {
  voices: [
    { type: VoiceType.MELODY, sequence: [0, 4, 7, 14], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_CRYSTAL_BOWL },
    { type: VoiceType.MELODY, sequence: [12, 16, 19, 26], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_ANALOG_PAD_MURMUR },
    { type: VoiceType.MELODY, sequence: [7, 11, 14, 21], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_SERENITY_STACK },
    { type: VoiceType.MELODY, sequence: [-12, -12, -12, -12], rhythm: [4, 4, 4, 4], total_steps: 4, instrument: Inst.INST_SERENITY_SUB }
  ],
  total_voices: 4, tonic: 60, bpm: 100, title: 'SERENITY'
};

export const PLAYER_SONGS: Song[] = [
  song_pure_joy,
  song_melancholy,
  song_fury,
  song_panic,
  song_confidence,
  song_doubt,
  song_fatigue,
  song_celebration,
  song_vulnerability,
  song_shock,
  song_affection,
  song_coldness,
  song_tedium,
  song_mischief,
  song_resignation,
  song_mystery,
  song_dread,
  song_awe,
  song_speed,
  song_serenity
];
