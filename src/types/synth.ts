export enum ADSREnvelopeState {
  IDLE = 'IDLE',
  ATTACK = 'ATTACK',
  DECAY = 'DECAY',
  SUSTAIN = 'SUSTAIN',
  RELEASE = 'RELEASE'
}

export enum VoiceType {
  MELODY = 0,
  PERCUSSION = 1
}

export enum PercussionType {
  NONE = 0,
  KICK = 1,
  SNARE = 2,
  HIHAT_CLOSED = 3,
  HIHAT_OPEN = 4,
  CRASH = 5,
  CLAP = 6,
  TOM_LOW = 7,
  TOM_MID = 8,
  TOM_HIGH = 9
}

export enum OutputMode {
  DAC_ONLY = 0,     // Audio DAC monitor only, RF carrier stopped
  RF_ONLY = 1,      // RF carrier only, DAC held at idle (silent)
  DAC_AND_RF = 2,   // Both outputs active (default)
  MUTE = 3          // Both outputs silenced
}

export enum SettingItem {
  MELODY_VOLUME = 0,
  PERCUSSION_VOLUME = 1,
  MASTER_VOLUME = 2,
  AM_FREQUENCY = 3,
  OUTPUT_SELECTION = 4,
  SETTINGS_ITEM_COUNT = 5
}

export enum UIState {
  UI_MENU_SELECTION = 'UI_MENU_SELECTION',
  UI_PLAYING = 'UI_PLAYING',
  UI_SETTINGS = 'UI_SETTINGS'
}

export interface ADSRParameters {
  attack_ms: number;
  decay_ms: number;
  sustain_level: number;
  release_ms: number;
}

export interface ArpeggioConfig {
  active: boolean;
  semitones: number;
  speed: number;
}

export interface Instrument {
  name?: string;
  wave_table: Int16Array;
  adsr: ADSRParameters;
  arpeg: ArpeggioConfig;
  volume: number;
  vibrato_depth: number;
  vibrato_freq: number;
}

export interface Voice {
  type: VoiceType;
  sequence: number[];
  rhythm: number[];
  total_steps: number;
  instrument: Instrument | null;
}

export interface Song {
  voices: Voice[];
  total_voices: number;
  tonic: number;
  bpm: number;
  title: string;
}

export interface VoiceState {
  step_idx: number;
  step_time_counter: number;
  samples_total_duration: number;
  samples_gate_on_duration: number;
  engine_idx: number;
}

export interface SequencerState {
  current_song_idx: number;
  voices: VoiceState[];
  playing: boolean;
  song_finished: boolean;
  song_duration_samples: number;
  elapsed_samples: number;
}

export interface AudioSample {
  pwmDuty: number;
  dacVal: number;
}

export interface ClippingLogEntry {
  step: number;
  sample: number;
  value: number;
  reason: 'MIX_OVERLOAD' | 'DELAY_OVERLOAD' | 'OUTPUT_OVERLOAD';
}

export interface AudioDiagnostics {
  clippingCount: number;
  preventedOverloads: number;
  underrunEvents: number;
  underrunSamples: number;
  dspAverageUs: number;
  dspWorstUs: number;
  bufferLevel: number;
  bufferCapacity: number;
  sampleRate: number;
  activeVoicesCount: number;
}
