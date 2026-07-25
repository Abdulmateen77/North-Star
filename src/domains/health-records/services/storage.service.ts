import type { SupabaseAdminClient } from "@/lib/supabase/server";

import { storageFailure } from "../types/errors";
import type {
  HealthcareDocumentStorage,
  UploadHealthcareDocumentInput,
  UploadHealthcareDocumentResult,
} from "../types/storage";

export class SupabaseHealthcareDocumentStorage implements HealthcareDocumentStorage {
  constructor(
    private readonly supabase: SupabaseAdminClient,
    private readonly bucket: string,
  ) {}

  async upload(input: UploadHealthcareDocumentInput): Promise<UploadHealthcareDocumentResult> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(input.path, input.body, {
        contentType: input.contentType,
        upsert: false,
      });

    if (error) {
      throw storageFailure("Healthcare document upload failed.", {
        message: error.message,
      });
    }

    return { path: data.path };
  }

  async download(path: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage.from(this.bucket).download(path);

    if (error || !data) {
      throw storageFailure("Healthcare document download failed.", {
        message: error?.message,
        path,
      });
    }

    return Buffer.from(await data.arrayBuffer());
  }

  async createSignedUrl(path: string, expiresInSeconds = 600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw storageFailure("Failed to create signed healthcare document URL.", {
        message: error?.message,
        path,
      });
    }

    return data.signedUrl;
  }
}
