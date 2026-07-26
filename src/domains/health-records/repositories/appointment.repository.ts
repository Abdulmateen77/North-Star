import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { ExtractedAppointmentInput } from "../types/analysis";
import type { Appointment } from "../types/models";
import type { AppointmentRepository } from "../types/repositories";

export type AppointmentRow = {
  id: string;
  care_space_id: string;
  document_id: string;
  date: string | null;
  time: string | null;
  location: string | null;
  department: string | null;
  clinician: string | null;
  status: string | null;
  created_at: string;
};

export function mapAppointmentRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    documentId: row.document_id,
    date: row.date,
    time: row.time,
    location: row.location,
    department: row.department,
    clinician: row.clinician,
    status: row.status,
    createdAt: row.created_at,
  };
}

export class SupabaseAppointmentRepository implements AppointmentRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async createMany(
    careSpaceId: string,
    documentId: string,
    appointments: ExtractedAppointmentInput[],
  ): Promise<Appointment[]> {
    const { error: deleteError } = await this.supabase
      .from("appointments")
      .delete()
      .eq("document_id", documentId);

    throwIfSupabaseError(deleteError);

    if (appointments.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("appointments")
      .insert(
        appointments.map((appointment) => ({
          care_space_id: careSpaceId,
          document_id: documentId,
          date: appointment.date,
          time: appointment.time,
          location: appointment.location,
          department: appointment.department,
          clinician: appointment.clinician,
          status: appointment.status,
        })),
      )
      .select("*");

    throwIfSupabaseError(error);

    return ((data ?? []) as AppointmentRow[]).map(mapAppointmentRow);
  }

  async findByDocumentId(documentId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select("*")
      .eq("document_id", documentId)
      .order("date", { ascending: true, nullsFirst: false });

    throwIfSupabaseError(error);

    return ((data ?? []) as AppointmentRow[]).map(mapAppointmentRow);
  }

  async findByCareSpaceId(careSpaceId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select("*")
      .eq("care_space_id", careSpaceId)
      .order("date", { ascending: true, nullsFirst: false });

    throwIfSupabaseError(error);

    return ((data ?? []) as AppointmentRow[]).map(mapAppointmentRow);
  }
}
