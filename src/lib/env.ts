import { z } from "zod";

/**
 * Environment files commonly contain blank assignments (`OPENAI_API_KEY=`) for
 * values the operator has not filled in yet. Node surfaces those as empty
 * strings rather than absent keys, which would otherwise fail `.min(1)` and
 * `.default()` checks and take down every API route, since `getEnv()` validates
 * the entire schema on any request. Blank/whitespace-only values are therefore
 * normalised to `undefined` so optional vars stay optional and defaults apply.
 */
function blankToUndefined(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const normalized: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string" && value.trim() === "") {
      continue;
    }

    normalized[key] = value;
  }

  return normalized as NodeJS.ProcessEnv;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_HEALTH_RECORDS_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OPENAI_OCR_MODEL: z.string().min(1).default("gpt-4o-mini"),
  HEALTH_RECORDS_STORAGE_BUCKET: z.string().min(1).default("health-records"),
  HEALTH_RECORDS_MAX_FILE_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024),
  HEALTH_RECORDS_AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  CRON_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(blankToUndefined(source));

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return result.data;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }

  return cachedEnv;
}

export function resetEnvCacheForTests(): void {
  cachedEnv = null;
}
