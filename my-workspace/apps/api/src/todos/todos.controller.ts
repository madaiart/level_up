import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StandardSchemaValidationPipe } from '../common/pipes/standard-schema-validation.pipe';
import {
  type CreateTodoDto,
  createTodoSchema,
  type ListTodosQueryDto,
  listTodosQuerySchema,
  type Todo,
  type TodoListResponse,
  type UpdateTodoDto,
  updateTodoSchema,
} from '@nestjs-template/utils';
import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(
    @Query(new StandardSchemaValidationPipe(listTodosQuerySchema))
    query: ListTodosQueryDto,
  ): Promise<TodoListResponse> {
    return this.todosService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Todo> {
    return this.todosService.findOne(id);
  }

  @Post()
  create(
    @Body(new StandardSchemaValidationPipe(createTodoSchema))
    dto: CreateTodoDto,
  ): Promise<Todo> {
    return this.todosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body(new StandardSchemaValidationPipe(updateTodoSchema))
    dto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<void> {
    return this.todosService.remove(id);
  }
}
