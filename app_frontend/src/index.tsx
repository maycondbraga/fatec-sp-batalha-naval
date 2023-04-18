import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}>
    <div id='background'>
      <img id='logo-entrar' src="/assets/Design_sem_nome__1_-removebg-preview.png" />
      <img id='logo-entrar' src="/assets/5-removebg-preview.png" />
    </div>
    <main>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </main>
  </GoogleOAuthProvider>
);