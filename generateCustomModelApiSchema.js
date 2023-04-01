/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const { execSync } = require('child_process');
const command = `npx openapi-typescript ${process.env.CUSTOM_IMAGE_MODEL_API_URL}openapi.json --output src/utils/customModelApiSchema.ts`;
console.log(`Running command ${command}`);
execSync(command)