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
					primary: "#5e0fbc",
					secondary: "#fcf19c",
					accent: "#ff9560",
					neutral: "#242C32",
					"neutral-light": "#ccc",
					info: "#549ECF",
					success: "#14572E",
					warning: "#EE9D3A",
					error: "#e8302f",
				},
			},
		],
	},
};
