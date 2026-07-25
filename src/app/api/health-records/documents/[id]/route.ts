import {
  createHealthRecordController,
  type HealthRecordDocumentRouteContext,
} from "@/domains/health-records";

export async function GET(
  request: Request,
  context: HealthRecordDocumentRouteContext,
): Promise<Response> {
  return createHealthRecordController().getDocument(request, context);
}

export async function DELETE(
  request: Request,
  context: HealthRecordDocumentRouteContext,
): Promise<Response> {
  return createHealthRecordController().deleteDocument(request, context);
}
