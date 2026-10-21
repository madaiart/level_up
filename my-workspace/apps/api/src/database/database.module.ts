import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import type { Env } from '../config/env.validation';
import { type Database, SQL } from './database.constants';
import { QueryRunner } from './query-runner';

@Global()
@Module({
  providers: [
    {
      provide: SQL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Database =>
        postgres(config.get('DATABASE_URL', { infer: true }), {
          max: config.get('DATABASE_POOL_MAX', { infer: true }),
          // Seconds. Fail fast (e.g. in the health check) when the DB is down.
          connect_timeout: 5,
          // Columns come back camelCased (created_at -> createdAt), and keys
          // passed to sql(object) helpers are snake_cased on the way in.
          transform: postgres.camel,
        }),
    },
    QueryRunner,
  ],
  exports: [SQL, QueryRunner],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(SQL) private readonly sql: Database) {}

  async onApplicationShutdown(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}
