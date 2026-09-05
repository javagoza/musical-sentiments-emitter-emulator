import * as lamejs from '@breezystack/lamejs';
import type { Song } from '../types/synth';
import { OutputMode, VoiceType, PercussionType, ADSREnvelopeState } from '../types/synth';
import { SAMPLE_RATE, MIDI_PHASE } from '../dsp/wavetables';
import { MelodySynth } from '../dsp/MelodySynth';
import { PercussionSynth } from '../dsp/PercussionSynth';
import { DelayEffect, softClip } from '../dsp/DelayEffect';
import { sampleToDutyFrac, AmRadioDemodulator } from '../dsp/amModulator';

const MAX_MELODIC_VOICES = 4;
const MAX_PERCUSSION_VOICES = 2;
const ACTIVE_VOICE_NORMALIZATION = [
  0.0,
  1.0,
  0.7071067812,
  0.5773502692,
  0.5000000000
];

export interface Mp3ExportOptions {
  outputMode?: OutputMode;
  masterVolume?: number;
  melodyVolume?: number;
  percussionVolume?: number;
  amFrequencyKhz?: number;
  radioTunedKhz?: number;
  radioNoiseAmount?: number;
  bitrateKbps?: number;
  onProgress?: (percent: number, stepText: string) => void;
}

export interface Mp3ExportResult {
  blob: Blob;
  filename: string;
  durationSec: number;
  sizeBytes: number;
}

/**
 * Pure offline DSP renderer for any Song structure.
 * Synthesizes exact 4-voice polyphonic + percussion + delay + AM demodulation math.
 */
class OfflineSongRenderer {
  private melodic_engines: MelodySynth[] = [];
  private percussion_engines: PercussionSynth[] = [];
  private delay_fx: DelayEffect = new DelayEffect();
  private amDemodulator: AmRadioDemodulator = new AmRadioDemodulator();

  constructor() {
    for (let i = 0; i < MAX_MELODIC_VOICES; i++) {
      this.melodic_engines.push(new MelodySynth());
    }
    for (let i = 0; i < MAX_PERCUSSION_VOICES; i++) {
      this.percussion_engines.push(new PercussionSynth());
    }
  }

  public render(song: Song, options: Mp3ExportOptions = {}): Float32Array {
    const {
      outputMode = OutputMode.DAC_AND_RF,
      masterVolume = 1.0,
      melodyVolume = 1.0,
      percussionVolume = 1.0,
      amFrequencyKhz = 594,
      radioTunedKhz = 594,
      radioNoiseAmount = 0.04
    } = options;

    // Calculate duration in 16 kHz samples
    let longest_duration = 0;
    for (let v = 0; v < song.total_voices; ++v) {
      const voice = song.voices[v];
      let voice_duration = 0;
      for (let step = 0; step < voice.total_steps; ++step) {
        const dur_sec = (60.0 / song.bpm) * (4.0 / voice.rhythm[step]);
        voice_duration += Math.floor(dur_sec * SAMPLE_RATE);
      }
      if (voice_duration > longest_duration) {
        longest_duration = voice_duration;
      }
    }

    // Add tail (0.35s) for delay echo decay
    const tailSamples = Math.floor(0.35 * SAMPLE_RATE);
    const totalSamples = longest_duration + tailSamples;

    // Voice states
    interface OfflineVoiceState {
      step_idx: number;
      step_time_counter: number;
      samples_total_duration: number;
      samples_gate_on_duration: number;
      engine_idx: number;
    }

    const voiceStates: OfflineVoiceState[] = [];
    let i_mel = 0;
    let i_perc = 0;

    for (let v = 0; v < song.total_voices; v++) {
      const vState: OfflineVoiceState = {
        step_idx: 0,
        step_time_counter: 0,
        samples_total_duration: 0,
        samples_gate_on_duration: 0,
        engine_idx: 0
      };

      if (song.voices[v].type === VoiceType.MELODY) {
        if (i_mel < MAX_MELODIC_VOICES) {
          vState.engine_idx = i_mel;
          this.melodic_engines[i_mel].resetFilter();
          this.melodic_engines[i_mel].resetADSR();
          this.melodic_engines[i_mel].resetPhase();
          i_mel++;
          voiceStates.push(vState);
        }
      } else {
        if (i_perc < MAX_PERCUSSION_VOICES) {
          vState.engine_idx = i_perc;
          this.percussion_engines[i_perc].trigger(PercussionType.NONE);
          i_perc++;
          voiceStates.push(vState);
        }
      }
    }

    // Function to load a step for a voice
    const loadStep = (voiceIdx: number) => {
      const voice = song.voices[voiceIdx];
      const state = voiceStates[voiceIdx];
      if (!voice || !state) return;

      if (state.step_idx >= voice.total_steps) {
        state.step_idx = 0;
      }

      const dur_sec = (60.0 / song.bpm) * (4.0 / voice.rhythm[state.step_idx]);
      state.samples_total_duration = Math.floor(dur_sec * SAMPLE_RATE);
      state.samples_gate_on_duration = Math.floor(state.samples_total_duration * 0.85);
      state.step_time_counter = 0;

      if (voice.type === VoiceType.MELODY && voice.instrument) {
        const note_val = Math.max(0, Math.min(127, voice.sequence[state.step_idx] + song.tonic));
        this.melodic_engines[state.engine_idx].setBasePhaseStep(MIDI_PHASE[note_val]);
        this.melodic_engines[state.engine_idx].trigger(voice.instrument);
      } else if (voice.type === VoiceType.PERCUSSION) {
        const tp = voice.sequence[state.step_idx] as PercussionType;
        if (tp !== PercussionType.NONE) {
          this.percussion_engines[state.engine_idx].trigger(tp);
        }
      }
    };

    // Initialize all steps
    for (let v = 0; v < song.total_voices; v++) {
      loadStep(v);
    }

    const outputBuffer = new Float32Array(totalSamples);
    let peakMagnitude = 0.0;

    // Process every sample
    for (let i = 0; i < totalSamples; i++) {
      let melodic_accum = 0.0;
      let percussion_accum = 0.0;
      let melodic_count = 0;
      let percussion_count = 0;

      const isSongRunning = i < longest_duration;

      if (isSongRunning) {
        for (let v = 0; v < song.total_voices; v++) {
          const voice = song.voices[v];
          const state = voiceStates[v];
          if (!voice || !state) continue;

          state.step_time_counter++;
          let advance_step = false;

          if (voice.type === VoiceType.MELODY && voice.instrument) {
            if (this.melodic_engines[state.engine_idx].getADSRState() !== ADSREnvelopeState.IDLE) {
              melodic_count++;
            }
            if (state.step_time_counter >= state.samples_gate_on_duration &&
                this.melodic_engines[state.engine_idx].getADSRState() !== ADSREnvelopeState.RELEASE) {
              this.melodic_engines[state.engine_idx].release();
            } else if (state.step_time_counter >= state.samples_total_duration) {
              advance_step = true;
            }
            melodic_accum += this.melodic_engines[state.engine_idx].process(voice.instrument, state.step_time_counter);
          } else if (voice.type === VoiceType.PERCUSSION) {
            if (this.percussion_engines[state.engine_idx].isActive()) {
              percussion_count++;
            }
            if (state.step_time_counter >= state.samples_total_duration) {
              advance_step = true;
            }
            percussion_accum += this.percussion_engines[state.engine_idx].process();
          }

          if (advance_step) {
            state.step_idx++;
            if (i + 1 < longest_duration) {
              loadStep(v);
            }
          }
        }
      } else {
        // Tail period: finish releasing voices
        for (let v = 0; v < song.total_voices; v++) {
          const voice = song.voices[v];
          const state = voiceStates[v];
          if (!voice || !state) continue;
          if (voice.type === VoiceType.MELODY && voice.instrument) {
            melodic_accum += this.melodic_engines[state.engine_idx].process(voice.instrument, state.step_time_counter++);
          } else if (voice.type === VoiceType.PERCUSSION) {
            percussion_accum += this.percussion_engines[state.engine_idx].process();
          }
        }
      }

      const total_active = melodic_count + percussion_count;
      const norm_idx = Math.min(4, total_active);
      const combined_mix = (total_active > 0)
        ? ((melodic_accum * melodyVolume) + (percussion_accum * percussionVolume)) * ACTIVE_VOICE_NORMALIZATION[norm_idx]
        : 0.0;

      const clipped_mix = softClip(combined_mix);
      const delayed_mix = this.delay_fx.process(clipped_mix);
      const dac_sample = masterVolume * softClip(delayed_mix);

      let final_sample = dac_sample;

      if (outputMode === OutputMode.RF_ONLY || outputMode === OutputMode.DAC_AND_RF) {
        const duty_frac = sampleToDutyFrac(dac_sample);
        const rf_sample = this.amDemodulator.process(
          duty_frac,
          radioTunedKhz,
          amFrequencyKhz,
          radioNoiseAmount
        );

        if (outputMode === OutputMode.RF_ONLY) {
          final_sample = rf_sample;
        } else {
          final_sample = dac_sample * 0.7 + rf_sample * 0.7;
        }
      }

      outputBuffer[i] = final_sample;
      const absVal = Math.abs(final_sample);
      if (absVal > peakMagnitude) {
        peakMagnitude = absVal;
      }
    }

    // Normalize signal to 92% ceiling if peak is quiet or close to limit
    if (peakMagnitude > 0.05) {
      const targetGain = 0.92 / Math.max(peakMagnitude, 0.92);
      for (let i = 0; i < totalSamples; i++) {
        outputBuffer[i] = Math.max(-1.0, Math.min(1.0, outputBuffer[i] * targetGain));
      }
    }

    return outputBuffer;
  }
}

/**
 * High-quality linear resampling from 16,000 Hz to 44,100 Hz
 */
function resampleTo44100(samples16k: Float32Array): Int16Array {
  const targetSampleRate = 44100;
  const originalSampleRate = SAMPLE_RATE;
  const origLength = samples16k.length;
  const targetLength = Math.floor((origLength / originalSampleRate) * targetSampleRate);
  const out = new Int16Array(targetLength);

  for (let j = 0; j < targetLength; j++) {
    const origPos = (j / targetSampleRate) * originalSampleRate;
    const i0 = Math.floor(origPos);
    const frac = origPos - i0;
    const i1 = Math.min(origLength - 1, i0 + 1);
    const interpolated = samples16k[i0] * (1.0 - frac) + samples16k[i1] * frac;
    out[j] = Math.max(-32768, Math.min(32767, Math.round(interpolated * 32767.0)));
  }

  return out;
}

function createMp3EncoderInstance(channels: number, sampleRate: number, kbps: number) {
  const mod = lamejs as any;
  const Cls = mod.Mp3Encoder || mod.default?.Mp3Encoder || (typeof mod.default === 'function' ? mod.default : null) || (typeof mod === 'function' ? mod : null);
  if (typeof Cls === 'function') {
    return new Cls(channels, sampleRate, kbps);
  }
  if (typeof window !== 'undefined' && (window as any).lamejs?.Mp3Encoder) {
    return new (window as any).lamejs.Mp3Encoder(channels, sampleRate, kbps);
  }
  throw new Error('Mp3Encoder constructor could not be resolved from lamejs module.');
}

/**
 * Encodes 44.1kHz 16-bit mono audio samples into an MP3 Blob using LAME.
 */
export async function encodeInt16ToMp3(
  samples44k: Int16Array,
  bitrateKbps: number = 192,
  onProgress?: (percent: number, text: string) => void
): Promise<Blob> {
  const sampleRate = 44100;
  const encoder = createMp3EncoderInstance(1, sampleRate, bitrateKbps);
  const mp3Chunks: Uint8Array[] = [];
  const CHUNK_SIZE = 1152;
  const totalSamples = samples44k.length;

  for (let i = 0; i < totalSamples; i += CHUNK_SIZE) {
    const subChunk = samples44k.subarray(i, Math.min(totalSamples, i + CHUNK_SIZE));
    const encoded = encoder.encodeBuffer(subChunk);
    if (encoded.length > 0) {
      mp3Chunks.push(encoded);
    }

    if (onProgress && i % (CHUNK_SIZE * 32) === 0) {
      const progressPercent = Math.round(50 + (i / totalSamples) * 45);
      onProgress(progressPercent, `Encoding MP3 frames (${Math.round((i / totalSamples) * 100)}%)...`);
      // Yield to event loop to avoid UI freezing
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  const flushBytes = encoder.flush();
  if (flushBytes.length > 0) {
    mp3Chunks.push(flushBytes);
  }

  return new Blob(mp3Chunks, { type: 'audio/mp3' });
}

/**
 * Main export function: renders active song and creates .mp3 download.
 */
export async function exportSongToMp3(
  song: Song,
  options: Mp3ExportOptions = {}
): Promise<Mp3ExportResult> {
  const { onProgress, bitrateKbps = 192 } = options;

  onProgress?.(5, `Synthesizing ${song.title} DSP voices...`);
  await new Promise(resolve => setTimeout(resolve, 10));

  const renderer = new OfflineSongRenderer();
  const raw16k = renderer.render(song, options);

  onProgress?.(45, 'Resampling DSP waveform to 44.1 kHz Studio Quality...');
  await new Promise(resolve => setTimeout(resolve, 10));

  const pcm44k = resampleTo44100(raw16k);

  onProgress?.(55, 'Encoding LAME MP3 bitstream...');
  const mp3Blob = await encodeInt16ToMp3(pcm44k, bitrateKbps, onProgress);

  onProgress?.(100, 'MP3 file ready for download!');

  // Clean filename: e.g. "arduino-synth-pure-joy.mp3"
  const cleanTitle = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = `arduino-synth-${cleanTitle}.mp3`;
  const durationSec = raw16k.length / SAMPLE_RATE;

  return {
    blob: mp3Blob,
    filename,
    durationSec,
    sizeBytes: mp3Blob.size
  };
}

/**
 * Helper to trigger browser download for any Blob
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
