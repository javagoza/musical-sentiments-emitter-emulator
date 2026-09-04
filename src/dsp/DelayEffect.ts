import { DELAY_BUFFER_SIZE } from './wavetables';

export class DelayEffect {
  private _buffer: Float32Array = new Float32Array(DELAY_BUFFER_SIZE);
  private _ptr: number = 0;
  private _feedback_prev: number = 0.0;
  private static readonly FEEDBACK: number = 0.45;

  public reset(): void {
    this._buffer.fill(0.0);
    this._ptr = 0;
    this._feedback_prev = 0.0;
  }

  public process(input_sample: number): number {
    // 1. Read delayed sample from the circular buffer
    const delayed_sample = this._buffer[this._ptr];

    // 2. Simple low-pass filtering on feedback path to prevent harsh high frequencies
    this._feedback_prev = 0.7 * this._feedback_prev + 0.3 * delayed_sample;

    // 3. Mix current input sample with filtered feedback and write back to buffer
    const raw_buf = input_sample + (this._feedback_prev * DelayEffect.FEEDBACK);
    const buffer_input = Math.max(-1.0, Math.min(1.0, raw_buf));
    this._buffer[this._ptr] = buffer_input;

    // 4. Advance circular pointer
    this._ptr++;
    if (this._ptr >= DELAY_BUFFER_SIZE) {
      this._ptr = 0;
    }

    // 5. Output mix: Dry + Wet signal
    return input_sample + (delayed_sample * 0.70);
  }
}

export function softClip(x: number): number {
  const knee = 0.7;
  if (x > knee) {
    return knee + (1.0 - knee) * Math.tanh((x - knee) / (1.0 - knee));
  }
  if (x < -knee) {
    return -knee - (1.0 - knee) * Math.tanh((-x - knee) / (1.0 - knee));
  }
  return x;
}
