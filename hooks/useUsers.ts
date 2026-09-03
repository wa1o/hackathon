'use client';

import { useState, useEffect } from 'react';
import { User } from '@/app/api/users/types';
import * as userAPI from '@/lib/api/users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (data: { name: string }) => {
    try {
      const newUser = await userAPI.createUser(data);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const updateUser = async (id: number, data: { name?: string }) => {
    try {
      const updated = await userAPI.updateUser(id, data);
      setUsers((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await userAPI.deleteUser(id);
      setUsers((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
