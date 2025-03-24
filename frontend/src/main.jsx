import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import client from './graphql-client';
import { ApolloProvider } from '@apollo/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
    <App />
    </ApolloProvider>
  </StrictMode>
)
