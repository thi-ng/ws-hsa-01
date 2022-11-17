import { cosineGradient, COSINE_GRADIENTS, srgbIntArgb32 } from "@thi.ng/color";
import { FMT_yyyyMMdd_HHmmss } from "@thi.ng/date";
import { downloadCanvas } from "@thi.ng/dl-asset";
import { wrapOnce } from "@thi.ng/math";
import { canvas2d, defIndexed, intBuffer } from "@thi.ng/pixel";
import { Smush32 } from "@thi.ng/random";
import { Z4 } from "@thi.ng/strings";
import { range2d } from "@thi.ng/transducers";

const WIDTH = 256;
const HEIGHT = 128;

const MAX_AGE = 8;

const THRESHOLD = 2;
const RND_CHANCE = 0.01;

// Belousov-Zhabotinsky Reaction
// https://www.youtube.com/watch?v=8tArShb1fhw

// const NEIGHBORS = [[-1, 0], [0, -1], [1, 0], [0, 1]];
const NEIGHBORS = [...range2d(-1, 2, -1, 2)];

// https://github.com/thi-ng/umbrella/blob/develop/packages/color/README.md#cosine-gradients
const PALETTE = cosineGradient(MAX_AGE, COSINE_GRADIENTS["heat1"]).map(
	srgbIntArgb32
);

// format timestamp for frame recording
const SESSION = FMT_yyyyMMdd_HHmmss(Date.now());

// seedable (reproducible) pseudo random number generator
const RND = new Smush32(12345678);

// create an HTML canvas element
const canvas = canvas2d(WIDTH, HEIGHT, document.body, {
	pixelated: true,
}).canvas;

// create a new integer pixel buffer
// since we're using a palette we also need to supply it here
const img = intBuffer(WIDTH, HEIGHT, defIndexed(PALETTE));

// initialize w/ random values
img.forEach(() => RND.minmaxInt(0, MAX_AGE));

// create a copy as simulation scratchpad
const tmp = img.data.slice();

// frame counter (only used for exporting image sequence)
let frame = 0;

// simple 2D cellular automata simulation:
// https://en.wikipedia.org/wiki/Cyclic_cellular_automaton
const cyclicAutomata = () => {
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			const curr = img.getAt(x, y);
			const next = (curr + 1) % MAX_AGE;
			let num = 0;
			for (let k of NEIGHBORS) {
				// compute neighbor coordinates
				// and apply wrap around (toroidal space)
				const xx = wrapOnce(x + k[0], 0, WIDTH - 1);
				const yy = wrapOnce(y + k[1], 0, HEIGHT - 1);
				if (img.getAt(xx, yy) === next) num++;
			}
			if (num > THRESHOLD || RND.float() < RND_CHANCE) {
				tmp[x + y * WIDTH] = next;
			} else {
				tmp[x + y * WIDTH] = curr;
			}
		}
	}
	// apply new generation
	img.data.set(tmp);
	// draw into canvas (incl. pixel format conversion)
	img.blitCanvas(canvas);

	// downloadCanvas(canvas, `ca-${SESSION}-${Z4(frame)}`);
	// frame++;
};

setInterval(cyclicAutomata, 16);
