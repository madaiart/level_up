import type { ISql, Sql } from 'postgres';

export const SQL = Symbol('SQL');

/** The postgres.js client: call it as a tagged template, e.g. sql`select 1`. */
export type Database = Sql;

/** What both the pool and a transaction can do: run queries and build fragments. */
export type Queryable = ISql;
