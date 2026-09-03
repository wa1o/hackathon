// Shared data store for user items
// In a real application, replace this with your database integration
// (e.g., Prisma, Drizzle, MongoDB, PostgreSQL, etc.)

export interface User {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

let users: User[] = [];
let nextId = 1;

export function getAllUsers(): User[] {
  return users;
}

export function getUserById(id: number): User | undefined {
  return users.find((item) => item.id === id);
}

export function createUser(data: Omit<User, 'id'>): User {
  const newUser: User = {
    id: nextId++,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(newUser);
  return newUser;
}

export function updateUser(id: number, data: Partial<Omit<User, 'id'>>): User | null {
  const index = users.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  users[index] = {
    ...users[index],
    ...data,
    updatedAt: new Date(),
  };
  return users[index];
}

export function deleteUser(id: number): User | null {
  const index = users.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const [deleted] = users.splice(index, 1);
  return deleted;
}
