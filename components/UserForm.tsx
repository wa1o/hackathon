'use client';

import { useState, FormEvent } from 'react';

interface UserFormProps {
  initialValue?: string;
  onSubmit: (name: string) => void | Promise<void>;
  onCancel?: () => void;
}

export function UserForm({ initialValue = '', onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(name.trim());
      setName('');
    } catch (err) {
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter user name"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Saving...' : initialValue ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
