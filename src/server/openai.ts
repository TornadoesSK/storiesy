import { Configuration, OpenAIApi } from "openai";

import { env } from "../env/server.mjs";

const configuration = new Configuration({
	organization: "org-83IG0bBaieYkgSe888MU0eAa",
	apiKey: env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
