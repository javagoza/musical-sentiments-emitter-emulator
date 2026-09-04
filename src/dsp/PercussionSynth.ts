import { PercussionType } from '../types/synth';
import { SAMPLE_RATE, sineLUT } from './wavetables';

export class PercussionSynth {
  private _active: PercussionType = PercussionType.NONE;
  private _step: number = 0;
  private _lfsr: number = 0xACE1;
  private _kick_phase: number = 0.0;
  private _tom_phase: number = 0.0;

  private _amp_env: number = 0.0;
  private _amp_coeff: number = 1.0;
  private _freq_env: number = 0.0;
  private _freq_coeff: number = 1.0;
  private _snare_body_phase: number = 0.0;
  private _snare_body_env: number = 0.0;
  private _snare_body_coeff: number = 1.0;

  private white_noise(): number {
    this._lfsr = ((this._lfsr >>> 1) ^ (-((this._lfsr & 1) >>> 0) & 0xB400)) & 0xFFFF;
    return ((this._lfsr & 0xFFFF) / 32768.0) - 1.0;
  }

  private decayCoeff(tau_seconds: number): number {
    return Math.exp(-1.0 / (tau_seconds * SAMPLE_RATE));
  }

  public trigger(type: PercussionType): void {
    this._active = type;
    this._step = 0;
    this._kick_phase = 0.0;
    this._tom_phase = 0.0;

    this._amp_env = 1.0;
    this._freq_env = 1.0;
    this._snare_body_env = 1.0;
    this._snare_body_phase = 0.0;

    switch (type) {
      case PercussionType.KICK:
        this._amp_coeff = this.decayCoeff(0.08);
        this._freq_coeff = this.decayCoeff(0.015);
        break;
      case PercussionType.SNARE:
        this._amp_coeff = this.decayCoeff(0.05);
        this._snare_body_coeff = this.decayCoeff(0.02);
        break;
      case PercussionType.HIHAT_CLOSED:
        this._amp_coeff = this.decayCoeff(0.02);
        break;
      case PercussionType.HIHAT_OPEN:
        this._amp_coeff = this.decayCoeff(0.15);
        break;
      case PercussionType.CRASH:
        this._amp_coeff = this.decayCoeff(0.4);
        break;
      case PercussionType.TOM_LOW:
      case PercussionType.TOM_MID:
      case PercussionType.TOM_HIGH:
        this._amp_coeff = this.decayCoeff(0.1);
        this._freq_coeff = this.decayCoeff(0.02);
        break;
      default:
        break;
    }
  }

  public setActive(type: PercussionType): void {
    this.trigger(type);
  }

  public isActive(): boolean {
    return this._active !== PercussionType.NONE;
  }

  public getActiveType(): PercussionType {
    return this._active;
  }

  public process(): number {
    if (this._active === PercussionType.NONE) return 0.0;

    let sample = 0.0;
    const scaleSamples = (m: number) => Math.floor((m * SAMPLE_RATE) / 8000);

    switch (this._active) {
      case PercussionType.KICK: {
        const freq = 60.0 + 120.0 * this._freq_env;
        const phase_inc = freq * (256.0 / SAMPLE_RATE);
        this._kick_phase += phase_inc;
        if (this._kick_phase >= 256.0) this._kick_phase -= 256.0;

        sample = sineLUT(this._kick_phase) * this._amp_env * 1.0;
        this._amp_env *= this._amp_coeff;
        this._freq_env *= this._freq_coeff;
        break;
      }

      case PercussionType.SNARE: {
        const noise = this.white_noise();
        this._snare_body_phase += 0.2 * (256.0 / (2.0 * Math.PI));
        if (this._snare_body_phase >= 256.0) this._snare_body_phase -= 256.0;

        const body = sineLUT(this._snare_body_phase) * this._snare_body_env;
        sample = (noise * 0.7 + body * 0.3) * this._amp_env * 0.9;
        this._amp_env *= this._amp_coeff;
        this._snare_body_env *= this._snare_body_coeff;
        break;
      }

      case PercussionType.HIHAT_CLOSED: {
        const noise = this.white_noise();
        sample = noise * this._amp_env * 0.6;
        this._amp_env *= this._amp_coeff;
        break;
      }

      case PercussionType.HIHAT_OPEN: {
        const noise = this.white_noise();
        sample = noise * this._amp_env * 0.5;
        this._amp_env *= this._amp_coeff;
        break;
      }

      case PercussionType.CRASH: {
        const noise = this.white_noise();
        sample = noise * this._amp_env * 0.7;
        this._amp_env *= this._amp_coeff;
        break;
      }

      case PercussionType.CLAP: {
        let decay_envelope: number;
        if (this._step < scaleSamples(15) || (this._step > scaleSamples(25) && this._step < scaleSamples(35))) {
          decay_envelope = Math.exp(-((this._step % scaleSamples(20))) / (0.03 * SAMPLE_RATE));
          sample = this.white_noise() * decay_envelope * 0.8;
        } else {
          decay_envelope = Math.exp(-this._step / (0.1 * SAMPLE_RATE));
          sample = this.white_noise() * decay_envelope * 0.4;
        }
        break;
      }

      case PercussionType.TOM_LOW:
      case PercussionType.TOM_MID:
      case PercussionType.TOM_HIGH: {
        const base_freq = (this._active === PercussionType.TOM_LOW) ? 90.0 : ((this._active === PercussionType.TOM_MID) ? 130.0 : 180.0);
        const freq = base_freq + 40.0 * this._freq_env;
        const phase_inc = freq * (256.0 / SAMPLE_RATE);
        this._tom_phase += phase_inc;
        if (this._tom_phase >= 256.0) this._tom_phase -= 256.0;

        sample = sineLUT(this._tom_phase) * this._amp_env * 1.0;
        this._amp_env *= this._amp_coeff;
        this._freq_env *= this._freq_coeff;
        break;
      }

      default:
        sample = 0.0;
        break;
    }

    this._step++;
    if (this._step > scaleSamples(8000)) {
      this._active = PercussionType.NONE;
    }

    return sample;
  }
}
