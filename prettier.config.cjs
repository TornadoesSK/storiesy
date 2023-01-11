/** @type {import("prettier").Config} */
module.exports = {
	plugins: [require.resolve("prettier-plugin-tailwindcss")],
	endOfLine: "lf",
	trailingComma: "all",
	printWidth: 100,
	useTabs: true,
	semi: true,
};
