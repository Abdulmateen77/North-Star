import { badRequest } from "@/lib/errors";
import { jsonResponse, noContentResponse, withApiHandler } from "@/lib/http";
import {
  resolveRouteParams,
  validateParams,
} from "@/lib/validation";
import { getDefaultActor } from "@/services/auth.service";

import { toDocumentDetailsDto } from "../dto/document.dto";
import {
  documentIdParamSchema,
  listDocumentsQuerySchema,
  uploadDocumentFormSchema,
} from "../schemas/api.schema";
import type { HealthRecordService } from "../services/health-record.service";

export type HealthRecordDocumentRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function getDocumentId(context: HealthRecordDocumentRouteContext): Promise<string> {
  const params = await resolveRouteParams(context.params);
  return validateParams(params, documentIdParamSchema).id;
}

function parseQuery(request: Request) {
  return listDocumentsQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
}

export class HealthRecordController {
  constructor(private readonly healthRecords: HealthRecordService) {}

  async uploadDocument(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const formData = await request.formData().catch(() => {
        throw badRequest("Request body must be multipart form data.");
      });
      const file = formData.get("file");
      const careSpaceId = formData.get("careSpaceId");

      if (!(file instanceof File)) {
        throw badRequest("A healthcare document file is required.");
      }

      const parsed = uploadDocumentFormSchema.parse({ careSpaceId });
      const result = await this.healthRecords.uploadDocument({
        careSpaceId: parsed.careSpaceId,
        uploadedBy: actor.id,
        file,
      });

      return jsonResponse(result, 201);
    });
  }

  async listDocuments(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const query = parseQuery(request);
      const result = await this.healthRecords.listDocuments(actor.id, {
        careSpaceId: query.careSpaceId,
        status: query.status,
        documentType: query.documentType,
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      });

      return jsonResponse(result);
    });
  }

  async getDocument(
    request: Request,
    context: HealthRecordDocumentRouteContext,
  ): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const documentId = await getDocumentId(context);
      const details = await this.healthRecords.getDocument(documentId, actor.id);

      return jsonResponse(toDocumentDetailsDto(details));
    });
  }

  async deleteDocument(
    request: Request,
    context: HealthRecordDocumentRouteContext,
  ): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const documentId = await getDocumentId(context);
      await this.healthRecords.deleteDocument(documentId, actor.id);

      return noContentResponse();
    });
  }

  async analyzeDocument(
    request: Request,
    context: HealthRecordDocumentRouteContext,
  ): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const documentId = await getDocumentId(context);
      const result = await this.healthRecords.analyzeDocument({
        documentId,
        requestedBy: actor.id,
      });

      return jsonResponse(result);
    });
  }
}
