'use client';

import { User } from '@/app/api/users/types';

interface UserCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{user.id}</span>
      </div>
      
      {user.createdAt && (
        <p className="text-xs text-gray-500 mb-4">
          Created: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      )}
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          View
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
