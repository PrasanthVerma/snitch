import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App/App.css'
import { store } from './App/app.store.js'
import { Provider } from 'react-redux'
import router from './App/app.routes.jsx'
import { RouterProvider } from 'react-router'
import App from './App/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)

