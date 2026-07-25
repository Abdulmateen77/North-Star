export interface TimelineEvent {
  id: string;
  careSpaceId: string;
  eventType: string;
  title: string;
  description: string | null;
  sourceDomain: string;
  sourceId: string | null;
  createdBy: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface CreateTimelineEventInput {
  careSpaceId: string;
  eventType: string;
  title: string;
  description?: string | null;
  sourceDomain: string;
  sourceId?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineListFilters {
  careSpaceId: string;
  eventType?: string;
  sourceDomain?: string;
  limit: number;
  offset: number;
}

export interface TimelineListResult {
  events: TimelineEvent[];
  total: number;
  limit: number;
  offset: number;
}
