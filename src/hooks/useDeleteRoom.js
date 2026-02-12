import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`/api/chat/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      // Refresh the list so the buttons reappear instantly
      queryClient.invalidateQueries(['myRooms']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to terminate channel");
    }
  });
};