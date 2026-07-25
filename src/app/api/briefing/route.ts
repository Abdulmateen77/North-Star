import { createAICareEngineController } from "@/domains/ai-care-engine";

export async function POST(request: Request): Promise<Response> {
  return createAICareEngineController().briefingForToday(request);
}
