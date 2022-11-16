import type { ADSR, IGen, Osc, SVF } from "@thi.ng/dsp";

// sample frequency/rate (in Hz)
export const FS = 48000;

// Major scale (12 tone equal temperament)
// https://en.wikipedia.org/wiki/Equal_temperament
export const SCALE = [0, 2, 4, 5, 7, 9, 11];

export interface Voice {
	/**
	 * Oscillator (w/ arbitrary waveform)
	 */
	osc: Osc;
	/**
	 * Volume envelope
	 */
	env: ADSR;
	/**
	 * Filter (or effect in general)
	 */
	filter: SVF;
	/**
	 * Combined generator (possibly with effects)
	 */
	gen: IGen<number>;
}
