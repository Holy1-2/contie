import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './assets/ErrorBoundary.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// Create a client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className:
            ' toast',
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
