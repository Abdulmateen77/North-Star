import { describe, expect, it } from "vitest";

import {
  loadLiveCareBootstrap,
  loadLiveCareSpace,
  createLiveCareSpace,
  type ApiTransport,
} from "@/data/live";

const userId = "11111111-1111-4111-8111-111111111111";
const careSpaceId = "22222222-2222-4222-8222-222222222222";

function makeApi(): ApiTransport & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async get<T>(path: string): Promise<T> {
      calls.push(path);

      if (path === "/api/users/me") {
        return {
          user: {
            id: userId,
            email: "sarah@example.test",
            fullName: "Sarah Whitfield",
            avatarUrl: null,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        } as T;
      }

      if (path === "/api/care-spaces") {
        return {
          careSpaces: [
            {
              id: careSpaceId,
              name: "Margaret's Care",
              description: "Live test space",
              ownerId: userId,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        } as T;
      }

      if (path === `/api/care-management/tasks?careSpaceId=${careSpaceId}`) {
        return {
          tasks: [
            {
              id: "33333333-3333-4333-8333-333333333333",
              careSpaceId,
              title: "Book follow-up",
              description: "Call orthopaedics",
              status: "pending",
              priority: "high",
              assignedTo: userId,
              createdBy: userId,
              dueAt: "2026-01-11T09:00:00.000Z",
              completedAt: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        } as T;
      }

      if (path === `/api/care-management/reminders?careSpaceId=${careSpaceId}`) {
        return {
          reminders: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              careSpaceId,
              title: "Evening medication",
              description: null,
              status: "scheduled",
              priority: "medium",
              scheduledFor: "2026-01-10T20:00:00.000Z",
              assignedTo: userId,
              createdBy: userId,
              triggeredAt: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        } as T;
      }

      throw new Error(`unexpected path: ${path}`);
    },
  };
}

describe("live care bootstrap", () => {
  it("loads the active care space and adapts backend tasks/reminders for the UI", async () => {
    const api = makeApi();

    const seed = await loadLiveCareBootstrap(api, new Date("2026-01-10T12:00:00.000Z"));

    expect(api.calls).toEqual([
      "/api/users/me",
      "/api/care-spaces",
      `/api/care-management/tasks?careSpaceId=${careSpaceId}`,
      `/api/care-management/reminders?careSpaceId=${careSpaceId}`,
    ]);
    expect(seed).not.toBeNull();
    expect(seed).toMatchObject({
      careSpaceId,
      careSpaceName: "Margaret's Care",
      currentUser: {
        id: userId,
        fullName: "Sarah Whitfield",
        initials: "SW",
        relationship: "You",
      },
      tasks: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          title: "Book follow-up",
          detail: "Call orthopaedics",
          status: "todo",
          priority: "high",
          dueLabel: "Tomorrow",
        },
      ],
      reminders: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          title: "Evening medication",
          repeatLabel: "Once",
          enabled: true,
          lastConfirmed: null,
        },
      ],
    });
    expect(seed?.reminders[0]?.timeLabel).toMatch(/8:00pm|20:00/);
  });

  it("loads the shared care-space identity for the care receiver assistant", async () => {
    const api = makeApi();

    await expect(loadLiveCareSpace(api)).resolves.toEqual({
      id: careSpaceId,
      name: "Margaret's Care",
    });
    expect(api.calls).toEqual(["/api/care-spaces"]);
  });

  it("creates a care space through the authenticated API transport", async () => {
    const calls: Array<{ path: string; body: unknown }> = [];
    const api: ApiTransport = {
      async get<T>(): Promise<T> {
        throw new Error("GET should not be called");
      },
      async post<T>(path: string, body?: unknown): Promise<T> {
        calls.push({ path, body });
        return {
          careSpace: {
            id: careSpaceId,
            name: "Margaret's Care",
            description: "Live test space",
            ownerId: userId,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        } as T;
      },
    };

    await expect(createLiveCareSpace("Margaret's Care", "Live test space", api)).resolves.toMatchObject({
      id: careSpaceId,
      name: "Margaret's Care",
    });
    expect(calls).toEqual([
      {
        path: "/api/care-spaces",
        body: { name: "Margaret's Care", description: "Live test space" },
      },
    ]);
  });

  it("returns null when the signed-in user has no care space yet", async () => {
    const api: ApiTransport = {
      async get<T>(path: string): Promise<T> {
        if (path === "/api/users/me") {
          return {
            user: {
              id: userId,
              email: "sarah@example.test",
              fullName: "Sarah Whitfield",
              avatarUrl: null,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          } as T;
        }
        if (path === "/api/care-spaces") {
          return { careSpaces: [] } as T;
        }
        throw new Error(`unexpected path: ${path}`);
      },
    };

    await expect(loadLiveCareBootstrap(api)).resolves.toBeNull();
  });
});
