import { z } from "zod";

import { healthcareDocumentStatuses } from "../types/models";

export const uploadDocumentFormSchema = z.object({
  careSpaceId: z.string().uuid(),
});

export const documentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listDocumentsQuerySchema = z.object({
  careSpaceId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(healthcareDocumentStatuses).optional(),
  documentType: z.string().trim().min(1).max(120).optional(),
  sortBy: z
    .enum(["uploadedAt", "title", "documentType", "status"])
    .default("uploadedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});
