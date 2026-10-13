import { Body, Controller, Get, Patch } from '@nestjs/common';
import { StandardSchemaValidationPipe } from '../common/pipes/standard-schema-validation.pipe';
import {
  type AddUsersDto,
  addUsersSchema,
  type User,
  type UserListResponse,
} from '@nestjs-template/utils';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): UserListResponse {
    return this.userService.findAll();
  }

  @Patch()
  add(
    @Body(new StandardSchemaValidationPipe(addUsersSchema))
    dto: AddUsersDto,
  ): User[] {
    return this.userService.add(dto);
  }
}
