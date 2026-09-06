# Arduino Sound Messenger & DSP Synthesis Workstation

## 1. Project Overview

The Arduino Sound Messenger & DSP Synthesis Workstation is an embedded audio synthesizer, digital signal processor (DSP), and AM radio transmitter firmware designed for microcontrollers (such as the Renesas RA4M1 48 MHz ARM Cortex-M4 on the Arduino UNO R4 series) and paired with an identical, cycle-accurate web simulation runtime.

The system synthesizes polyphonic music and synthetic percussion in real time using a deterministic 16.0 kHz sampling loop. Audio is routed simultaneously or selectively through two physical output stages:
1. **Direct Analog Output**: A 12-bit Digital-to-Analog Converter (DAC) outputting line-level audio to headphones or external amplifiers.
2. **Medium Wave (MW) AM RF Output**: High-frequency Pulse Width Modulation (PWM) on a digital output pin operating as an Amplitude Modulated (AM) radio transmitter capable of broadcasting music to any nearby physical AM radio receiver across the 520 kHz to 1600 kHz Medium Wave broadcast band.

The system features an onboard human-machine interface composed of a 128x64 pixel monochrome SSD1306 OLED display, a rotary incremental encoder with integrated push-button, and an onboard diagnostic serial telemetry stream operating at 115,200 baud.

---

## 2. System Architecture and Hardware Specifications

### 2.1 Hardware Specifications and Pinout

| Subsystem | Microcontroller Pin / Resource | Specification | Description |
| :--- | :--- | :--- | :--- |
| **CPU Core** | ARM Cortex-M4F @ 48 MHz | Renesas RA4M1 (or compatible) | 32-bit hardware FPU, single-cycle multiply |
| **Audio DAC** | Pin A0 (`DAC12_OUT`) | 12-bit Voltage DAC (0 - 4095) | Direct analog audio monitoring |
| **AM RF Output** | Digital Pin 9 (PWM / GPT) | High-speed PWM (520 - 1600 kHz) | Amplitude-modulated RF carrier to antenna |
| **OLED Display** | Pin A4 (SDA), Pin A5 (SCL) | I2C Bus @ 400 kHz Fast-Mode | SSD1306 128x64 monochrome graphical display |
| **Rotary Encoder A** | Digital Pin 2 (`EXT_INT0`) | Hardware Interrupt Input | Quadrature Channel A |
| **Rotary Encoder B** | Digital Pin 3 (`EXT_INT1`) | Hardware Interrupt Input | Quadrature Channel B |
| **Encoder Button** | Digital Pin 4 | Digital Input with internal pull-up | Short, medium, and long press detection |
| **Serial Telemetry**| USB-CDC / Hardware UART | 115,200 Baud, 8-N-1 | Real-time performance and voice diagnostics |

### 2.2 Functional Blocks

The workstation architecture is divided into decoupled modular subsystems:
1. **Sequencer Engine**: Tracks song timing, steps, notes, and triggers voices according to defined BPM and rhythm fractions.
2. **Melodic Synthesizer Unit**: Four independent polyphonic voice channels featuring wavetable synthesis, linear fractional interpolation, 1st-order IIR filtering, ADSR envelopes, pitch vibrato LFO, and hardware arpeggiation.
3. **Percussion Synthesizer Unit**: Two independent dynamic percussion channels generating physical analog drums (kick, snare, hi-hats, toms, clap, crash) via pitch sweeps, exponential envelopes, and Linear Feedback Shift Register (LFSR) pseudo-random white noise.
4. **Voice Mixer & Dynamics Processor**: Applies square-root polyphony normalization ($1/\sqrt{N}$), hyperbolic tangent soft-clipping, and a feedback delay loop with high-frequency attenuation.
5. **Output Routing & Modulation Matrix**:
   - DAC mapping: Maps bipolar float $[-1.0, 1.0]$ to 12-bit unsigned unsigned integer $[0, 4095]$.
   - PWM AM carrier modulator: Maps audio samples to PWM duty cycle utilizing arcsin predistortion to linearize the fundamental RF harmonic.
6. **OLED User Interface**: Provides animated menu navigation, hardware settings adjustment, song catalog selection, and a multi-scale real-time audio oscilloscope.
7. **AM Radio Receiver Simulator**: Emulates atmospheric RF attenuation, carrier tuning curves, heterodyne whistling, diode envelope detection, and DC-blocking filters.
8. **MP3 Export Engine**: Offline double-precision rendering pipeline using a pure WebAssembly LAME MP3 encoder at 44.1 kHz, 192 kbps CBR.

---

## 3. Real-Time DSP Audio Pipeline

The synthesizer operates at a primary sampling frequency ($f_s$) of **16,000 Hz** (16.0 kHz). Every audio sample must be calculated within a strict hardware Interrupt Service Routine (ISR) budget:

$$T_{\text{budget}} = \frac{1}{f_s} = \frac{1}{16000\text{ Hz}} = 62.50\ \mu\text{s}$$

```
[Sequencer Clock] ---> [Voice 1..4 (Melody)]    \
                  ---> [Voice 5..6 (Percussion)] \
                                                  --> [Active Voice Count (N)]
                                                  --> [1/sqrt(N) Normalization]
                                                  --> [Soft-Knee Limiter]
                                                  --> [Feedback Delay Network]
                                                  --> [Master Volume Stage]
                                                         |
                                 +-----------------------+-----------------------+
                                 |                                               |
                        [12-bit DAC Scaler]                             [Arcsin Predistortion]
                                 |                                               |
                          [Pin A0 Output]                                [PWM Timer Duty Register]
                       (Headphones / Speaker)                                    |
                                                                           [Pin 9 Output]
                                                                        (MW AM Radio Antenna)
```

### 3.1 Phase Accumulation and Wavetable Generation

Each melodic channel uses a 32-bit unsigned phase accumulator (`uint32_t`). At a 16 kHz sample rate, phase advances each tick by a step proportional to note frequency $f$:

$$\Delta \text{Phase} = \left\lfloor \frac{f \cdot 2^{32}}{f_s} \right\rfloor$$

The system precomputes a 128-element array `MIDI_PHASE[128]` corresponding to MIDI notes 0 through 127 based on $A_4 = 440\text{ Hz}$ (MIDI Note 69):

$$f(n) = 440.0 \cdot 2^{\frac{n - 69}{12}}$$

#### Linear Fractional Wavetable Interpolation
All periodic waveforms are stored in 256-sample lookup tables with 16-bit signed resolution (`int16_t` in range -32767 to 32767):
- Sine (`SINE_TABLE`)
- Triangle (`TRIANGLE_TABLE`)
- Square (`SQUARE_TABLE`)
- Sawtooth (`SAW_TABLE`)
- Bright Triangle (`BRIGHT_TRIANGLE_TABLE`, exponent 0.88)
- Warm Triangle (`WARM_TRIANGLE_TABLE`, exponent 1.12)

To maintain audio fidelity without audible stepping, lookup uses 24-bit truncation for the base index and the lower 8 bits for linear fractional interpolation:

```c
// 32-bit Phase to 256-entry table index with linear fractional interpolation
uint8_t index_a = (phase >> 24) & 0xFF;
uint8_t index_b = (index_a + 1) & 0xFF;
float frac = ((phase >> 16) & 0xFF) / 256.0f;
float sample = table[index_a] + frac * (table[index_b] - table[index_a]);
```

The mathematical interpolation formula is:

$$\text{Sample} = \text{Table}[\text{Index}_A] + \text{Frac} \cdot (\text{Table}[\text{Index}_B] - \text{Table}[\text{Index}_A])$$

#### High-Frequency Smoothing Filter
The raw wavetable sample passes through an integrated first-order Infinite Impulse Response (IIR) low-pass filter to attenuate aliasing artifacts:

$$y[n] = y[n-1] + 0.30 \cdot (x[n] - y[n-1])$$

### 3.2 ADSR Envelope Generator

The Attack-Decay-Sustain-Release (ADSR) envelope generator manages amplitude dynamics through a finite state machine: `IDLE`, `ATTACK`, `DECAY`, `SUSTAIN`, and `RELEASE`.

```
Level ^
  1.0 |      /\
      |     /  \
Sust. |    /    \__________________
      |   /                        \
  0.0 +--+------+-------------------+----\---> Time
       [ATTACK][DECAY]  [SUSTAIN]  [RELEASE]
         ^                           ^
     Note On                     Note Off (Gate Off at 85%)
```

#### Step Calculation
Envelope parameters are defined in milliseconds ($t_{\text{ms}}$) and converted into linear per-sample increments:

$$\text{Samples per ms} = \frac{f_s}{1000} = 16.0$$

$$\Delta_{\text{attack}} = \frac{1.0}{t_{\text{attack}} \cdot 16.0 + 1.0}$$

$$\Delta_{\text{decay}} = \frac{1.0 - L_{\text{sustain}}}{t_{\text{decay}} \cdot 16.0 + 1.0}$$

$$\Delta_{\text{release}} = \frac{L_{\text{sustain}}}{t_{\text{release}} \cdot 16.0 + 1.0}$$

#### Gate-On Duration
To ensure distinct musical phrasing, note duration is divided into an active gate period and a release margin:
- Total note duration: $D_{\text{total}} = \frac{60}{\text{BPM}} \cdot \frac{4}{\text{Rhythm}} \cdot f_s$
- Active gate duration: $D_{\text{gate}} = \lfloor D_{\text{total}} \cdot 0.85 \rfloor$
- When the sample counter reaches $D_{\text{gate}}$, the voice automatically enters `RELEASE` state.

### 3.3 Vibrato Modulation

Vibrato introduces periodic frequency modulation around the base pitch using a dedicated 32-bit phase accumulator driven by a secondary Low-Frequency Oscillator (LFO):

$$\Delta \text{Phase}_{\text{vibrato}} = \left\lfloor \frac{2^{32} \cdot f_{\text{vibrato}}}{f_s} \right\rfloor$$

At each sample, the vibrato LFO reads from a normalized floating-point sine table:

```c
// Vibrato LFO calculation
uint8_t index_vib = (phase_vibrato >> 24) & 0xFF;
float mod_vib = 1.0f + (vibrato_depth * SINE_TABLE_F[index_vib]);
uint32_t effective_phase_step = (uint32_t)(base_phase_step * mod_vib);
```

The mathematical modulation factor is:

$$M_{\text{vib}} = 1.0 + \text{Depth}_{\text{vibrato}} \cdot \sin(2 \pi f_{\text{vibrato}} t)$$

$$\Delta \text{Phase}_{\text{effective}} = \lfloor \Delta \text{Phase}_{\text{base}} \cdot M_{\text{vib}} \rfloor$$

Typical vibrato settings:
- Subtle / Light: Depth = 0.002, Frequency = 3.0 Hz
- Medium: Depth = 0.006, Frequency = 5.0 Hz
- Deep / Operatic: Depth = 0.014, Frequency = 7.0 Hz

### 3.4 Hardware Arpeggiator

The hardware arpeggiator alternates between the fundamental note and a harmonized upper interval at high frequency without requiring additional polyphonic voices.
- Semitone Ratio Calculation:

$$R_{\text{arpeg}} = 2^{\frac{\Delta \text{Semitones}}{12}}$$

- Sub-step duration in samples:

$$S_{\text{duration}} = \max\left(1, \left\lfloor \frac{250}{\text{Speed}} \right\rfloor\right)$$

When the sub-step counter expires, an internal toggle flag flips. When active, $\Delta \text{Phase}$ is multiplied by $R_{\text{arpeg}}$, producing rapid pitch alternation.

### 3.5 Analog Drum Percussion Models

The percussion engine generates synthetic percussion using specialized physical modeling routines:

1. **Kick Drum**: Swept sine wave starting at 180 Hz decaying to 60 Hz via a dual exponential curve:
   - Pitch envelope: $f(t) = 60 + 120 \cdot e^{-t / 0.015}$
   - Amplitude envelope: $A(t) = e^{-t / 0.080}$
2. **Snare Drum**: Combination of resonant triangular/sine body (185 Hz, $\tau = 0.02\text{ s}$) and high-passed pseudo-random noise ($\tau = 0.05\text{ s}$):
   $$\text{Sample} = (0.70 \cdot \text{Noise} + 0.30 \cdot \text{Body}) \cdot A_{\text{snare}}$$
3. **Hi-Hats (Closed and Open)**: Pure white noise with fast exponential decay:
   - Closed Hat: $\tau = 0.02\text{ s}$
   - Open Hat: $\tau = 0.15\text{ s}$
4. **Crash Cymbal**: Wide-spectrum noise with extended decay ($\tau = 0.40\text{ s}$).
5. **Hand Clap**: Multi-burst envelope simulating hands contacting multiple times (three rapid bursts spaced 10 ms apart followed by a dense reverberant tail).
6. **Toms (Low, Mid, High)**: Resonant sine sweep with base frequencies of 90 Hz, 130 Hz, and 180 Hz with a +40 Hz initial strike envelope.

#### Pseudo-Random White Noise Generator (LFSR)
To eliminate memory overhead and avoid non-deterministic standard library calls, noise is generated using a 16-bit Galois Linear Feedback Shift Register:

```c
uint16_t white_noise() {
    lfsr = (lfsr >> 1) ^ (-(lfsr & 1u) & 0xB400u);
    return lfsr;
}
```

### 3.6 Polyphonic Voice Mixer and Dynamic Normalization

When summing $N$ active voices, linear scaling by $1/N$ severely reduces acoustic loudness when only one or two voices sound. Conversely, direct summation without attenuation causes digital clipping and distortion.

The engine uses acoustic power normalization based on $1/\sqrt{N}$:

$$\text{Gain}(N) = \frac{1}{\sqrt{N}}$$

Lookup table implemented in firmware:
- $N = 0$: $0.0000$
- $N = 1$: $1.0000$ (Full dynamic range for solo passages)
- $N = 2$: $0.7071$ ($-3.01\text{ dB}$)
- $N = 3$: $0.5773$ ($-4.77\text{ dB}$)
- $N = 4$: $0.5000$ ($-6.02\text{ dB}$)

The combined mix combines normalized melodic and percussion buses:

$$S_{\text{mix}} = \left(S_{\text{melodic}} \cdot V_{\text{mel}} + S_{\text{perc}} \cdot V_{\text{perc}}\right) \cdot \text{Gain}(N_{\text{active}})$$

### 3.7 Soft-Knee Limiter and Feedback Delay Network

#### Soft-Knee Saturation (Hyperbolic Tangent Curve)
To prevent wrap-around overflow while preserving punch and transient presence, samples passing threshold $K = 0.70$ are smoothly compressed using a hyperbolic tangent curve:

$$
f(x) = \begin{cases} 
x & \text{for } |x| \le K \\
K + (1.0 - K) \cdot \tanh\left(\frac{x - K}{1.0 - K}\right) & \text{for } x > K \\
-K - (1.0 - K) \cdot \tanh\left(\frac{-x - K}{1.0 - K}\right) & \text{for } x < -K
\end{cases}
$$

```c
// Soft-knee hyperbolic tangent compression curve
float soft_clip(float x) {
    const float K = 0.70f;
    if (x > K) return K + (1.0f - K) * tanhf((x - K) / (1.0f - K));
    if (x < -K) return -K - (1.0f - K) * tanhf((-x - K) / (1.0f - K));
    return x;
}
```

#### Circular Feedback Delay Loop
A 512-sample circular buffer implements a spatial echo effect:
- Delay Time: $T_d = \frac{512}{16000\text{ Hz}} = 32.0\text{ ms}$
- Damping: A low-pass filter in the feedback path ($y_{\text{fb}}[n] = 0.7 \cdot y_{\text{fb}}[n-1] + 0.3 \cdot x_{\text{delayed}}$) eliminates harsh high frequencies.
- Feedback Coefficient: $0.45$.
- Output Mix: $S_{\text{out}} = S_{\text{dry}} + 0.70 \cdot S_{\text{delayed}}$.

---

## 4. PWM RF Carrier Generation and AM Modulation

### 4.1 Theory of RF Carrier Synthesis via PWM

A digital microcontroller pin switches between $0\text{ V}$ and $V_{\text{cc}}$ ($5\text{ V}$ or $3.3\text{ V}$). When configured for high-frequency PWM at carrier frequency $f_c$ (for example, $594\text{ kHz}$ in the European MW band, or $600\text{ kHz}$ / $1000\text{ kHz}$ in the Americas), the output is a rectangular wave train.

According to Fourier analysis, a periodic pulse train of frequency $f_c$ and duty cycle $D$ ($0 \le D \le 1$) can be expressed as:

$$v(t) = D \cdot V_{\text{cc}} + \sum_{k=1}^{\infty} \frac{2 V_{\text{cc}}}{k \pi} \sin(k \pi D) \cos(2 \pi k f_c t)$$

The fundamental radio-frequency component ($k = 1$) is:

$$v_{\text{carrier}}(t) = \left[ \frac{2 V_{\text{cc}}}{\pi} \sin(\pi D) \right] \cos(2 \pi f_c t)$$

### 4.2 Duty Cycle Management and Arcsin Predistortion

Notice that the amplitude of the fundamental RF carrier is proportional to:

$$A(D) \propto \sin(\pi D)$$

Because $\sin(\pi D)$ is a non-linear transcendental function of $D$, modulating duty cycle linearly with the audio signal $s(t)$ creates severe harmonic distortion in the received AM radio audio.

To achieve pure, linear amplitude modulation:

$$A(D(t)) \propto s(t)$$

the duty cycle must be predistorted using the inverse function ($\arcsin$).

#### Operating Limits
To ensure clean switching transitions and prevent timer register underflow/overflow:
- Minimum duty fraction: $D_{\min} = 0.05$ (5%)
- Maximum duty fraction: $D_{\max} = 0.45$ (45%)
- Unmodulated carrier idle point: $D_{\text{center}} = 0.25$ (25%)

The linear dynamic range is determined by:

$$\text{SIN}_{\min} = \sin(\pi \cdot 0.05) \approx 0.15643$$

$$\text{SIN}_{\max} = \sin(\pi \cdot 0.45) \approx 0.98769$$

$$\text{SIN}_{\text{center}} = \frac{\text{SIN}_{\max} + \text{SIN}_{\min}}{2} \approx 0.57206$$

$$\text{SIN}_{\text{span}} = \frac{\text{SIN}_{\max} - \text{SIN}_{\min}}{2} \approx 0.41563$$

For any audio sample $s \in [-1.0, 1.0]$:

$$\text{Target}_{\sin} = \text{SIN}_{\text{center}} + s \cdot \text{SIN}_{\text{span}}$$

$$D = \frac{\arcsin(\text{Target}_{\sin})}{\pi}$$

In firmware, this calculation is accelerated via a 513-entry precalculated lookup table `lut_asin_duty[513]`.

#### Hardware Timer Register Application
The calculated duty fraction $D$ is scaled by the timer period register `ARR` (or `ICR1` on AVR, or `GTPR` on Renesas RA4M1):

```c
// Scale normalized duty cycle (0.0 to 1.0) to hardware timer period ticks
uint16_t pwm_compare_val = (uint16_t)(duty_cycle * timer_period_ticks);
```

The mathematical relationship is:

$$\text{PWM}_{\text{compare}} = \lfloor D \cdot T_{\text{period}} \rfloor$$

This value is written to the Output Compare Register (`OCR1A` / `GTCCR`) on every audio interrupt tick.

---

## 5. Software Architecture and Component Reference

### 5.1 Directory Structure

```
/
├── metadata.json                 # Application configuration & capabilities
├── package.json                  # NPM dependencies & scripts
├── index.html                    # Single-page HTML entry point
├── src/
│   ├── main.tsx                  # React application bootstrap
│   ├── App.tsx                   # Main interface, state coordinator, keyboard shortcuts
│   ├── index.css                 # Tailwind CSS styles and custom UI tokens
│   ├── types/
│   │   └── synth.ts              # Core TypeScript models, interfaces, and enums
│   ├── dsp/
│   │   ├── wavetables.ts         # Sample rate, MIDI phase LUT, wavetable arrays
│   │   ├── MelodySynth.ts        # Polyphonic melodic voice, ADSR, vibrato, arpeggiator
│   │   ├── PercussionSynth.ts    # Analog drum synthesis, LFSR noise, sweep generators
│   │   ├── DelayEffect.ts        # Feedback delay loop and softClip limiter
│   │   ├── amModulator.ts        # Arcsin LUT, DAC mapping, AM radio receiver emulation
│   │   └── AudioEngine.ts        # Master coordinator, 512-sample ring buffer, Web Audio pump
│   ├── data/
│   │   ├── instruments.ts        # Master instrument definitions and preset library
│   │   └── songs.ts              # 20 Emotion songs + 29 Demo showcase songs
│   ├── utils/
│   │   └── mp3Exporter.ts        # Offline DSP rendering and LAME MP3 export
│   └── components/
│       ├── OledDisplay.tsx       # 128x64 SSD1306 OLED simulator & oscilloscope
│       ├── RotaryEncoder.tsx     # Physical rotary knob, tactile button & state indicators
│       ├── AmRadioReceiver.tsx   # AM radio tuner, frequency dial, signal meter, noise gate
│       └── DiagnosticsPanel.tsx  # Telemetry tabs, voice meters, 115200 baud serial monitor
```

### 5.2 Rotary Encoder Gesture Logic

The rotary encoder driver detects three distinct user interactions:
1. **Clockwise / Counter-Clockwise Rotation**:
   - In Menu Mode: Scrolls through available songs.
   - In Playing Mode: Adjusts real-time oscilloscope zoom from $-9$ to $+9$.
   - In Settings Mode: Adjusts active parameter value.
2. **Short Click (< 600 ms)**:
   - In Menu Mode: Starts playback of the selected song.
   - In Playing Mode: Pauses / stops playback and returns to menu.
   - In Settings Mode: Toggles parameter edit mode.
3. **Medium Press (600 ms to 1800 ms)**:
   - Swaps song catalog between the 20 Emotion Songs and the 29 Feature Demo Songs.
4. **Long Press (> 1800 ms)**:
   - Opens the Hardware Settings Menu (Master Volume, Melody Level, Percussion Level, AM RF Frequency, Output Mode).

---

## 6. How to Design a New Instrument

An instrument is defined by the `Instrument` interface in `src/types/synth.ts`:

```typescript
export interface Instrument {
  name?: string;
  wave_table: Int16Array;    // 256-sample wavetable array (int16)
  adsr: ADSRParameters;      // Attack, Decay, Sustain level, Release
  arpeg: ArpeggioConfig;     // Active flag, semitone interval, speed
  volume: number;            // Normalized instrument volume (0.0 to 1.0)
  vibrato_depth: number;     // Pitch deviation depth (0.0 to 0.05)
  vibrato_freq: number;      // LFO modulation frequency in Hertz
}
```

### 6.1 Step-by-Step Instrument Design Guide

1. **Select the Wavetable**:
   - `SINE_TABLE`: Warm, pure tones (flute, glockenspiel, sub-bass).
   - `TRIANGLE_TABLE`: Mild harmonics, organic resonance (electric piano, accordion, cello).
   - `WARM_TRIANGLE_TABLE`: Smooth acoustic string character.
   - `BRIGHT_TRIANGLE_TABLE`: Piercing brass and acoustic guitars.
   - `SAW_TABLE`: Rich harmonic series (distorted leads, synth brass, aggressive bass).
   - `SQUARE_TABLE`: Hollow odd harmonics (chiptune leads, clarinets, muted basses).

2. **Configure the ADSR Envelope**:
   - For plucked strings (guitar, harp, marimba): Very fast attack ($5\text{ ms}$), moderate decay ($150\text{ ms}$), low sustain ($0.20$), medium release ($200\text{ ms}$).
   - For bowed strings and pads (violin, cello, choir): Slow attack ($150\text{ - }350\text{ ms}$), long sustain ($0.80\text{ - }0.95$), long release ($400\text{ - }800\text{ ms}$).
   - For punchy brass: Fast attack with initial punch ($20\text{ ms}$), decay down to $0.70$ sustain.

3. **Configure Vibrato**:
   - Set `vibrato_freq` between $4.5\text{ Hz}$ and $6.5\text{ Hz}$.
   - Set `vibrato_depth` between $0.003$ and $0.008$. For non-vibrato instruments, set both to $0.0$.

4. **Configure Arpeggiation (Optional)**:
   - For standard instruments, set `active: false, semitones: 0, speed: 0`.
   - For chiptune / synth instruments: `active: true, semitones: 4` (Major Third), `semitones: 7` (Fifth), or `semitones: 12` (Octave) with speed $6\text{ - }10$.

### 6.2 Code Example: Creating a Custom Acoustic Cello Instrument

Add your instrument definition to `src/data/instruments.ts`:

```typescript
import type { Instrument } from '../types/synth';
import { WARM_TRIANGLE_TABLE } from '../dsp/wavetables';

export const INST_CUSTOM_CHAMBER_CELLO: Instrument = {
  name: 'Chamber Cello',
  wave_table: WARM_TRIANGLE_TABLE,
  adsr: {
    attack_ms: 80,       // Gentle bow attack
    decay_ms: 180,       // Settles into sustained vibration
    sustain_level: 0.85, // High sustain while note is held
    release_ms: 320      // Natural body resonance tail
  },
  arpeg: {
    active: false,
    semitones: 0,
    speed: 0
  },
  volume: 0.82,          // Calibrated channel volume
  vibrato_depth: 0.005,  // Human hand vibrato depth
  vibrato_freq: 5.2      // 5.2 Hz modulation rate
};
```

---

## 7. How to Design a New Voice

A `Voice` represents a single melodic or percussion musical track inside a song:

```typescript
export interface Voice {
  type: VoiceType;           // VoiceType.MELODY or VoiceType.PERCUSSION
  sequence: number[];        // Pitch offsets relative to tonic, or PercussionType enums
  rhythm: number[];          // Note duration fractions
  total_steps: number;       // Number of steps in the sequence
  instrument: Instrument | null; // Instrument for melody, or null for percussion
}
```

### 7.1 Melodic Voice Rules

- **`type`**: Must be `VoiceType.MELODY`.
- **`sequence`**: An array of semitone offsets added to the song's root `tonic` note.
  - $0$ = Tonic note (e.g., if tonic is 60, 0 = Middle C).
  - $4$ = Major Third (+4 semitones).
  - $7$ = Perfect Fifth (+7 semitones).
  - $12$ = One Octave Up (+12 semitones).
  - $-12$ = One Octave Down (-12 semitones).
- **`rhythm`**: Note length fraction using standard musical denominators:
  - $1$ = Whole note (4 beats)
  - $2$ = Half note (2 beats)
  - $4$ = Quarter note (1 beat)
  - $8$ = Eighth note (0.5 beats)
  - $16$ = Sixteenth note (0.25 beats)
- **`total_steps`**: Must equal `sequence.length` and `rhythm.length`.
- **`instrument`**: Reference to any defined `Instrument`.

### 7.2 Percussion Voice Rules

- **`type`**: Must be `VoiceType.PERCUSSION`.
- **`instrument`**: Set to `null`.
- **`sequence`**: Elements must be constants from `PercussionType`:
  - `PercussionType.NONE` (0 - Rest step)
  - `PercussionType.KICK` (1)
  - `PercussionType.SNARE` (2)
  - `PercussionType.HIHAT_CLOSED` (3)
  - `PercussionType.HIHAT_OPEN` (4)
  - `PercussionType.CRASH` (5)
  - `PercussionType.CLAP` (6)
  - `PercussionType.TOM_LOW` (7)
  - `PercussionType.TOM_MID` (8)
  - `PercussionType.TOM_HIGH` (9)

---

## 8. How to Design a New Song

A `Song` packages up to 4 melodic voices and up to 2 percussion voices into an arranged composition:

```typescript
export interface Song {
  voices: Voice[];
  total_voices: number;
  tonic: number;    // MIDI note root (e.g., 60 = Middle C, 57 = A3, 48 = C3)
  bpm: number;      // Beats per minute (e.g., 60 to 180)
  title: string;    // Display title on OLED and Serial Monitor
}
```

### 8.1 Step-by-Step Composition Workflow

1. Choose a root `tonic` (MIDI note number). Middle C ($C_4$) is 60, $A_3$ is 57, $C_3$ is 48.
2. Select a `bpm` tempo (e.g., 120 BPM).
3. Create melodic parts (Lead, Counterpoint, Harmony Pad, Bassline).
4. Create percussion parts (Kick/Snare rhythm, Hi-Hat patterns).
5. Ensure step durations align across voices so bars loop and resolve synchronously.

### 8.2 Code Example: Multi-Track Polyphonic Composition

Add your song definition to `src/data/songs.ts`:

```typescript
import { VoiceType, PercussionType, type Song } from '../types/synth';
import * as Inst from './instruments';

export const song_midnight_odyssey: Song = {
  title: 'MIDNIGHT ODYSSEY',
  tonic: 57, // A3 root
  bpm: 124,
  total_voices: 4, // 3 Melodic voices + 1 Percussion voice
  voices: [
    // Voice 1: Lead Melody (Warm Triangle / Brass)
    {
      type: VoiceType.MELODY,
      instrument: Inst.INST_CONFIDENCE_BRASS,
      sequence: [0, 3, 7, 12, 10, 7, 3, 2],
      rhythm:   [4, 4, 4,  4,  4, 4, 4, 4],
      total_steps: 8
    },

    // Voice 2: Harmonic Pad / Arpeggio
    {
      type: VoiceType.MELODY,
      instrument: Inst.INST_WARM_SHIMMER_PAD,
      sequence: [12, 15, 19, 24, 22, 19, 15, 14],
      rhythm:   [ 4,  4,  4,  4,  4,  4,  4,  4],
      total_steps: 8
    },

    // Voice 3: Bassline (Deep Sub / Sawtooth)
    {
      type: VoiceType.MELODY,
      instrument: Inst.INST_UKULELE_BASS,
      sequence: [-12, -12, -5, -5, -7, -7, -12, -12],
      rhythm:   [  4,   4,  4,  4,  4,  4,   4,   4],
      total_steps: 8
    },

    // Voice 4: Analog Drum Kit
    {
      type: VoiceType.PERCUSSION,
      instrument: null,
      sequence: [
        PercussionType.KICK,
        PercussionType.HIHAT_CLOSED,
        PercussionType.SNARE,
        PercussionType.HIHAT_OPEN,
        PercussionType.KICK,
        PercussionType.HIHAT_CLOSED,
        PercussionType.SNARE,
        PercussionType.CRASH
      ],
      rhythm: [4, 4, 4, 4, 4, 4, 4, 4],
      total_steps: 8
    }
  ]
};
```

Register `song_midnight_odyssey` in the exported catalog array in `src/data/songs.ts`:

```typescript
export const PLAYER_SONGS: Song[] = [
  song_pure_joy,
  song_midnight_odyssey, // Added here
  // ... other songs
];
```

---

## 9. Telemetry and Serial Monitor Output

The system transmits real-time telemetry over the hardware UART serial interface at **115,200 baud, 8-N-1**. This stream provides cycle-by-cycle insight into CPU loading, interrupt latency, memory consumption, buffer occupancy, and voice execution states.

### 9.1 Serial Initialization Banner

Upon reset, the boot sequence outputs hardware validation data:

```text
[0.000s] Arduino Sound Messenger Firmware v2.4 booted.
[0.002s] Renesas RA4M1 48MHz Cortex-M4 initialized.
[0.005s] DAC12 hardware channel active on Pin A0 (DAC_OUTPUT).
[0.008s] Timer GPT7 configured for AM PWM RF carrier on Pin 9 (594 kHz).
[0.012s] Audio sampling timer ISR locked at 16,000 Hz (T = 62.50 µs).
[0.015s] Wavetables cached: SINE, SQUARE, SAW, TRIANGLE, NOISE (16-bit).
```

### 9.2 Real-Time DSP Diagnostics Report

While running, the telemetry panel updates the following parameters:

```text
======================================================
              DSP RUNTIME PERFORMANCE REPORT
======================================================
DSP execution state:     ACTIVE (PUMPING ISR)
Average ISR cycle time:  14.28 µs
Worst ISR cycle peak:    28.90 µs
Budget per sample:       62.50 µs (@ 16.0 kHz sample rate)
Circular ring buffer:    384 / 512 samples
Clipping limiter hits:   0 events
Underrun dropouts:       0 (0 samples)
LAME MP3 Engine:         Online (44.1 kHz, 192 kbps CBR Export)
======================================================
```

### 9.3 Field Explanations

1. **Average ISR cycle time (`dspAverageUs`)**: The average duration in microseconds spent executing the full synthesis and mixing pipeline per sample tick. In nominal conditions with 4 melodic voices and 2 drums active, this value stays between 12 µs and 22 µs.
2. **Worst ISR cycle peak (`dspWorstUs`)**: The single worst execution spike recorded. Must remain below the 62.50 µs budget. If this exceeds 62.50 µs, a warning flag (`WARNING: ISR overrun risk`) is raised.
3. **Budget per sample**: Hardware timer period fixed at 62.50 µs ($1 / 16000\text{ s}$). CPU headroom percentage is calculated as:

$$\text{Headroom (\%)} = \frac{62.50 - t_{\text{avg}}}{62.50} \cdot 100$$
4. **Circular ring buffer**: Tracks real-time audio sample queue fill level (`buf_head - buf_tail & 511`). Nominal level hovers near $384\text{ / }512$.
5. **Clipping limiter hits**: Increments whenever the raw voice sum passes $+1.0$ or $-1.0$ before being clamped by the soft-knee tanh compression stage.
6. **Underrun dropouts**: Tracks instances where the output audio consumer requested samples before the DSP ISR had written them to the ring buffer. Zero underruns indicates glitch-free, jitter-free playback.

---

## 10. Oscilloscope and OLED Rendering Engine

The onboard SSD1306 128x32 OLED displays a high-performance audio oscilloscope rendered directly from the synthesized sample stream.

### 10.1 Display Modes and Default Screen Layout

The oscilloscope features two operational display layouts depending on the active zoom level:

1. **Default Normal View (`scope_zoom_level = 0`, `scope_fullscreen = false`)**:
   - **Rows 0–6 (Compact Status Header)**: Displays live telemetry including peak amplitude percentage (`P<peak>`), root-mean-square power (`R<rms>`), active synthesizer voice count (`V<voices>`), and dominant fundamental frequency (`--Hz`, `xxxHz`, or `x.xkHz`). An inverted alert box (`!`) illuminates at the upper-right corner if peak amplitude exceeds $0.95$.
   - **Rows 8–25 (18-Pixel Waveform Window)**: Renders the active waveform centered at row 17 with amplitude $\pm 8$ pixels, complete with a dashed horizontal reference axis (every 8 pixels) and min/max envelope decimation vectors.
   - **Rows 27–31 (Bottom Level Meter)**: A 5-pixel horizontal power bar showing real-time RMS signal fill with an instantaneous peak marker line.

```
+-------------------------------------------------------------+
| P42 R18 V3                  440Hz                       [!] |
|                     /\          /\                          |
| -------------------/--\--------/--\------------------------ |
|                        \      /    \      /                 |
|                         \____/      \____/                  |
| [====================|                                    ] |
+-------------------------------------------------------------+
```

2. **Fullscreen Waveform View (`scope_zoom_level != 0`, `scope_fullscreen = true`)**:
   - **Columns 0–123 (Full-Height Oscilloscope)**: Expands waveform amplitude to $\pm 15$ pixels across the entire 32-pixel OLED matrix (centered at row 16), maximizing visibility of complex harmonic timbres.
   - **Columns 124–127 (Dedicated Sound-Power Column)**: The rightmost 4 pixels are reserved for a dual vertical sound-power meter, displaying a vertical RMS fill column and a horizontal peak indicator bar.

```
+----------------------------------------------------------+--+
|           /\                  /\                         |  |
|          /  \                /  \                        |--| <- Peak
| --------/----\--------------/----\-----------------------|  |
|               \    /\      /      \    /\                |##|
|                \  /  \    /        \  /  \               |##| <- RMS
|                 \/    \__/          \/    \__/           |##|
+----------------------------------------------------------+--+
```

### 10.2 Additive Multi-Scale Zoom Pipeline

To observe both microscopic single-cycle transients and macroscopic rhythmic bars while preserving responsive rendering, the oscilloscope uses an additive zoom algorithm from $-9$ to $+9$:

- **Base Stride ($\text{base\_stride} = 5$ samples/point)**: Calculated from the 16.0 kHz sample rate and 40 ms refresh window ($\frac{16000 \times 40\text{ ms}}{1000 \times 128} = 5$).
- **First Detent (Level $\pm 1$)**: Magnitude 1 switches directly into **Fullscreen Mode** while keeping the exact same base time-base (5 samples/point, $0$ extra steps).
- **Zoom Out ($+2$ to $+9$)**: From the second detent onward, the time-base grows additively by $5$ samples/point per step:
  $$\text{stride} = \text{base\_stride} + (\text{magnitude} - 1) \times 5$$
  At maximum zoom level $+9$, the stride reaches $45$ samples/point ($360\text{ ms}$ per 128-point display frame), keeping animations continuously alive and fluid instead of stalling.
- **Zoom In ($-2$ to $-9$)**: Decreases stride additively by $5$ samples/point, clamping cleanly at $1\text{ sample/point}$ (raw single-sample resolution for maximum detail).

### 10.3 Continuous Double-Buffered Capture and Envelope Preservation

To eliminate animation freezes and prevent aliasing when downsampling to the 128-column display buffer:
1. **Double Buffering**: Audio DSP samples are captured into an active accumulation buffer and committed atomically to a dedicated display buffer upon completing 128 points, immediately re-arming capture for continuous, glitch-free 60 fps rendering.
2. **Min/Max Envelope Vectors**: The capture engine records both the minimum and maximum sample values within each decimation interval ($\text{Min}[x]$ and $\text{Max}[x]$), rendering a vertical vector between them so transient percussion spikes and sharp FM edges remain visible at any zoom setting.

---

## 11. Offline MP3 Export Pipeline

The workstation includes a native offline rendering engine (`src/utils/mp3Exporter.ts`) capable of generating standard `.MP3` audio files:

1. **Deterministic DSP Render**: Synthesizes the active song at double precision, running the identical 16.0 kHz sampling loop without real-time delays.
2. **Band-Limited Cubic Resampling**: High-quality polyphase Hermite cubic interpolation converts the 16.0 kHz DSP stream to broadcast-standard **44.1 kHz** stereo audio.
3. **LAME MP3 Encoding**: A WebAssembly build of the LAME encoder encodes the stream into a Constant Bitrate (CBR) **192 kbps, 44.1 kHz stereo MP3**.
4. **Direct Browser Delivery**: The generated binary buffer is packed into an `audio/mpeg` Blob and triggered as an automatic browser file download named after the song title (e.g., `pure_joy_44k.mp3`).

---

## 12. Compilation and Development Commands

This project is built using TypeScript, Vite, React, and Tailwind CSS.

### 12.1 Development Mode

Launch the local development server on port 3000:

```bash
npm run dev
```

### 12.2 Production Build

Compile and bundle the production assets into `dist/`:

```bash
npm run build
```

### 12.3 Code Validation

Run the TypeScript compiler to verify static type consistency across all DSP models, data tables, and user interface components:

```bash
npm run lint
```
