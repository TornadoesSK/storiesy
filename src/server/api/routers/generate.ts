import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type textPrompt } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type OpenAIApi } from "openai";
import { type paths } from "../../../utils/customModelApiSchema";
import { Fetcher } from "openapi-typescript-fetch";
import { env } from "../../../env/server.mjs";

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
	single: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
				model: z.enum(["dalle", "stablediffusion"]),
				sceneCount: z.number().default(4),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// throw "here";
			const basePrompt = generateBasePrompt({ sceneCount: input.sceneCount });
			const chatOutput = await promptChat(ctx.openai, basePrompt, input.prompt);

			async function saveToDb(
				extraProps: Partial<Omit<textPrompt, "input" | "output" | "systemPrompt">>,
			) {
				await ctx.prisma.textPrompt.create({
					data: {
						input: input.prompt,
						output: chatOutput,
						systemPrompt: basePrompt,
						...extraProps,
					},
				});
			}

			const processedChatOutput = parseChatOutput(chatOutput);
			if (!processedChatOutput.success) {
				await saveToDb({ error: processedChatOutput.error });
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: processedChatOutput.error });
			}

			const promises = processedChatOutput.data.scenes
				.slice(0, input.sceneCount)
				.map(async (scene) => {
					return {
						...scene,
						// imageSrc: {
						// 	type: "url",
						// 	url: "https://picsum.photos/1024/1024",
						// },
						imageSrc: await (input.model === "dalle"
							? promptImageDalle(ctx.openai, scene.imagePrompt)
							: promptImageStableDiffusion(scene.imagePrompt)),
					};
				});

			const result = await Promise.all(promises);
			await saveToDb({ imageUrls: JSON.stringify(result.map((scene) => scene.imageSrc)) });

			return { scenes: result };
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
	return {
		type: "url",
		url: (
			await openai.createImage({
				prompt: prompt,
				n: 1,
				size: "1024x1024",
				response_format: "url",
			})
		).data.data[0]?.url,
	};
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
