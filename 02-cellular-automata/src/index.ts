import { cosineGradient, COSINE_GRADIENTS, srgbIntArgb32 } from "@thi.ng/color";
import { wrapOnce } from "@thi.ng/math";
import { canvas2d, defIndexed, intBuffer } from "@thi.ng/pixel";
import { SYSTEM } from "@thi.ng/random";
import { range2d } from "@thi.ng/transducers";

const WIDTH = 256;
const HEIGHT = 128;

const STATES = 8;

const THRESHOLD = 1;
const RND_CHANCE = 0;

// const NEIGHBORS = [[-1, 0], [0, -1], [1, 0], [0, 1]];
const NEIGHBORS = [...range2d(-1, 2, -1, 2)];

// https://github.com/thi-ng/umbrella/blob/develop/packages/color/README.md#cosine-gradients
const PALETTE = cosineGradient(STATES, COSINE_GRADIENTS["heat1"]).map(
	srgbIntArgb32
);

// create an HTML canvas element
const canvas = canvas2d(WIDTH, HEIGHT, document.body, {
	pixelated: true,
}).canvas;

// create a new integer pixel buffer
// since we're using a palette we also need to supply it here
const img = intBuffer(WIDTH, HEIGHT, defIndexed(PALETTE));
// initialize w/ random values
img.forEach(() => SYSTEM.minmaxInt(0, STATES));
// create a copy as simulation scratchpad
const tmp = img.data.slice();

// simple 2D cellular automata simulation:
// https://en.wikipedia.org/wiki/Cyclic_cellular_automaton
const cyclicAutomata = () => {
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			const idx = x + y * WIDTH;
			const curr = img.data[idx];
			const next = (curr + 1) % STATES;
			let num = 0;
			for (let k of NEIGHBORS) {
				// compute neighbor coordinates
				// and apply wrap around (toroidal space)
				const xx = wrapOnce(x + k[0], 0, WIDTH - 1);
				const yy = wrapOnce(y + k[1], 0, HEIGHT - 1);
				if (img.data[xx + yy * WIDTH] === next) num++;
			}
			tmp[idx] =
				num > THRESHOLD || SYSTEM.float() < RND_CHANCE ? next : curr;
		}
	}
	// apply new generation
	img.data.set(tmp);
	// draw into canvas (incl. pixel format conversion)
	img.blitCanvas(canvas);
};

setInterval(cyclicAutomata, 16);
