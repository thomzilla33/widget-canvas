import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'
import { WidgetsProvider } from './state/WidgetsContext.jsx'
import { DashboardsProvider } from './state/DashboardsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <DashboardsProvider>
          <WidgetsProvider>
            <App />
          </WidgetsProvider>
        </DashboardsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
