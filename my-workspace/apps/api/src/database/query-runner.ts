import { AsyncLocalStorage } from 'node:async_hooks';
import { Inject, Injectable } from '@nestjs/common';
import type { TransactionSql } from 'postgres';
import { type Database, type Queryable, SQL } from './database.constants';

/**
 * Runs queries against the pool, or against the current transaction when
 * called inside `transaction()`. The active transaction is tracked with
 * AsyncLocalStorage, so services don't have to pass a `tx` around: any
 * service that queries through `queryRunner.sql` joins it automatically.
 */
@Injectable()
export class QueryRunner {
  private readonly storage = new AsyncLocalStorage<TransactionSql>();

  constructor(@Inject(SQL) private readonly pool: Database) {}

  /** The current transaction if there is one, otherwise the pool. */
  get sql(): Queryable {
    return this.storage.getStore() ?? this.pool;
  }

  get isInTransaction(): boolean {
    return this.storage.getStore() !== undefined;
  }

  /**
   * Runs `fn` in a transaction: COMMIT if it resolves, ROLLBACK if it throws
   * (the error is rethrown). A nested call joins the outer transaction.
   *
   * @param options Extra BEGIN options, e.g. 'isolation level serializable'.
   *   Ignored for nested calls.
   */
  async transaction<T>(fn: () => Promise<T>, options?: string): Promise<T> {
    if (this.isInTransaction) return fn();

    const run = (tx: TransactionSql) => this.storage.run(tx, fn);
    const result = options
      ? this.pool.begin(options, run)
      : this.pool.begin(run);
    return result as Promise<T>;
  }
}
