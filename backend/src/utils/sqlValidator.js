const FORBIDDEN_KEYWORDS = [
  "DROP",
  "DELETE",
  "INSERT",
  "UPDATE",
  "ALTER",
  "CREATE",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "EXEC",
  "EXECUTE",
  "CALL",
  "VACUUM",
  "REINDEX",
  "CLUSTER",
  "SUPERUSER",
  "ROLE",
  "LOCK",
  "UNLISTEN",
  "NOTIFY",
  "LISTEN",
  "LOAD",
  "PG_READ_FILE",
  "PG_LS_DIR",
  "PG_STAT_FILE",
  "LO_IMPORT",
  "LO_EXPORT",
];

const FORBIDDEN_PATTERNS = [/--/g, /\/\*/g, /\*\//g];

function validateQuery(query) {
  if (!query || typeof query !== "string") {
    return { valid: false, reason: "Query must be a non-empty string." };
  }

  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: "Query is empty." };
  }

  if (trimmed.length > 5000) {
    return { valid: false, reason: "Query is too long (max 5000 chars)." };
  }

  const upper = trimmed.toUpperCase();

  if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
    return { valid: false, reason: "Only SELECT queries allowed." };
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: "SQL comments are not allowed." };
    }
  }

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(trimmed)) {
      return { valid: false, reason: `Forbidden keyword: ${keyword}` };
    }
  }

  const statements = trimmed.split(";").filter((s) => s.trim().length > 0);
  if (statements.length > 1) {
    return { valid: false, reason: "Multiple statements are not allowed." };
  }

  return { valid: true };
}

function sanitizeQuery(query) {
  return query.trim().replace(/;+$/, "");
}

module.exports = { validateQuery, sanitizeQuery };
