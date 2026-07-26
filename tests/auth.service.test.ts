import { describe, expect, it, vi } from "vitest";

import { getActorFromRequest } from "@/services/auth.service";

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "caregiver@example.com",
  full_name: "Caregiver Example",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

function createSupabaseFake(options: {
  authUser?: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null;
  authError?: { message: string } | null;
  profileRow?: typeof profile | null;
}) {
  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: options.profileRow ?? null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.authUser ?? null },
        error: options.authError ?? null,
      }),
    },
    from: vi.fn(() => profileQuery),
  } as any;
}

describe("request authentication", () => {
  it("resolves the actor from a valid Supabase bearer token", async () => {
    const supabase = createSupabaseFake({ authUser: { id: profile.id, email: profile.email }, profileRow: profile });

    const actor = await getActorFromRequest(
      new Request("http://localhost/api/users/me", {
        headers: { Authorization: "Bearer valid-token" },
      }),
      { supabase, allowDemoActor: false },
    );

    expect(actor).toEqual({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
    });
    expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
    expect(supabase.from).toHaveBeenCalledWith("profiles");
  });

  it("rejects missing credentials when demo actor mode is disabled", async () => {
    const supabase = createSupabaseFake({ profileRow: profile });

    await expect(
      getActorFromRequest(new Request("http://localhost/api/users/me"), {
        supabase,
        allowDemoActor: false,
      }),
    ).rejects.toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });

    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("defaults to authentication-required behavior in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      const supabase = createSupabaseFake({ profileRow: profile });

      await expect(
        getActorFromRequest(new Request("http://localhost/api/users/me"), { supabase }),
      ).rejects.toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("rejects malformed or invalid bearer credentials", async () => {
    const malformedSupabase = createSupabaseFake({ profileRow: profile });
    await expect(
      getActorFromRequest(
        new Request("http://localhost/api/users/me", { headers: { Authorization: "Basic abc" } }),
        { supabase: malformedSupabase, allowDemoActor: false },
      ),
    ).rejects.toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    expect(malformedSupabase.auth.getUser).not.toHaveBeenCalled();

    const invalidSupabase = createSupabaseFake({ authError: { message: "Token is invalid" } });
    await expect(
      getActorFromRequest(
        new Request("http://localhost/api/users/me", { headers: { Authorization: "Bearer expired-token" } }),
        { supabase: invalidSupabase, allowDemoActor: false },
      ),
    ).rejects.toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
  });

  it("uses the seeded actor only when demo mode is explicitly enabled", async () => {
    const supabase = createSupabaseFake({ profileRow: profile });

    const actor = await getActorFromRequest(new Request("http://localhost/api/users/me"), {
      supabase,
      allowDemoActor: true,
    });

    expect(actor.id).toBe(profile.id);
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("profiles");
  });
});
