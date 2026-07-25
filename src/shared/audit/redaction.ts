const sensitiveKeyPattern = /token|secret|password|api.?key|authorization|cookie|session/i;

export function redactAuditMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactAuditMetadata(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    redacted[key] = sensitiveKeyPattern.test(key)
      ? "[REDACTED]"
      : redactAuditMetadata(nestedValue);
  }

  return redacted;
}

export function redactAuditMetadataRecord(
  metadata: Record<string, unknown> = {},
): Record<string, unknown> {
  return redactAuditMetadata(metadata) as Record<string, unknown>;
}
