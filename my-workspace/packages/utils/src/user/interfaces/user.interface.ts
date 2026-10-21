export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
}
