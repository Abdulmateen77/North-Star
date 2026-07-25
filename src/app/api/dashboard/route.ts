import { createDashboardController } from "@/domains/dashboard";

export async function GET(request: Request): Promise<Response> { return createDashboardController().get(request); }
