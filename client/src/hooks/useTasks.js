import { useState, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useAsyncData } from './useAsyncData';

export function useTasks() {
  const { data: tasks, loading, refetch, setData } = useAsyncData(
    () => taskService.getToday(),
    []
  );
  const [error, setError] = useState('');

  const handleCreate = useCallback(async (data) => {
    try {
      const task = await taskService.create(data);
      setData(prev => [task, ...(prev || [])]);
      setError('');
      return task;
    } catch (e) {
      setError(e.message || 'Failed to create task');
    }
  }, [setData]);

  const handleToggle = useCallback(async (id) => {
    try {
      const updated = await taskService.toggle(id);
      setData(prev => (prev || []).map(t => t._id === id ? updated : t));
      setError('');
    } catch (e) {
      setError('Failed to update task');
    }
  }, [setData]);

  const handleDelete = useCallback(async (id) => {
    try {
      await taskService.delete(id);
      setData(prev => (prev || []).filter(t => t._id !== id));
      setError('');
    } catch (e) {
      setError('Failed to delete task');
    }
  }, [setData]);

  return {
    tasks: tasks || [],
    loading,
    error,
    refetch,
    handleCreate,
    handleToggle,
    handleDelete,
  };
}
