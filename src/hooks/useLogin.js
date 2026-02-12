import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      // CORRECTED PATH: /api/auth/login
      const { data } = await axios.post('/api/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Save Token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      // Redirect to Dashboard
      navigate('/');
    },
    onError: (error) => {
      console.error('Login Failed:', error.response?.data?.message);
    }
  });
};