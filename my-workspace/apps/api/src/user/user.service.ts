import { Injectable } from '@nestjs/common';
import type {
  AddUsersDto,
  User,
  UserListResponse,
} from '@nestjs-template/utils';

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  private nextId = 1;

  findAll(): UserListResponse {
    return { data: this.users, total: this.users.length };
  }

  add(dtos: AddUsersDto): User[] {
    const added = dtos.map((dto) => ({
      id: this.nextId++,
      name: dto.name,
      email: dto.email,
      createdAt: new Date().toISOString(),
    }));
    this.users.push(...added);
    return added;
  }
}
