import { logger } from "@/lib/logger";
import type { SupabaseAdminClient } from "@/lib/supabase/server";

export interface RealtimeGateway {
  broadcast(channel: string, payload: Record<string, unknown>): Promise<void>;
}

export class LoggingRealtimeGateway implements RealtimeGateway {
  async broadcast(channel: string, payload: Record<string, unknown>): Promise<void> {
    logger.info("realtime.broadcast", {
      channel,
      type: typeof payload.type === "string" ? payload.type : "unknown",
    });
  }
}

export class SupabaseRealtimeGateway implements RealtimeGateway {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async broadcast(channel: string, payload: Record<string, unknown>): Promise<void> {
    await this.supabase.channel(channel).send({
      type: "broadcast",
      event: typeof payload.type === "string" ? payload.type : "message",
      payload,
    });
  }
}
