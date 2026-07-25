import { jsonResponse, withApiHandler } from "@/lib/http";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(request, () =>
    jsonResponse({
      status: "ok",
      service: "north-star-api",
    }),
  );
}
