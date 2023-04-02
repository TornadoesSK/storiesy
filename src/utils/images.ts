import { type textOutputSchema } from "../server/api/routers/generate";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { type SKRSContext2D } from "@napi-rs/canvas";

export async function joinImages(images: string[]) {
	const imageEls = await Promise.all(
		images.map((image) => loadImage("data:image/png;base64," + image)),
	);
	const cols = imageEls.length <= 3 ? 1 : 2;
	const elRows = Array.from(new Array(Math.ceil(imageEls.length / cols)), (_, i) =>
		imageEls.slice(i * cols, i * cols + cols),
	);
	const fullHeight = elRows.reduce((acc, row) => acc + Math.max(...row.map((el) => el.height)), 0);
	const canvas = createCanvas(1024 * cols, fullHeight);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let currentHeight = 0;
	elRows.forEach((row) => {
		const rowHeight = Math.max(...row.map((el) => el.height));
		row.forEach((el, j) => {
			ctx.drawImage(el, 1024 * j, currentHeight, el.width, el.height);
		});
		currentHeight += rowHeight;
	});
	return canvas.toDataURL().split(";base64,")[1];
}

export async function processImage(
	image: string,
	speechBubble: typeof textOutputSchema._output["scenes"][number]["speechBubble"],
) {
	const imageEl = await loadImage("data:image/png;base64," + image);
	const fakeContext = createCanvas(1, 1).getContext("2d");
	const wrappedText = wrapText(
		fakeContext,
		`${speechBubble?.characterName}: ${speechBubble?.text}`,
		10,
		1024 + 48 + 8,
		210,
		48,
	);
	const canvas = createCanvas(1024, 1024 + 48 * wrappedText.length + 8 + 8);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(imageEl, 0, 0, 1024, 1024);
	ctx.font = "48px Arial";
	wrappedText.forEach(function (item) {
		ctx.fillText(item[0], item[1], item[2]);
	});

	return canvas.toDataURL().split(";base64,")[1];
}

export function wrapText(
	ctx: SKRSContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
) {
	// First, start by splitting all of our text into words, but splitting it into an array split by spaces
	const words = text.split(" ");
	let line = ""; // This will store the text of the current line
	let testLine = ""; // This will store the text when we add a word, to test if it's too long
	const lineArray = []; // This is an array of lines, which the function will return

	// Lets iterate over each word
	for (let n = 0; n < words.length; n++) {
		// Create a test line, and measure it..
		testLine += `${words[n]} `;
		const metrics = ctx.measureText(testLine);
		const testWidth = metrics.width;
		// console.log({ word: words[n], testWidth });
		// If the width of this test line is more than the max width
		if (testWidth > maxWidth && n > 0) {
			// Then the line is finished, push the current line into "lineArray"
			lineArray.push([line, x, y] as const);
			// Increase the line height, so a new line is started
			y += lineHeight;
			// Update line and test line to use this word as the first word on the next line
			line = `${words[n]} `;
			testLine = `${words[n]} `;
		} else {
			// If the test line is still less than the max width, then add the word to the current line
			line += `${words[n]} `;
		}
		// If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
		if (n === words.length - 1) {
			lineArray.push([line, x, y] as const);
		}
	}
	// Return the line array
	return lineArray;
}
