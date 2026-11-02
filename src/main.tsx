import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './styles/app.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PrivateView } from './screens/PrivateView';

// The private view is a separate root, so it never touches the player's data on this device.
const Root = window.location.pathname === '/view' ? PrivateView : App;
// iOS Safari only applies :active styles once the page has a touch listener.
document.addEventListener('touchstart', () => {}, { passive: true });

createRoot(document.getElementById('root')!).render(<Root />);
