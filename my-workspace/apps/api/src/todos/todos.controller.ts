import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { StandardSchemaValidationPipe } from '../common/pipes/standard-schema-validation.pipe';
import { type CreateTodoDto, createTodoSchema } from './dto/create-todo.dto';
import { type UpdateTodoDto, updateTodoSchema } from './dto/update-todo.dto';
import type { Todo, TodoListResponse } from './interfaces/todo.interface';
import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(): TodoListResponse {
    return this.todosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Todo {
    return this.todosService.findOne(id);
  }

  @Post()
  create(
    @Body(new StandardSchemaValidationPipe(createTodoSchema))
    dto: CreateTodoDto,
  ): Todo {
    return this.todosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new StandardSchemaValidationPipe(updateTodoSchema))
    dto: UpdateTodoDto,
  ): Todo {
    return this.todosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.todosService.remove(id);
  }
}
