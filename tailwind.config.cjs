/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: { extend: {} },
	plugins: [require("daisyui")],
	// daisyui: {
	//   themes: ["light"],
	// },
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#096def",
					secondary: "#fcf19c",
					accent: "#ff9560",
					neutral: "#242C32",
					"base-100": "#303C46",
					info: "#549ECF",
					success: "#14572E",
					warning: "#EE9D3A",
					error: "#EB707C",
				},
			},
		],
	},
};
