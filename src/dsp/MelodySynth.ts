import { ADSREnvelopeState, type ADSRParameters, type Instrument } from '../types/synth';
import { SAMPLE_RATE, SINE_TABLE_F } from './wavetables';

export class ADSR {
  private _state: ADSREnvelopeState = ADSREnvelopeState.IDLE;
  private _level: number = 0.0;
  private _att_step: number = 0.0;
  private _dec_step: number = 0.0;
  private _rel_step: number = 0.0;
  private _sustain_level: number = 0.0;

  constructor() {
    this._state = ADSREnvelopeState.IDLE;
  }

  public trigger(params: ADSRParameters): void {
    this._sustain_level = params.sustain_level;
    const samplesPerMs = SAMPLE_RATE / 1000.0;
    this._att_step = 1.0 / (params.attack_ms * samplesPerMs + 1.0);
    this._dec_step = (1.0 - params.sustain_level) / (params.decay_ms * samplesPerMs + 1.0);
    this._rel_step = params.sustain_level / (params.release_ms * samplesPerMs + 1.0);
    this._level = 0.0;
    this._state = ADSREnvelopeState.ATTACK;
  }

  public release(): void {
    if (this._state !== ADSREnvelopeState.IDLE) {
      this._state = ADSREnvelopeState.RELEASE;
    }
  }

  public reset(): void {
    this._state = ADSREnvelopeState.IDLE;
    this._level = 0.0;
  }

  public getState(): ADSREnvelopeState {
    return this._state;
  }

  public getLevel(): number {
    return this._level;
  }

  public process(): number {
    switch (this._state) {
      case ADSREnvelopeState.IDLE:
        this._level = 0.0;
        break;

      case ADSREnvelopeState.ATTACK:
        this._level += this._att_step;
        if (this._level >= 1.0) {
          this._level = 1.0;
          this._state = ADSREnvelopeState.DECAY;
        }
        break;

      case ADSREnvelopeState.DECAY:
        this._level -= this._dec_step;
        if (this._level <= this._sustain_level) {
          this._level = this._sustain_level;
          this._state = ADSREnvelopeState.SUSTAIN;
        }
        break;

      case ADSREnvelopeState.SUSTAIN:
        this._level = this._sustain_level;
        break;

      case ADSREnvelopeState.RELEASE:
        this._level -= this._rel_step;
        if (this._level <= 0.0) {
          this._level = 0.0;
          this._state = ADSREnvelopeState.IDLE;
        }
        break;
    }

    return this._level;
  }
}

export class MelodySynth {
  private _adsr: ADSR = new ADSR();
  private _base_phase_step: number = 0;
  private _phase: number = 0;
  private _lpf_filter: number = 0.0;
  private _vibrato_phase: number = 0;
  private _vibrato_phase_step: number = 0;
  private _arpeggio_ratio: number = 1.0;
  private _arpeggio_sub_step_duration: number = 1;
  private _arpeggio_counter: number = 0;
  private _arpeggio_alt: boolean = false;
  private _cached_instrument: Instrument | null = null;

  public trigger(inst: Instrument): void {
    this._adsr.trigger(inst.adsr);
    this._arpeggio_counter = 0;
    this._arpeggio_alt = false;
    this.cacheInstrumentParameters(inst);
  }

  public release(): void {
    this._adsr.release();
  }

  public resetADSR(): void {
    this._adsr.reset();
  }

  public resetFilter(): void {
    this._lpf_filter = 0.0;
  }

  public getADSRState(): ADSREnvelopeState {
    return this._adsr.getState();
  }

  public getADSRLevel(): number {
    return this._adsr.getLevel();
  }

  public setBasePhaseStep(step: number): void {
    this._base_phase_step = step >>> 0;
  }

  public resetPhase(): void {
    this._phase = 0;
    this._vibrato_phase = 0;
  }

  public cacheInstrumentParameters(inst: Instrument): void {
    if (!inst) return;
    this._cached_instrument = inst;

    if (inst.vibrato_freq > 0.0) {
      const phase_step = (4294967296.0 * inst.vibrato_freq) / SAMPLE_RATE;
      this._vibrato_phase_step = Math.floor(phase_step) >>> 0;
    } else {
      this._vibrato_phase_step = 0;
    }

    this._arpeggio_ratio = 1.0;
    if (inst.arpeg.active && inst.arpeg.speed > 0) {
      const scaleSamples125 = Math.floor((125 * SAMPLE_RATE) / 8000); // 250 samples @ 16kHz
      this._arpeggio_sub_step_duration = Math.max(1, Math.floor(scaleSamples125 / inst.arpeg.speed));
      this._arpeggio_ratio = Math.pow(2.0, inst.arpeg.semitones / 12.0);
    } else {
      this._arpeggio_sub_step_duration = 1;
    }
  }

  public process(inst: Instrument, _step_time_counter: number): number {
    if (!inst || this._adsr.getState() === ADSREnvelopeState.IDLE) {
      return 0.0;
    }

    // 1. Vibrato Calculation
    let current_phase_step = this._base_phase_step;
    if (inst.vibrato_depth > 0.0 && this._vibrato_phase_step > 0) {
      this._vibrato_phase = (this._vibrato_phase + this._vibrato_phase_step) >>> 0;
      const vibrato_index = (this._vibrato_phase >>> 24) & 0xFF;
      const vibrato_mod = 1.0 + (inst.vibrato_depth * SINE_TABLE_F[vibrato_index]);
      current_phase_step = Math.floor(current_phase_step * vibrato_mod);
    }

    // 2. Arpeggiator Calculation
    if (inst.arpeg.active && inst.arpeg.speed > 0) {
      this._arpeggio_counter++;
      if (this._arpeggio_counter >= this._arpeggio_sub_step_duration) {
        this._arpeggio_counter = 0;
        this._arpeggio_alt = !this._arpeggio_alt;
      }
      if (this._arpeggio_alt) {
        current_phase_step = Math.floor(current_phase_step * this._arpeggio_ratio);
      }
    }

    // 3. Phase Accumulation and Wavetable Lookup with linear interpolation
    this._phase = (this._phase + current_phase_step) >>> 0;

    const index_lut = (this._phase >>> 24) & 0xFF;
    const index_lut_next = (index_lut + 1) & 0xFF;
    const frac = ((this._phase >>> 16) & 0xFF) / 256.0;

    const sample_a = inst.wave_table[index_lut] * (1.0 / 32767.0);
    const sample_b = inst.wave_table[index_lut_next] * (1.0 / 32767.0);
    const raw_sample = sample_a + frac * (sample_b - sample_a);

    // 4. Low-pass Filter (Smoothing)
    this._lpf_filter += 0.3 * (raw_sample - this._lpf_filter);

    // 5. ADSR Envelope
    const envelope = this._adsr.process();

    return this._lpf_filter * envelope * inst.volume;
  }
}
