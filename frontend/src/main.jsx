import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store, persistor } from './store/store.js'
import { PersistGate } from "redux-persist/integration/react";
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginButton from './components/login.jsx';
import LetterEditor from './components/RTE.jsx';
import App from './App.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <LoginButton />
      },
      {
        path: '/editor',
        element: <LetterEditor />
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
);

