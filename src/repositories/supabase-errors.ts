import { AppError } from "@/lib/errors";

type SupabaseFailure = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

export function throwIfSupabaseError(error: SupabaseFailure | null): void {
  if (!error) {
    return;
  }

  if (error.code === "23505") {
    throw new AppError({
      statusCode: 409,
      code: "CONFLICT",
      message: "Record already exists.",
      details: { databaseCode: error.code },
    });
  }

  throw new AppError({
    statusCode: 500,
    code: "DATABASE_ERROR",
    message: "Database operation failed.",
    details: {
      databaseCode: error.code,
      message: error.message,
    },
  });
}
