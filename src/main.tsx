import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' 
import 'leaflet/dist/leaflet.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/Sri-Lanka-Dengue-Stat"> 
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)