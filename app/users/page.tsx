'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import { UserForm } from '@/components/UserForm';
import { UserCard } from '@/components/UserCard';

export default function UsersPage() {
  const router = useRouter();
  const { users, loading, error, createUser, deleteUser } = useUsers();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (name: string) => {
    try {
      await createUser({ name });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await deleteUser(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : `Add New User`}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">No users found.</p>
          <p className="text-sm text-gray-500">Click "Add New User" to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={() => router.push(`/users/${user.id}`)}
              onDelete={() => handleDelete(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
