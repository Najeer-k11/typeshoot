import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// No StrictMode — prevents Phaser double-mount in development
createRoot(document.getElementById('root')).render(<App />);
