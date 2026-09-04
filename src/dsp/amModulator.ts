const DUTY_MIN_FRAC = 0.05;
const DUTY_MAX_FRAC = 0.45;

const SIN_MIN = Math.sin(Math.PI * DUTY_MIN_FRAC);
const SIN_MAX = Math.sin(Math.PI * DUTY_MAX_FRAC);
const SIN_CENTER = (SIN_MAX + SIN_MIN) * 0.5;
const SIN_HALF_RANGE = (SIN_MAX - SIN_MIN) * 0.5;

export const LUT_ASIN_SIZE = 513;
export const lut_asin_duty = new Float32Array(LUT_ASIN_SIZE);

// Compute predistortion LUT
for (let i = 0; i < LUT_ASIN_SIZE; i++) {
  const sample = -1.0 + (2.0 * i) / (LUT_ASIN_SIZE - 1);
  let target_sin = SIN_CENTER + sample * SIN_HALF_RANGE;
  target_sin = Math.max(-1.0, Math.min(1.0, target_sin));
  const duty_frac = Math.asin(target_sin) / Math.PI;
  lut_asin_duty[i] = duty_frac;
}

export function sampleToDutyFrac(sample: number): number {
  const clamped = Math.max(-1.0, Math.min(1.0, sample));
  const idx_f = (clamped + 1.0) * 0.5 * (LUT_ASIN_SIZE - 1);
  const idx = Math.min(LUT_ASIN_SIZE - 1, Math.max(0, Math.round(idx_f)));
  return lut_asin_duty[idx];
}

export function sampleToDac(sample: number): number {
  const clamped = Math.max(-1.0, Math.min(1.0, sample));
  const val_f = (clamped + 1.0) * 0.5 * 4095.0;
  return Math.round(val_f);
}

/**
 * AM Radio Demodulator / Receiver Simulator
 * Reconstructs the audio signal from the modulated PWM RF carrier with:
 * - Envelope detection
 * - Diode non-linearity & AC coupling (DC block)
 * - Bandwidth limitation (typical MW AM receiver audio response ~ 4.5 kHz)
 * - Radio atmospheric background noise & carrier presence
 */
export class AmRadioDemodulator {
  private _dc_block_prev_in: number = 0.0;
  private _dc_block_prev_out: number = 0.0;
  private _lowpass_filter: number = 0.0;
  private _noise_state: number = 0x55AA;

  public process(duty_frac: number, tuned_frequency_khz: number, carrier_frequency_khz: number, noise_amount: number = 0.04): number {
    // Relative frequency offset
    const freq_delta = Math.abs(tuned_frequency_khz - carrier_frequency_khz);
    
    // Tuning attenuation curve: bell curve around carrier
    // 3dB bandwidth is around 9 kHz (standard AM channel)
    const tuning_factor = Math.exp(-Math.pow(freq_delta / 8.0, 2));

    // Envelope recovery from duty fraction (normalized around center 0.25)
    // Duty fraction ranges from 0.05 to 0.45. Center is 0.25, amplitude is 0.20
    const raw_detected = ((duty_frac - 0.25) / 0.20) * tuning_factor;

    // Carrier heterodyne whistle if slightly off-tune (within 15 kHz)
    let heterodyne = 0.0;
    if (freq_delta > 0 && freq_delta < 12) {
      const whistle_freq = freq_delta * 1000;
      heterodyne = Math.sin((2.0 * Math.PI * whistle_freq * Date.now()) / 1000.0) * 0.08 * (1.0 - freq_delta / 12);
    }

    // Atmospheric RF noise
    this._noise_state = ((this._noise_state * 1103515245 + 12345) >>> 0) & 0x7FFFFFFF;
    const white_noise = (this._noise_state / 0x3FFFFFFF) - 1.0;
    const static_noise = white_noise * noise_amount * (1.1 - tuning_factor * 0.8);

    const input_mix = raw_detected + heterodyne + static_noise;

    // AM Audio low-pass filter (~4500 Hz cutoff at 16kHz sample rate)
    // alpha = 2*pi*fc*dt / (1 + 2*pi*fc*dt) ~= 0.55
    this._lowpass_filter += 0.55 * (input_mix - this._lowpass_filter);

    // DC Blocking filter (high-pass at ~20 Hz)
    // y[i] = x[i] - x[i-1] + R * y[i-1], R ~= 0.992
    const dc_out = this._lowpass_filter - this._dc_block_prev_in + 0.992 * this._dc_block_prev_out;
    this._dc_block_prev_in = this._lowpass_filter;
    this._dc_block_prev_out = dc_out;

    return Math.max(-1.0, Math.min(1.0, dc_out));
  }
}
