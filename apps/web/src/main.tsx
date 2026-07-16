import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { installRippleEffect } from '@/lib/rippleEffect';

installRippleEffect();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app continues without offline support
    });
  });
}

// Prevent number inputs from changing value when scrolling outside of them
document.addEventListener('wheel', (e) => {
  if (
    document.activeElement?.tagName === 'INPUT' && 
    (document.activeElement as HTMLInputElement).type === 'number' && 
    e.target !== document.activeElement
  ) {
    (document.activeElement as HTMLElement).blur();
  }
}, { passive: true });
