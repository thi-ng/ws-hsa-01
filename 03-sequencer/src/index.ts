import { download } from "@thi.ng/dl-asset";
import { wavByteArray } from "@thi.ng/dsp-io-wav";
import { FS } from "./api";
import { Sequencer } from "./sequencer";

// generate a few seconds of audio & save as WAV file
download(
	`seq-${Date.now()}.wav`,
	// render audio into byte array for output
	wavByteArray(
		// wav format configuration
		{ sampleRate: FS, channels: 1, length: FS * 60, bits: 16 },
		// stream producer
		new Sequencer(6, 5)
	)
);

// view waveform: https://audiotoolset.com/editor
