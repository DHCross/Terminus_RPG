import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import GWSDApp from './modules/gwsd-cards/App';
import { CharacterCard } from './modules/terminus/character/CharacterCard';
import { OrdersView } from './modules/terminus/orders/OrdersView';
import { SpeciesView } from './modules/terminus/species/SpeciesView';
import { PlaytestTools } from './modules/terminus/playtest/PlaytestTools';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div className="p-8"><h1>Dashboard</h1><p>Welcome to Terminus RPG Suite Alpha 0.1.</p></div>} />
          <Route path="scene-cards" element={<GWSDApp />} />
          <Route path="characters" element={<div className="p-8"><CharacterCard /></div>} />
          <Route path="species" element={<SpeciesView />} />
          <Route path="orders" element={<OrdersView />} />
          <Route path="playtest" element={<PlaytestTools />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
