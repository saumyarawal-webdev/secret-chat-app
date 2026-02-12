import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// The Fetch Function
const fetchUserProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) return null; // No token? No user.

  const { data } = await axios.get('/api/users/profile', {
    headers: {
      Authorization: `Bearer ${token}`, // Manually attach since we aren't using the client instance
    },
  });
  return data;
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUserProfile,
    // Only run this query if there is a token in storage
    enabled: !!localStorage.getItem('token'),
    // If auth fails (401), don't keep banging on the door
    retry: false, 
    // Cache the user data for 5 minutes
    staleTime: 1000 * 60 * 5, 
  });
};