/**
 * Convert semitone from scale to absolute frequency (in Hz).
 *
 * @param semiTone
 * @param transpose
 * @param scale
 */
export const freqForTone = (
	semiTone: number,
	transpose = 0,
	scale: number[]
) => {
	const limit = scale.length;
	const octave = Math.floor(semiTone / limit);
	semiTone %= limit;
	return Math.pow(2, (octave * 12 + scale[semiTone] + transpose) / 12.0);
};
