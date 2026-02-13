import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useJoinRoom = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code) => {
      const token = localStorage.getItem('token');
      // Ensure we send the code to the backend
      const { data } = await axios.post('/api/chat/join', { code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the list so the Dashboard knows a room is now "active"
      queryClient.invalidateQueries(['myRooms']);
      
      // Navigate using the ID returned by the server
      if (data && data._id) {
        navigate(`/chat/${data._id}`);
      }
    }
  });
};