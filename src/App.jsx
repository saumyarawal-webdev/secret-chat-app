import { useState } from 'react'
import { useTest } from './hooks/useTest' // Import your custom hook
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  
  // Use the custom hook - clean and simple!
  const { data, isLoading, isError } = useTest()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-blue-400">React + Vite + Express</h1>
      
      <div className="p-6 border border-gray-700 rounded-xl bg-gray-800 shadow-lg text-center">
        <h2 className="text-xl mb-2 text-gray-300">Server Status:</h2>
        
        {isLoading && <p className="text-yellow-400">Loading data...</p>}
        {isError && <p className="text-red-500">Error connecting to server!</p>}
        {data && <p className="text-green-400 text-2xl font-mono">{data.message}</p>}
      </div>

      <div className="card">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App