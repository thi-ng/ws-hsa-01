import { Delay, IProc } from "@thi.ng/dsp";
import { clamp01 } from "@thi.ng/math";

/**
 * This class will be part of next @thi.ng/dsp release... (i.e. this is a
 * variation of the existing FeedbackDelay proc, but with additional filter/proc
 * possibility for the feedback itself)
 */
export class FilterFeedbackDelay extends Delay<number> {
	constructor(
		n: number,
		public filter: IProc<number, number>,
		protected _feedback = 0.8
	) {
		super(n, 0);
		this.setFeedback(_feedback);
	}

	next(x: number) {
		return super.next(
			x + this.filter.next(this._buf[this._rpos] * this._feedback)
		);
	}

	feedback() {
		return this._feedback;
	}

	setFeedback(feedback: number) {
		this._feedback = clamp01(feedback);
	}
}
