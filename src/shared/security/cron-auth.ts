import { AppError, unauthorized } from "@/lib/errors";

export function getCronSecretFromRequest(request: Request): string | null {
  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret) {
    return headerSecret;
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
}

export function requireCronSecret(request: Request, expectedSecret: string | undefined): void {
  if (!expectedSecret) {
    throw new AppError({
      statusCode: 500,
      code: "CRON_SECRET_NOT_CONFIGURED",
      message: "Cron secret is not configured.",
    });
  }

  if (getCronSecretFromRequest(request) !== expectedSecret) {
    throw unauthorized("Invalid cron secret.");
  }
}
