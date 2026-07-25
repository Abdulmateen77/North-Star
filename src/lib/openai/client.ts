import OpenAI from "openai";

import { AppError } from "../errors";
import { getEnv } from "../env";

export function createOpenAIClient(): OpenAI {
  const env = getEnv();

  if (!env.OPENAI_API_KEY) {
    throw new AppError({
      statusCode: 500,
      code: "OPENAI_NOT_CONFIGURED",
      message: "OpenAI API key is not configured.",
    });
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}
