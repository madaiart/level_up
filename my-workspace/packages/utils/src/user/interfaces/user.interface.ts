export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
}
