function loadImageB64(data: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.src = `data:image/png;base64,${data}`;
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", reject);
	});
}

export async function joinImagesFE(images: string[]) {
	const imageEls = await Promise.all(images.map((image) => loadImageB64(image)));
	const cols = imageEls.length <= 3 ? 1 : 2;
	const elRows = Array.from(new Array(Math.ceil(imageEls.length / cols)), (_, i) =>
		imageEls.slice(i * cols, i * cols + cols),
	);
	const rows = elRows.length;
	const fullHeight = elRows.reduce((acc, row) => acc + Math.max(...row.map((el) => el.height)), 0);
	const padding = 16;
	const wiggle = 50;
	const canvas = document.createElement("canvas");
	canvas.width = 1024 * cols + padding * 2 + cols * wiggle;
	canvas.height = fullHeight + padding * 2 + rows * wiggle;
	const ctx = canvas.getContext("2d");
	if (ctx === null) return;
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let currentStartHeight = padding;
	elRows.forEach((row) => {
		const rowHeight = Math.max(...row.map((el) => el.height)) + wiggle;
		row.forEach((el, j) => {
			const wiggleX = Math.random() * wiggle;
			const wiggleY = Math.random() * wiggle;
			// const rounded = Math.random() > 0.5;
			// if (rounded) {
			// 	clipRounded(
			// 		ctx,
			// 		(1024 + padding) * j + wiggleX,
			// 		currentStartHeight + wiggleY,
			// 		el.width,
			// 		el.height,
			// 		32,
			// 	);
			// 	ctx.clip();
			// }
			ctx.drawImage(
				el,
				(1024 + padding) * j + wiggleX,
				currentStartHeight + wiggleY,
				el.width,
				el.height,
			);
			// if (rounded) ctx.restore();
		});
		currentStartHeight += rowHeight;
	});
	return canvas.toDataURL().split(";base64,")[1];
}

// function clipRounded(
// 	ctx: CanvasRenderingContext2D,
// 	x: number,
// 	y: number,
// 	width: number,
// 	height: number,
// 	radius: number,
// ) {
// 	ctx.beginPath();
// 	ctx.moveTo(x + radius, y);
// 	ctx.lineTo(x + width - radius, y);
// 	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
// 	ctx.lineTo(x + width, y + height - radius);
// 	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
// 	ctx.lineTo(x + radius, y + height);
// 	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
// 	ctx.lineTo(x, y + radius);
// 	ctx.quadraticCurveTo(x, y, x + radius, y);
// 	ctx.closePath();
// }
