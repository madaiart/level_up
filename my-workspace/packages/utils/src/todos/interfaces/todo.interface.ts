export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

export interface TodoListResponse {
  data: Todo[];
  total: number;
}
