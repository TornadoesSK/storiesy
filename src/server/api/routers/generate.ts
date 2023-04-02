import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type OpenAIApi } from "openai";
import { type paths } from "../../../utils/customModelApiSchema";
import { Fetcher } from "openapi-typescript-fetch";
import { env } from "../../../env/server.mjs";
import mergeImages from 'merge-base64';
import { Canvas } from '@napi-rs/canvas';

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

const textOutputSchema = z.object({
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
				return {
					...scene,
					imageSrc: await (input.model === "dalle"
						? promptImageDalle(ctx.openai, scene.imagePrompt)
						: promptImageStableDiffusion(scene.imagePrompt)),
				};
			});
			const result = await Promise.all(promises);
			//const mergedImageB64 = await mergeImagesIntoComic(result);
			console.log("Merged items horizontally!");

			// log to db
			await ctx.prisma.imagePrompt.create({
				data: {
					input: JSON.stringify(input.scenes.map((scene) => scene.imagePrompt)),
					output: JSON.stringify(result),
				},
			});
			return { scenes: result, comic: null };
		}),
});

async function addTextToImage(base64String: string | undefined, text: string): Promise<string> {
	// Create a new Image object and set its src to the Base64 string
	console.log("Starttttttt")
	const img = new Image();
	img.src = 'data:image/png;base64,' + base64String;
  
	// Wait for the image to load before drawing it on the canvas
	await new Promise((resolve, reject) => {
	  img.onload = () => resolve(true);
	  img.onerror = reject;
	});
  
	console.log("After promise")
	// Create a new canvas with the same size as the image
	const canvas = new Canvas(img.width, img.height + 50); // add 50 pixels for the text
  
	// Get the 2D rendering context
	const ctx = canvas.getContext('2d');
  
	// Create a new Canvas.Image object and set its data to the img object's src property
	console.log("Create canvas img")
	const canvasImg = canvas.createImage();
	canvasImg.src = img.src;
	console.log("created cnvas obrazok")
  
	// Draw the image on the canvas
	ctx.drawImage(canvasImg, 0, 0);
  
	// Set the font and text properties
	ctx.font = '24px Arial';
	ctx.fillStyle = 'red';
	ctx.textAlign = 'center';
  
	// Draw the text below the image
	const textX = img.width / 2;
	const textY = img.height + 30; // adjust as needed
	ctx.fillText(text, textX, textY);
  
	// Get the canvas data as a Base64 string
	const result = canvas.toBuffer('image/png').toString('base64');
  
	// Return the Base64 string
	return result;
  }

async function mergeImagesIntoComic(result: string | any[]) {
	const verticalB64: any[] = [];

	for (let i = 0; i < result.length; i += 2) {

		if (i + 1 < result.length) {
			const mergedImage = await mergeImages([result[i].imageSrc.data, result[i + 1].imageSrc.data]);
			verticalB64.push(mergedImage);
		} else {
			verticalB64.push(result[i].imageSrc.data);
		}
	}

	console.log("Merged items vertically!");
	
	// result is in base64
	const toReturn = await mergeImages(verticalB64);
	console.log("Merged items horrizontally first");
	return toReturn;
}

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

type ImagePromptOutput =
	| {
			type: "url";
			url?: string;
	  }
	| {
			type: "base64";
			data?: string;
	  };

async function promptImageDalle(openai: OpenAIApi, prompt: string): Promise<ImagePromptOutput> {
	console.log("Prompting Dall-E for images");
	const dataImage = {
		type: "base64",
		data: (
			await openai.createImage({
				prompt: prompt,
				n: 1,
				size: "1024x1024",
				response_format: "b64_json",
			})
		).data.data[0]?.b64_json,
	};

	console.log("START GENERATING TEXT")
	dataImage.data = await addTextToImage(dataImage.data, "test string");

	console.log("GENERATED TEXT")
	return dataImage;
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
