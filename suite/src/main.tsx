import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { SettingProvider, useSettingPack } from './settings/SettingContext';
import './index.css';

function PackRoutes() {
  const { pack } = useSettingPack();
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        {pack.routes.map((route) =>
          route.index ? (
            <Route key="index" index element={<route.element />} />
          ) : (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ),
        )}
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <SettingProvider>
            <PackRoutes />
          </SettingProvider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
