import { createHealthRecordController } from "@/domains/health-records/services/factory";

export async function POST(request: Request): Promise<Response> {
  return createHealthRecordController().uploadDocument(request);
}

export async function GET(request: Request): Promise<Response> {
  return createHealthRecordController().listDocuments(request);
}
