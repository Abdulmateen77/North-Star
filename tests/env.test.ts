import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";

describe("environment management", () => {
  it("parses required backend environment variables and applies safe defaults", () => {
    const env = parseEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      OPENAI_API_KEY: "openai-key",
    });

    expect(env).toMatchObject({
      NODE_ENV: "test",
      LOG_LEVEL: "info",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      OPENAI_API_KEY: "openai-key",
    });
  });

  it("normalizes a Supabase REST endpoint back to the project root", () => {
    const env = parseEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co/rest/v1",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
    });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
  });

  it("rejects incomplete backend environment configuration", () => {
    expect(() =>
      parseEnv({
        NODE_ENV: "test",
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      }),
    ).toThrow(/Invalid environment configuration/);
  });

  it("treats blank optional variables as absent rather than invalid", () => {
    // A .env file with `OPENAI_API_KEY=` (no value) is a blank string, not an
    // absent key. Without coercion that fails `.min(1)` and takes down every
    // API route, since getEnv() validates the whole schema on any request.
    const env = parseEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      OPENAI_API_KEY: "",
      CRON_SECRET: "   ",
    });

    expect(env.OPENAI_API_KEY).toBeUndefined();
    expect(env.CRON_SECRET).toBeUndefined();
  });

  it("still applies defaults when optional tuning variables are blank", () => {
    const env = parseEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      LOG_LEVEL: "",
      OPENAI_HEALTH_RECORDS_MODEL: "",
      HEALTH_RECORDS_MAX_FILE_SIZE_BYTES: "",
    });

    expect(env.LOG_LEVEL).toBe("info");
    expect(env.OPENAI_HEALTH_RECORDS_MODEL).toBe("gpt-4o-mini");
    expect(env.HEALTH_RECORDS_MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it("still rejects a blank value for a genuinely required variable", () => {
    expect(() =>
      parseEnv({
        NODE_ENV: "test",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "",
      }),
    ).toThrow(/Invalid environment configuration/);
  });
});
