// Type definitions for User API

export interface User {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
}

export interface UserResponse {
  user?: User;
  error?: string;
}

export interface UserListResponse {
  users: User[];
  error?: string;
}
