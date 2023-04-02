import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type OpenAIApi } from "openai";
import { type paths } from "../../../utils/customModelApiSchema";
import { Fetcher } from "openapi-typescript-fetch";
import { env } from "../../../env/server.mjs";
import { joinImages, processImage } from "../../../utils/images";
import { isTruthy } from "../../../utils/isTruthy";

const fetcher = Fetcher.for<paths>();
fetcher.configure({
	baseUrl: env.CUSTOM_IMAGE_MODEL_API_URL,
});

function generateBasePrompt({ sceneCount }: { sceneCount: number }) {
	return `\
Your task is to create stories based on the user prompt.\
The story will be in a comics format - it will have an image and some dialogue.\
The whole story must be understandable for the reader only based on the dialogue.

You need to imagine ${sceneCount} scenes from this comic.\
Create a prompt for an image generation AI, like DallE or Stable Diffusion.\
For each scene, list all important characters (not characters in the background).\
For each scene, output the name of the character speaking and what they say.\

Provide all of this in JSON - the schema is\
\`{ "scenes":\
	[{ "imagePrompt": "string",\
	"speechBubble": { "characterName": "string", "text": "string" },\
	"charactersShown" [ "string" ]\
}],\
"characterDescriptions": [{ "characterName": "string", "verboseDescription": "string" }]\
}\`.\
If you need to use quotes, use apostrophes instead to not break the JSON.\
Do not output anything apart from the JSON.`;
}

export const textOutputSchema = z.object({
	scenes: z.array(
		z.object({
			imagePrompt: z.string(),
			speechBubble: z
				.object({
					characterName: z.string().nullish(),
					text: z.string(),
				})
				.optional(),
			charactersShown: z.array(z.string()),
		}),
	),
	characterDescriptions: z.array(
		z.object({
			characterName: z.string(),
			verboseDescription: z.string(),
		}),
	),
});

export const generateRouter = createTRPCRouter({
	imageConfig: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
				sceneCount: z.number().default(4),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const basePrompt = generateBasePrompt({ sceneCount: input.sceneCount });
			const chatOutput = await promptChat(ctx.openai, basePrompt, input.prompt);
			const processedChatOutput = parseChatOutput(chatOutput);
			// log to db
			await ctx.prisma.textPrompt.create({
				data: {
					input: input.prompt,
					output: chatOutput,
					systemPrompt: basePrompt,
					error: processedChatOutput.error,
				},
			});
			if (!processedChatOutput.success) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: processedChatOutput.error });
			}
			return processedChatOutput.data;
		}),
	images: protectedProcedure
		.input(
			z.object({
				model: z.enum(["dalle", "stablediffusion"]),
				scenes: z.array(
					z.object({
						imagePrompt: z.string(),
						speechBubble: z
							.object({
								characterName: z.string().nullish(),
								text: z.string(),
							})
							.optional(),
					}),
				),
				sceneLimit: z.number().default(4),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const promises = input.scenes.slice(0, input.sceneLimit).map(async (scene) => {
				try {
					const image = await promptImage(ctx.openai, scene.imagePrompt, input.model);
					return image.data
						? {
								image: await processImage(image.data, scene.speechBubble),
								speechBubble: scene.speechBubble,
						  }
						: null;
				} catch (e) {
					console.log(`Failed at processing prompt: ${scene.imagePrompt}`);
					throw e;
				}
			});
			const result = (await Promise.all(promises)).filter(isTruthy);

			console.log("Images processed. Joining...");
			// const singleImage = await joinImages(result);
			// log to db
			// await ctx.prisma.imagePrompt.create({
			// 	data: {
			// 		input: JSON.stringify(input.scenes.map((scene) => scene.imagePrompt)),
			// 		output: singleImage ?? "",
			// 	},
			// });
			return result;
		}),
});

async function promptChat(openai: OpenAIApi, basePrompt: string, prompt: string) {
	console.log("Prompting ChatGPT for dialogue and image prompts...");
	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content: basePrompt,
			},
			{ role: "user", content: prompt },
		],
	});

	return completion.data.choices[0]?.message?.content ?? "ERROR";
}

type ImagePromptOutput = {
	type: "base64";
	data?: string;
};

async function promptImage(openai: OpenAIApi, prompt: string, model: "dalle" | "stablediffusion") {
	try {
		const imagePrompt = `${prompt}. Photorealistic. 4k beautiful photography.`;
		return await (model === "dalle"
			? promptImageDalle(openai, imagePrompt)
			: promptImageStableDiffusion(imagePrompt));
	} catch (e) {
		console.log(`Failed at image prompt: ${prompt}`);
		throw e;
	}
}

async function promptImageDalle(openai: OpenAIApi, prompt: string): Promise<ImagePromptOutput> {
	console.log("Prompting Dall-E for images");
	const imageData = (
		await openai.createImage({
			prompt: prompt,
			n: 1,
			size: "1024x1024",
			response_format: "b64_json",
		})
	).data.data[0]?.b64_json;
	try {
		const fetchResult = await fetch("http://dev.jednanula.sk:8085/cartoonize", {
			method: "POST",
			body: JSON.stringify({ image: imageData }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const json = await fetchResult.json();
		const cartooned = json.image;
		return {
			type: "base64",
			data: cartooned,
		};
	} catch (e) {
		console.log("Cartoonize failed");
		throw e;
	}
}

async function promptImageStableDiffusion(prompt: string): Promise<ImagePromptOutput> {
	console.log("Prompting Stable Diffusion for images");
	const loginResponse = await fetch(`${env.CUSTOM_IMAGE_MODEL_API_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `username=admin&password=${env.CUSTOM_IMAGE_MODEL_API_PASSWORD}`,
	});
	const cookie = loginResponse.headers.get("set-cookie");
	if (!cookie) {
		throw new Error("Failed to get cookie from login response");
	}

	const promptResponse = await fetch(`${env.CUSTOM_IMAGE_MODEL_API_URL}/sdapi/v1/txt2img`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Cookie: cookie,
		},
		body: JSON.stringify({ prompt }),
	});
	if (!promptResponse.ok) {
		throw new Error(`Failed to send prompt: ${promptResponse.status} ${promptResponse.statusText}`);
	}
	return { type: "base64", data: (await promptResponse.json()).images?.[0] };
}

function parseChatOutput(output: string) {
	let parsedJson;
	try {
		parsedJson = JSON.parse(output);
	} catch (e) {
		return {
			success: false as const,
			error: `Badly formatted JSON ${e instanceof Error ? e.message : "weird error"}`,
		};
	}

	const parseResult = textOutputSchema.safeParse(parsedJson);
	if (!parseResult.success) {
		return { success: false as const, error: JSON.stringify(parseResult.error.issues) };
	}

	const scenes = parseResult.data.scenes.map((scene) => {
		const characterDescriptions = scene.charactersShown.map((character) => {
			const description = parseResult.data.characterDescriptions.find(
				(desc) => desc.characterName === character,
			)?.verboseDescription;
			return `${character} is ${description}`;
		});
		return { ...scene, imagePrompt: `${scene.imagePrompt}${characterDescriptions.join(". ")}` };
	});

	return { success: true as const, data: { scenes } };
}
