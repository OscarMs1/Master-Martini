import React from 'react';
import {createRoot} from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import './styles/fruitkha-fidelity.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
window.__MM_API_ENABLED__ = import.meta.env.VITE_USE_BACKEND === 'true';
createRoot(document.getElementById('root')).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
