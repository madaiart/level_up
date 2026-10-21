import postgres from 'postgres';

/** Postgres SQLSTATE codes we translate into HTTP errors. */
export const PgErrorCode = {
  UniqueViolation: '23505',
  ForeignKeyViolation: '23503',
} as const;

export function getPgErrorCode(error: unknown): string | undefined {
  return error instanceof postgres.PostgresError ? error.code : undefined;
}
