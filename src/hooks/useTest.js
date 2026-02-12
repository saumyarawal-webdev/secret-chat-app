import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

// The Fetcher (Private to this file mostly, or exported if needed elsewhere)
const fetchServerMessage = async () => {
  const response = await axios.get('/api/test')
  return response.data
}

// The Custom Hook
export const useTest = () => {
  return useQuery({
    queryKey: ['serverMessage'],
    queryFn: fetchServerMessage,
    // You can add default options here if you want (e.g., staleTime)
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  })
}