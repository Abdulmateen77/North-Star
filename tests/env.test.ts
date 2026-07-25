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

  it("rejects incomplete backend environment configuration", () => {
    expect(() =>
      parseEnv({
        NODE_ENV: "test",
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      }),
    ).toThrow(/Invalid environment configuration/);
  });
});
