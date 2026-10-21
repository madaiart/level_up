import { Inject, Injectable } from '@nestjs/common';
import type { DbHealthResponse, HealthResponse } from '@nestjs-template/utils';
import { type Database, SQL } from '../database/database.constants';

const DB_CHECK_TIMEOUT_MS = 3_000;

/** Connection errors (e.g. ECONNREFUSED) can have an empty message but carry a code. */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const code = (error as { code?: unknown }).code;
  return error.message || (typeof code === 'string' ? code : 'Unknown error');
}

@Injectable()
export class HealthService {
  constructor(@Inject(SQL) private readonly sql: Database) {}

  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async checkDb(): Promise<DbHealthResponse> {
    const start = performance.now();
    try {
      // A pooled connection to a dead server can hang until TCP gives up,
      // so cap how long the probe may take.
      await Promise.race([
        this.sql`select 1`,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timed out after ${DB_CHECK_TIMEOUT_MS}ms`)),
            DB_CHECK_TIMEOUT_MS,
          ).unref(),
        ),
      ]);
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'up',
        latencyMs: Math.round(performance.now() - start),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'down',
        latencyMs: Math.round(performance.now() - start),
        error: describeError(error),
      };
    }
  }
}
