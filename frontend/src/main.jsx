import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

const system = createSystem(defaultConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </AuthProvider>
  </StrictMode>,
)
