import {
  createHealthRecordController,
  type HealthRecordDocumentRouteContext,
} from "@/domains/health-records";

export async function POST(
  request: Request,
  context: HealthRecordDocumentRouteContext,
): Promise<Response> {
  return createHealthRecordController().analyzeDocument(request, context);
}
