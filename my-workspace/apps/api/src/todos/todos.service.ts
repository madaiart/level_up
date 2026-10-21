import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateTodoDto,
  ListTodosQueryDto,
  Todo,
  TodoListResponse,
  UpdateTodoDto,
} from '@nestjs-template/utils';
import { QueryRunner } from '../database/query-runner';
import { getPgErrorCode, PgErrorCode } from '../database/pg-errors';
import { type TodoRows, todoRowSchema, todoRowsSchema } from './todo.row';

@Injectable()
export class TodosService {
  constructor(private readonly queryRunner: QueryRunner) {}

  /** Joins the caller's transaction, if any. */
  private get sql() {
    return this.queryRunner.sql;
  }

  async findAll(query: ListTodosQueryDto): Promise<TodoListResponse> {
    // Fragments compose: the WHERE clause is only added when filtering.
    const rows = await this.sql<TodoRows>`
      select * from todos
      ${query.userId ? this.sql`where user_id = ${query.userId}` : this.sql``}
      order by id
    `;
    return { data: todoRowsSchema.parse(rows), total: rows.length };
  }

  async findOne(id: string): Promise<Todo> {
    const [row] = await this.sql<TodoRows>`
      select * from todos where id = ${id}
    `;
    if (!row) throw new NotFoundException(`Todo #${id} not found`);
    return todoRowSchema.parse(row);
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    try {
      const [row] = await this.sql<TodoRows>`
        insert into todos (title, user_id)
        values (${dto.title}, ${dto.userId})
        returning *
      `;
      return todoRowSchema.parse(row);
    } catch (error) {
      if (getPgErrorCode(error) === PgErrorCode.ForeignKeyViolation) {
        throw new NotFoundException(`User #${dto.userId} not found`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    // Only the fields that were sent; the owner (user_id) can never change.
    const columns = (['title', 'completed'] as const).filter(
      (key) => dto[key] !== undefined,
    );
    if (columns.length === 0) return this.findOne(id);

    const [row] = await this.sql<TodoRows>`
      update todos set ${this.sql(dto, columns)}
      where id = ${id}
      returning *
    `;
    if (!row) throw new NotFoundException(`Todo #${id} not found`);
    return todoRowSchema.parse(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.sql`delete from todos where id = ${id}`;
    if (result.count === 0) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
  }
}
