import { adsr, biquadLP, osc, pipe, product, saw, svfLP } from "@thi.ng/dsp";
import { pickRandom } from "@thi.ng/random";
import { FS, Voice } from "./api";
import { FilterFeedbackDelay } from "./delay";

/**
 * Creates & initializes a voice (aka oscillator + envelope) for given frequency
 * (in Hz). Initial volume is set to zero.
 *
 * @param freq
 * @param maxGain
 */
export const defVoice = (freq: number, maxGain: number): Voice => {
	// define oscillator function
	const voiceOsc = osc(saw, freq / FS, maxGain);
	// define volume envelope
	// https://en.wikipedia.org/wiki/Envelope_(music)#ADSR
	const env = adsr({
		a: FS * 0.01,
		d: FS * 0.05,
		s: 0.8,
		slen: 0,
		r: FS * 0.5,
	});
	// turn down volume until activated
	env.setGain(0);
	// lowpass filter
	const filter = svfLP(1000 / FS);
	return {
		osc: voiceOsc,
		env,
		filter,
		// multiply osc with envelope
		// then pipe through filter & feedback delay (w/ its own filter)...
		gen: pipe(
			product(voiceOsc, env),
			filter,
			new FilterFeedbackDelay(
				FS * pickRandom([0.25, 0.375, 0.5]),
				biquadLP(1000 / FS, 1.1)
			)
		),
	};
};
