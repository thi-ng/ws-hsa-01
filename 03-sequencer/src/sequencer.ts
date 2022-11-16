import { AGen, osc, sin, type Osc } from "@thi.ng/dsp";
import { clamp11 } from "@thi.ng/math";
import { pickRandom, SYSTEM } from "@thi.ng/random";
import {
	comp,
	cycle,
	mapIndexed,
	push,
	take,
	transduce,
} from "@thi.ng/transducers";
import { FS, SCALE, Voice } from "./api";
import { freqForTone } from "./scale";
import { defVoice } from "./voice";

/**
 * Random polyphonic sequencer
 */
export class Sequencer extends AGen<number> {
	voices: Voice[];
	duration: Osc;

	constructor(baseOctave = 6, numOctaves = 3) {
		super(0);
		const numNotes = SCALE.length;
		const noteRange = numOctaves * numNotes;
		const maxGain = 3 / noteRange;
		// initialize array of voices (1 per note) over num octaves
		this.voices = transduce(
			comp(
				take(noteRange),
				mapIndexed((i, tone) =>
					defVoice(
						freqForTone(
							tone,
							Math.floor(baseOctave + i / 12) * 12,
							SCALE
						),
						maxGain
					)
				)
			),
			push(),
			cycle(SCALE)
		);
		// LFO for modulating attack length
		this.duration = osc(sin, 0.1 / FS, 0.15 * FS, 0.15 * FS);
	}

	next() {
		const dur = this.duration.next();
		// only tiny chance of new note/voice trigger per frame
		// (`4 / FS` means statistically 4 triggers per second)
		if (SYSTEM.float() < 4 / FS) {
			// choose random voice
			const voice = pickRandom(this.voices);
			// reset envelope & set attack time
			voice.env.reset();
			voice.env.setAttack(dur);
			voice.env.setGain(SYSTEM.minmax(0.2, 1));
			// pick random cutoff freq & resonance for voice's filter
			voice.filter.setFreq(SYSTEM.minmax(200, 8000) / FS);
			voice.filter.setQ(SYSTEM.minmax(0.5, 0.95));
		}
		// mixdown of all voices (ensure [-1..1] interval)
		return this.voices.reduce(
			(acc, voice) => clamp11(acc + voice.gen.next()),
			0
		);
	}
}
