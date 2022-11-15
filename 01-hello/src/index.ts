import { $compile } from "@thi.ng/rdom";
import { Confetti } from "./confetti";

// HTML (DOM) creation via plain JS data structures (arrays)
// See: thi.ng/hiccup and related packages for further details
$compile([
	"main.ma3",
	{},
	["h1", {}, "Hello Augsburg Crew! 👋"],
	[
		"p.bg-light-yellow.pa3",
		{},
		"Our workshop repo is here: ",
		[
			"a",
			{
				class: "link b black hover-hot-pink",
				href: "https://github.com/thi-ng/ws-hsa-2022",
			},
			"github.com/thi-ng/ws-hsa-2022",
		],
	],
	// custom UI component
	new Confetti(100),
]).mount(document.body);
