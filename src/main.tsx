import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './app/App';
import { seedBuiltinDecks } from './infrastructure/seed';
import './styles.css';

registerSW({ immediate: true });
navigator.storage?.persist?.().catch(() => {}); // limite la purge d'IndexedDB (Safari/iOS notamment)
seedBuiltinDecks().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode><HashRouter><App /></HashRouter></StrictMode>,
);
