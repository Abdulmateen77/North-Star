import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { DocumentAnalysisResult } from "../types/analysis";
import type {
  CreateHealthcareDocumentInput,
  DocumentAnalysisRecord,
  DocumentListFilters,
  DocumentListResult,
  HealthcareDocument,
  HealthcareDocumentStatus,
} from "../types/models";
import type { DocumentAnalysisRepository, DocumentRepository } from "../types/repositories";

export type DocumentRow = {
  id: string;
  care_space_id: string;
  uploaded_by: string;
  document_type: string | null;
  title: string;
  storage_url: string;
  mime_type: string;
  status: HealthcareDocumentStatus;
  uploaded_at: string;
  deleted_at?: string | null;
};

export type DocumentAnalysisRow = {
  id: string;
  care_space_id: string;
  document_id: string;
  extracted_text: string;
  structured_json: unknown;
  summary: string | null;
  confidence: number;
  created_at: string;
};

const documentSortColumns: Record<DocumentListFilters["sortBy"], string> = {
  uploadedAt: "uploaded_at",
  title: "title",
  documentType: "document_type",
  status: "status",
};

export function mapDocumentRow(row: DocumentRow): HealthcareDocument {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    uploadedBy: row.uploaded_by,
    documentType: row.document_type,
    title: row.title,
    storageUrl: row.storage_url,
    mimeType: row.mime_type,
    status: row.status,
    uploadedAt: row.uploaded_at,
    deletedAt: row.deleted_at ?? null,
  };
}

export function mapDocumentAnalysisRow(row: DocumentAnalysisRow): DocumentAnalysisRecord {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    documentId: row.document_id,
    rawText: row.extracted_text,
    structuredJson: row.structured_json as DocumentAnalysisResult,
    summary: row.summary,
    confidence: row.confidence,
    createdAt: row.created_at,
  };
}

export class SupabaseDocumentRepository implements DocumentRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("care_members")
      .select("id")
      .eq("care_space_id", careSpaceId)
      .eq("user_id", userId)
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw notFound("Care space not found.");
    }
  }

  async create(input: CreateHealthcareDocumentInput): Promise<HealthcareDocument> {
    const { data, error } = await this.supabase
      .from("documents")
      .insert({
        id: input.id,
        care_space_id: input.careSpaceId,
        uploaded_by: input.uploadedBy,
        document_type: input.documentType,
        title: input.title,
        storage_url: input.storageUrl,
        mime_type: input.mimeType,
        status: input.status,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error);

    return mapDocumentRow(data as DocumentRow);
  }

  async list(filters: DocumentListFilters): Promise<DocumentListResult> {
    let query: any = this.supabase
      .from("documents")
      .select("*", { count: "exact" })
      .eq("care_space_id", filters.careSpaceId)
      .is("deleted_at", null);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.documentType) {
      query = query.eq("document_type", filters.documentType);
    }

    query = query.order(documentSortColumns[filters.sortBy], {
      ascending: filters.sortDirection === "asc",
    });

    const { data, error, count } = await query.range(
      filters.offset,
      filters.offset + filters.limit - 1,
    );

    throwIfSupabaseError(error);

    return {
      documents: ((data ?? []) as DocumentRow[]).map(mapDocumentRow),
      total: count ?? 0,
      limit: filters.limit,
      offset: filters.offset,
    };
  }

  async findById(
    id: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<HealthcareDocument | null> {
    let query: any = this.supabase.from("documents").select("*").eq("id", id);

    if (!options.includeDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query.maybeSingle();

    throwIfSupabaseError(error);

    return data ? mapDocumentRow(data as DocumentRow) : null;
  }

  async updateStatus(id: string, status: HealthcareDocumentStatus): Promise<void> {
    const { error } = await this.supabase
      .from("documents")
      .update({ status })
      .eq("id", id);

    throwIfSupabaseError(error);
  }

  async attachAnalysis(
    id: string,
    input: { documentType: string | null; status: HealthcareDocumentStatus },
  ): Promise<HealthcareDocument> {
    const { data, error } = await this.supabase
      .from("documents")
      .update({
        document_type: input.documentType,
        status: input.status,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw notFound("Healthcare document not found.");
    }

    return mapDocumentRow(data as DocumentRow);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("documents")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null);

    throwIfSupabaseError(error);
  }
}

export class SupabaseDocumentAnalysisRepository implements DocumentAnalysisRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async create(input: {
    careSpaceId: string;
    documentId: string;
    rawText: string;
    structuredJson: DocumentAnalysisResult;
    summary: string | null;
    confidence: number;
  }): Promise<DocumentAnalysisRecord> {
    const { data, error } = await this.supabase
      .from("document_analysis")
      .insert({
        care_space_id: input.careSpaceId,
        document_id: input.documentId,
        extracted_text: input.rawText,
        structured_json: input.structuredJson,
        summary: input.summary,
        confidence: input.confidence,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error);

    return mapDocumentAnalysisRow(data as DocumentAnalysisRow);
  }

  async findLatestByDocument(documentId: string): Promise<DocumentAnalysisRecord | null> {
    const { data, error } = await this.supabase
      .from("document_analysis")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? mapDocumentAnalysisRow(data as DocumentAnalysisRow) : null;
  }
}
