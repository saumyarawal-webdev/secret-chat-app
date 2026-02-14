import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useMyRooms = () => {
  return useQuery({
    queryKey: ['myRooms'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      // We need a backend route like GET /api/chat/my-rooms
      const { data } = await axios.get('/api/chat/my-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data; // Should return an array: [ {code, status, ...} ]
    },
    refetchInterval: 3000, // Poll every 3 seconds until we set up Sockets!
    refetchOnMount: true,
  });
};