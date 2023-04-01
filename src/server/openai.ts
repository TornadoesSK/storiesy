import { Configuration, OpenAIApi } from "openai";

import { env } from "../env/server.mjs";

const configuration = new Configuration({
	organization: env.OPENAI_ORGANIZATION_NAME,
	apiKey: env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
