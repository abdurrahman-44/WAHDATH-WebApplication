import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { PrayerDataProvider } from './context/PrayerDataContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LocationProvider>
        <PrayerDataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PrayerDataProvider>
      </LocationProvider>
    </ThemeProvider>
  </React.StrictMode>
)
