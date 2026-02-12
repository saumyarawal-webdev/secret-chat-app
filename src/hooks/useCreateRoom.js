import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/chat/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data; // Returns { _id: '...', message: '...' }
    },
    onSuccess: () => {
      // Refresh chat list in background
      queryClient.invalidateQueries(['chats']);
    },
    onError: (error) => {
      console.error('Failed to create room:', error.response?.data?.message);
    }
  });
};