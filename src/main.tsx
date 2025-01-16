/*
 * @Description: 
 * @Author: didadida262
 * @Date: 2024-07-25 01:16:22
 * @LastEditors: didadida262
 * @LastEditTime: 2024-08-14 15:02:38
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

import {I18nextProvider} from '@/i18n'
import {ThemeProvider} from '@/components/Theme/themeProvider.tsx'

import App from './App.tsx';

import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
         <ThemeProvider>
      <I18nextProvider>
        <App />
      </I18nextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
