import { Color, colorFromRange } from "@thi.ng/color";
import { asSvg, circle, group } from "@thi.ng/geom";
import { SYSTEM } from "@thi.ng/random";
import { Component, NumOrElement } from "@thi.ng/rdom";
import { repeatedly } from "@thi.ng/transducers";
import { add2, rotate, Vec } from "@thi.ng/vectors";

interface Particle {
	/**
	 * Particle position
	 */
	pos: Vec;
	/**
	 * Velocity vector
	 */
	vel: Vec;
	/**
	 * Color (LCH + alpha)
	 */
	color: Color;
	/**
	 * Particle radius/size
	 */
	radius: number;
	/**
	 * Decay factor, [0..1) range
	 */
	decay: number;
}

/**
 * Custom rdom component showing a little SVG particle system animation
 */
export class Confetti extends Component {
	particles!: Particle[];

	constructor(numParticles = 50) {
		super();
		// initialize particles
		this.particles = [...repeatedly(defParticle, numParticles)];
	}

	async mount(parent: Element, index?: NumOrElement) {
		this.el = this.$el(
			"svg",
			{
				style: {
					position: "fixed",
					left: 0,
					top: 0,
					"z-index": 1,
					"pointer-events": "none",
				},
				width: "100%",
				height: "100%",
				viewBox: "0 0 100 100",
			},
			null,
			parent,
			index
		);
		// particle system update
		const updateParticles = () => {
			const particles = this.particles;
			for (let i = particles.length; i-- > 0; ) {
				const p = particles[i];
				// fade out color (alpha channel)
				p.color[3] *= p.decay;
				// remove old/invisible particles
				if (p.color[3] < 0.05 || p.pos[1] > 100) {
					particles.splice(i, 1);
				} else {
					// apply gravity to velocity
					add2(null, p.vel, [0, 0.1]);
					// apply new velocity to position
					add2(null, p.pos, p.vel);
				}
			}
			// update SVG inners by creating a circle element for each particle
			// and then serializing entire group to SVG string (there're better
			// ways of doing animation, but keeping it short & sweet here!)
			this.$html(
				asSvg(
					group(
						{},
						particles.map((p) =>
							circle(p.pos, p.radius, { fill: p.color })
						)
					)
				)
			);
			// only animate whilst there're remaining particles
			if (particles.length) requestAnimationFrame(updateParticles);
			else this.unmount();
		};
		requestAnimationFrame(updateParticles);
		return this.el;
	}
}

/**
 * Creates a new random particle
 */
const defParticle = (): Particle => ({
	pos: [50, 25],
	vel: rotate([], [0, -SYSTEM.minmax(0.5, 2)], SYSTEM.norm(Math.PI / 3)),
	color: colorFromRange("warm"),
	radius: SYSTEM.minmax(1, 2),
	decay: SYSTEM.minmax(0.95, 0.99),
});
