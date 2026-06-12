import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'
import { WidgetsProvider } from './state/WidgetsContext.jsx'
import { DashboardsProvider } from './state/DashboardsContext.jsx'
import { FeedbackProvider } from './state/FeedbackContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <DashboardsProvider>
          <WidgetsProvider>
            <FeedbackProvider>
              <App />
            </FeedbackProvider>
          </WidgetsProvider>
        </DashboardsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
