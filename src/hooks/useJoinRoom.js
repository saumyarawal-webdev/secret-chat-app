import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useJoinRoom = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/chat/join', { roomId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['chats']);
      // Navigate to the joined room
      navigate(`/chat/${data._id}`);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Invalid Room ID");
    }
  });
};