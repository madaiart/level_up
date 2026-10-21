import { ConflictException, Injectable } from '@nestjs/common';
import type {
  AddUsersDto,
  User,
  UserListResponse,
} from '@nestjs-template/utils';
import { QueryRunner } from '../database/query-runner';
import { getPgErrorCode, PgErrorCode } from '../database/pg-errors';
import { type UserRows, userRowsSchema } from './user.row';

@Injectable()
export class UserService {
  constructor(private readonly queryRunner: QueryRunner) {}

  /** Joins the caller's transaction, if any. */
  private get sql() {
    return this.queryRunner.sql;
  }

  async findAll(): Promise<UserListResponse> {
    const rows = await this.sql<UserRows>`
      select * from users order by id
    `;
    return { data: userRowsSchema.parse(rows), total: rows.length };
  }

  async add(dtos: AddUsersDto): Promise<User[]> {
    try {
      // sql(array, ...columns) expands to a multi-row VALUES list with bound parameters.
      const rows = await this.sql<UserRows>`
        insert into users ${this.sql(dtos, 'name', 'email')}
        returning *
      `;
      return userRowsSchema.parse(rows);
    } catch (error) {
      if (getPgErrorCode(error) === PgErrorCode.UniqueViolation) {
        throw new ConflictException('A user with that email already exists');
      }
      throw error;
    }
  }
}
