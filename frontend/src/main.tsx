import React from 'react';  
import { createRoot } from 'react-dom/client'; // Ensure correct import path  
import { Provider } from 'react-redux';  
import App from './App'; // Assuming App.tsx is your main component  
import { store } from './redux/store'; // Assuming you have a Redux store setup  
import './index.css'; // Global styles  
import 'primereact/resources/themes/saga-blue/theme.css'; // PrimeReact theme  
import 'primereact/resources/primereact.min.css'; // PrimeReact core styles  
import 'primeicons/primeicons.css'; // PrimeIcons for icons  
  
// Ensure that the root element with id 'root' exists in your index.html  
const container = document.getElementById('root')!;  
const root = createRoot(container); // Create a root using React 18 API  
  
root.render(  
  <React.StrictMode>  
    <Provider store={store}>  
      <App />  
    </Provider>  
  </React.StrictMode>  
);  