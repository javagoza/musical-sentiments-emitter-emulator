import {
  type Song,
  type VoiceState,
  type SequencerState,
  type AudioSample,
  type AudioDiagnostics,
  VoiceType,
  PercussionType,
  OutputMode,
  ADSREnvelopeState
} from '../types/synth';
import { SAMPLE_RATE, MIDI_PHASE } from './wavetables';
import { MelodySynth } from './MelodySynth';
import { PercussionSynth } from './PercussionSynth';
import { DelayEffect, softClip } from './DelayEffect';
import { sampleToDutyFrac, sampleToDac, AmRadioDemodulator } from './amModulator';

const BUFFER_SIZE = 512;
const BUFFER_MASK = BUFFER_SIZE - 1;
const MAX_MELODIC_VOICES = 4;
const MAX_PERCUSSION_VOICES = 2;

const ACTIVE_VOICE_NORMALIZATION = [
  0.0,
  1.0,
  0.7071067812,
  0.5773502692,
  0.5000000000
];

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;

  // DSP Engines
  private melodic_engines: MelodySynth[] = [];
  private percussion_engines: PercussionSynth[] = [];
  private delay_fx: DelayEffect = new DelayEffect();
  private amDemodulator: AmRadioDemodulator = new AmRadioDemodulator();

  // Circular audio buffer (512 samples)
  private buffer_pwm: Float32Array = new Float32Array(BUFFER_SIZE);
  private buffer_dac: Float32Array = new Float32Array(BUFFER_SIZE);
  private buf_head: number = 0;
  private buf_tail: number = 0;

  // Sequencer state
  public seq: SequencerState = {
    current_song_idx: 0,
    voices: [],
    playing: false,
    song_finished: false,
    song_duration_samples: 0,
    elapsed_samples: 0
  };

  private active_song: Song | null = null;

  // Levels & Routing
  public output_volume: number = 1.0;
  public melodic_level: number = 1.0;
  public percussion_level: number = 1.0;
  public output_mode: OutputMode = OutputMode.DAC_AND_RF;
  public am_frequency_khz: number = 594;
  public radio_tuned_khz: number = 594;
  public radio_noise_amount: number = 0.05;

  // Oscilloscope Capture Buffer (128 samples)
  public wave_capture_buf: Int8Array = new Int8Array(128);
  public wave_capture_min_buf: Int8Array = new Int8Array(128);
  public wave_capture_max_buf: Int8Array = new Int8Array(128);
  public wave_capture_pos: number = 0;
  public wave_capture_counter: number = 0;
  public wave_capture_stride: number = 5;
  public wave_capture_base_stride: number = 5;
  public wave_buffer_ready: boolean = false;
  public wave_interval_min: number = 127;
  public wave_interval_max: number = -127;

  // Scope metrics
  public scope_peak: number = 0.0;
  public scope_sum_sq: number = 0.0;
  public scope_sample_count: number = 0;
  public scope_zero_crossings: number = 0;
  public scope_prev_sample: number = 0;
  public scope_zoom_level: number = 0;
  public scope_fullscreen: boolean = false;
  public scope_display_dirty: boolean = false;

  // Diagnostics & performance
  public clipping_events: number = 0;
  public prevented_overloads: number = 0;
  public underrun_events: number = 0;
  public underrun_samples: number = 0;
  public dsp_call_count: number = 0;
  public dsp_us_sum: number = 0;
  public dsp_us_worst: number = 0;

  // Resampling state for WebAudio output
  private resample_pos: number = 0.0;
  private last_sample_dac: number = 0.0;
  private last_sample_rf: number = 0.0;

  // Callback when song finishes
  public onSongFinished: (() => void) | null = null;
  public onStepChange: ((voiceIdx: number, stepIdx: number) => void) | null = null;

  constructor() {
    for (let i = 0; i < MAX_MELODIC_VOICES; i++) {
      this.melodic_engines.push(new MelodySynth());
    }
    for (let i = 0; i < MAX_PERCUSSION_VOICES; i++) {
      this.percussion_engines.push(new PercussionSynth());
    }
    this.updateScopeStride();
  }

  public async initAudio(): Promise<boolean> {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (!this.scriptNode && this.audioCtx) {
      // 2048 buffer size gives smooth playback without excessive latency
      this.scriptNode = this.audioCtx.createScriptProcessor(2048, 0, 2);
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.85;

      this.scriptNode.onaudioprocess = (e: AudioProcessingEvent) => {
        this.processWebAudio(e);
      };

      this.scriptNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    }

    return true;
  }

  public setZoom(zoom: number) {
    this.scope_zoom_level = Math.max(-9, Math.min(9, zoom));
    this.scope_fullscreen = this.scope_zoom_level !== 0;
    this.updateScopeStride();
    this.resetScope();
    this.scope_display_dirty = true;
  }

  public adjustZoom(clockwise: boolean) {
    let next = this.scope_zoom_level + (clockwise ? 1 : -1);
    next = Math.max(-9, Math.min(9, next));
    this.setZoom(next);
  }

  private updateScopeStride() {
    let stride = this.wave_capture_base_stride;
    if (this.scope_zoom_level > 0) {
      for (let i = 0; i < this.scope_zoom_level; i++) {
        stride *= 2;
        if (stride > 65535) {
          stride = 65535;
          break;
        }
      }
    } else if (this.scope_zoom_level < 0) {
      for (let i = 0; i > this.scope_zoom_level; i--) {
        stride = Math.max(1, Math.floor(stride / 2));
      }
    }
    this.wave_capture_stride = stride;
  }

  public resetScope() {
    this.wave_capture_pos = 0;
    this.wave_capture_counter = 0;
    this.wave_interval_min = 127;
    this.wave_interval_max = -127;
    this.wave_buffer_ready = false;
    this.scope_peak = 0.0;
    this.scope_sum_sq = 0.0;
    this.scope_sample_count = 0;
    this.scope_zero_crossings = 0;
    this.scope_prev_sample = 0;
  }

  public calculateSongDurationSamples(song: Song): number {
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
    return longest_duration;
  }

  public loadStep(voice_idx: number) {
    if (!this.active_song) return;
    const song = this.active_song;
    const voice = song.voices[voice_idx];
    const voice_state = this.seq.voices[voice_idx];

    if (voice_state.step_idx >= voice.total_steps) {
      voice_state.step_idx = 0;
    }

    const dur_sec = (60.0 / song.bpm) * (4.0 / voice.rhythm[voice_state.step_idx]);
    voice_state.samples_total_duration = Math.floor(dur_sec * SAMPLE_RATE);
    voice_state.samples_gate_on_duration = Math.floor(voice_state.samples_total_duration * 0.85);
    voice_state.step_time_counter = 0;

    if (voice.type === VoiceType.MELODY && voice.instrument) {
      const note_val = Math.max(0, Math.min(127, voice.sequence[voice_state.step_idx] + song.tonic));
      this.melodic_engines[voice_state.engine_idx].setBasePhaseStep(MIDI_PHASE[note_val]);
      this.melodic_engines[voice_state.engine_idx].trigger(voice.instrument);
    } else if (voice.type === VoiceType.PERCUSSION) {
      const tp = voice.sequence[voice_state.step_idx] as PercussionType;
      if (tp !== PercussionType.NONE) {
        this.percussion_engines[voice_state.engine_idx].trigger(tp);
      }
    }

    if (this.onStepChange) {
      this.onStepChange(voice_idx, voice_state.step_idx);
    }
  }

  public changeSong(songList: Song[], idx: number) {
    this.seq.current_song_idx = idx % songList.length;
    this.active_song = songList[this.seq.current_song_idx];
    const song = this.active_song;

    let i_mel = 0;
    let i_perc = 0;

    this.seq.voices = [];
    for (let v = 0; v < song.total_voices; v++) {
      const voiceState: VoiceState = {
        step_idx: 0,
        step_time_counter: 0,
        samples_total_duration: 0,
        samples_gate_on_duration: 0,
        engine_idx: 0
      };

      if (song.voices[v].type === VoiceType.MELODY) {
        if (i_mel >= MAX_MELODIC_VOICES) continue;
        voiceState.engine_idx = i_mel;
        this.melodic_engines[i_mel].resetFilter();
        this.melodic_engines[i_mel].resetADSR();
        this.melodic_engines[i_mel].resetPhase();
        i_mel++;
      } else {
        if (i_perc >= MAX_PERCUSSION_VOICES) continue;
        voiceState.engine_idx = i_perc;
        this.percussion_engines[i_perc].trigger(PercussionType.NONE);
        i_perc++;
      }

      this.seq.voices.push(voiceState);
      this.loadStep(v);
    }
  }

  public startSong(songList: Song[], song_index: number) {
    this.initAudio();
    this.seq.current_song_idx = song_index % songList.length;
    this.seq.playing = true;
    this.seq.song_finished = false;
    this.seq.elapsed_samples = 0;

    this.scope_zoom_level = 0;
    this.scope_fullscreen = false;
    this.scope_display_dirty = false;
    this.updateScopeStride();
    this.resetScope();

    this.changeSong(songList, this.seq.current_song_idx);
    this.seq.song_duration_samples = this.calculateSongDurationSamples(this.active_song!);
  }

  public stopSong() {
    this.seq.playing = false;
    this.seq.song_finished = false;
    this.seq.elapsed_samples = 0;
    this.seq.song_duration_samples = 0;

    this.scope_zoom_level = 0;
    this.scope_fullscreen = false;
    this.scope_display_dirty = false;
    this.updateScopeStride();
    this.resetScope();

    this.buf_head = 0;
    this.buf_tail = 0;

    for (let i = 0; i < MAX_MELODIC_VOICES; i++) {
      this.melodic_engines[i].resetADSR();
      this.melodic_engines[i].resetFilter();
      this.melodic_engines[i].resetPhase();
    }
    for (let i = 0; i < MAX_PERCUSSION_VOICES; i++) {
      this.percussion_engines[i].trigger(PercussionType.NONE);
    }
    this.delay_fx.reset();
  }

  public computeNextDspSample(): { dac: number; rf: number } {
    if (!this.active_song) return { dac: 0, rf: 0 };
    const song = this.active_song;

    let melodic_accum = 0.0;
    let percussion_accum = 0.0;
    let melodic_count = 0;
    let percussion_count = 0;

    for (let v = 0; v < song.total_voices; v++) {
      const voice = song.voices[v];
      const state = this.seq.voices[v];
      if (!state) continue;

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
        const is_last_sample = (this.seq.elapsed_samples + 1 >= this.seq.song_duration_samples);
        if (!is_last_sample) {
          this.loadStep(v);
        }
      }
    }

    const total_active = melodic_count + percussion_count;
    const norm_idx = Math.min(4, total_active);
    const combined_mix = (total_active > 0)
      ? ((melodic_accum * this.melodic_level) + (percussion_accum * this.percussion_level)) * ACTIVE_VOICE_NORMALIZATION[norm_idx]
      : 0.0;

    if (Math.abs(combined_mix) > 1.0) {
      this.clipping_events++;
      this.prevented_overloads++;
    }

    const clipped_mix = softClip(combined_mix);
    const delayed_mix = this.delay_fx.process(clipped_mix);

    if (Math.abs(delayed_mix) > 1.0) {
      this.clipping_events++;
      this.prevented_overloads++;
    }

    const output_sample = this.output_volume * softClip(delayed_mix);
    if (Math.abs(output_sample) > 1.0) {
      this.clipping_events++;
    }

    this.seq.elapsed_samples++;
    if (this.seq.elapsed_samples >= this.seq.song_duration_samples) {
      this.seq.song_finished = true;
    }

    // Capture to live oscilloscope buffer
    this.captureSampleToScope(output_sample);

    // Compute hardware DAC & AM RF outputs
    const duty_frac = sampleToDutyFrac(output_sample);
    const demodulated_rf = this.amDemodulator.process(
      duty_frac,
      this.radio_tuned_khz,
      this.am_frequency_khz,
      this.radio_noise_amount
    );

    return {
      dac: output_sample,
      rf: demodulated_rf
    };
  }

  private captureSampleToScope(sample: number) {
    if (this.wave_buffer_ready) return;

    const clipped = Math.max(-1.0, Math.min(1.0, sample));
    const q = Math.round(clipped * 127.0);

    if (q < this.wave_interval_min) this.wave_interval_min = q;
    if (q > this.wave_interval_max) this.wave_interval_max = q;

    this.wave_capture_counter++;
    if (this.wave_capture_counter >= this.wave_capture_stride) {
      this.wave_capture_counter = 0;

      this.wave_capture_min_buf[this.wave_capture_pos] = this.wave_interval_min;
      this.wave_capture_max_buf[this.wave_capture_pos] = this.wave_interval_max;
      this.wave_capture_buf[this.wave_capture_pos] = Math.round((this.wave_interval_min + this.wave_interval_max) / 2);

      const interval_peak = Math.max(Math.abs(this.wave_interval_min), Math.abs(this.wave_interval_max));
      this.wave_capture_pos++;
      this.wave_interval_min = 127;
      this.wave_interval_max = -127;

      const peak_lvl = interval_peak / 127.0;
      if (peak_lvl > this.scope_peak) this.scope_peak = peak_lvl;

      const midpoint = this.wave_capture_buf[this.wave_capture_pos - 1] / 127.0;
      this.scope_sum_sq += midpoint * midpoint;
      this.scope_sample_count++;

      if ((this.scope_prev_sample < 0 && q >= 0) || (this.scope_prev_sample > 0 && q <= 0)) {
        this.scope_zero_crossings++;
      }
      this.scope_prev_sample = q;

      if (this.wave_capture_pos >= 128) {
        this.wave_capture_pos = 0;
        this.wave_buffer_ready = true;
      }
    }
  }

  // Web Audio Processing (Pumping from ring buffer)
  private processWebAudio(e: AudioProcessingEvent) {
    const left = e.outputBuffer.getChannelData(0);
    const right = e.outputBuffer.getChannelData(1);
    const outSampleRate = e.outputBuffer.sampleRate;
    const ratio = SAMPLE_RATE / outSampleRate;

    for (let i = 0; i < left.length; i++) {
      if (this.seq.playing && !this.seq.song_finished) {
        // Refill circular buffer if needed
        while (((this.buf_head + 1) & BUFFER_MASK) !== this.buf_tail) {
          const t0 = performance.now();
          const dsp = this.computeNextDspSample();
          const dt_us = (performance.now() - t0) * 1000.0;

          this.dsp_call_count++;
          this.dsp_us_sum += dt_us;
          if (dt_us > this.dsp_us_worst) this.dsp_us_worst = dt_us;

          const next = (this.buf_head + 1) & BUFFER_MASK;
          this.buffer_dac[this.buf_head] = dsp.dac;
          this.buffer_pwm[this.buf_head] = dsp.rf;
          this.buf_head = next;
        }
      }

      // Resample at WebAudio context rate
      this.resample_pos += ratio;
      while (this.resample_pos >= 1.0) {
        this.resample_pos -= 1.0;
        if (this.buf_head !== this.buf_tail) {
          this.last_sample_dac = this.buffer_dac[this.buf_tail];
          this.last_sample_rf = this.buffer_pwm[this.buf_tail];
          this.buf_tail = (this.buf_tail + 1) & BUFFER_MASK;
        } else if (this.seq.playing && !this.seq.song_finished) {
          this.underrun_events++;
          this.underrun_samples++;
        }
      }

      let active_out = 0.0;
      switch (this.output_mode) {
        case OutputMode.DAC_ONLY:
          active_out = this.last_sample_dac;
          break;
        case OutputMode.RF_ONLY:
          active_out = this.last_sample_rf;
          break;
        case OutputMode.DAC_AND_RF:
          active_out = this.last_sample_dac * 0.7 + this.last_sample_rf * 0.7;
          break;
        case OutputMode.MUTE:
          active_out = 0.0;
          break;
      }

      left[i] = active_out;
      right[i] = active_out;

      // Handle song finish event
      if (this.seq.song_finished && this.buf_head === this.buf_tail && this.seq.playing) {
        this.seq.playing = false;
        if (this.onSongFinished) {
          setTimeout(() => this.onSongFinished?.(), 10);
        }
      }
    }
  }

  public getDiagnostics(): AudioDiagnostics {
    const bufferLevel = (this.buf_head - this.buf_tail) & BUFFER_MASK;
    const avgUs = this.dsp_call_count > 0 ? this.dsp_us_sum / this.dsp_call_count : 0.0;

    let activeCount = 0;
    for (let i = 0; i < MAX_MELODIC_VOICES; i++) {
      if (this.melodic_engines[i].getADSRState() !== ADSREnvelopeState.IDLE) activeCount++;
    }
    for (let i = 0; i < MAX_PERCUSSION_VOICES; i++) {
      if (this.percussion_engines[i].isActive()) activeCount++;
    }

    return {
      clippingCount: this.clipping_events,
      preventedOverloads: this.prevented_overloads,
      underrunEvents: this.underrun_events,
      underrunSamples: this.underrun_samples,
      dspAverageUs: avgUs,
      dspWorstUs: this.dsp_us_worst,
      bufferLevel,
      bufferCapacity: BUFFER_SIZE,
      sampleRate: SAMPLE_RATE,
      activeVoicesCount: activeCount
    };
  }

  public getActiveVoicesInfo() {
    return {
      melodic: this.melodic_engines.map((e, idx) => ({
        index: idx,
        state: e.getADSRState(),
        level: e.getADSRLevel()
      })),
      percussion: this.percussion_engines.map((e, idx) => ({
        index: idx,
        type: e.getActiveType(),
        active: e.isActive()
      }))
    };
  }
}
