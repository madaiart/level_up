export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TodoListResponse {
  data: Todo[];
  total: number;
}
