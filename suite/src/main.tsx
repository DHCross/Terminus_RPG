import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import App from './App';
import { CharacterWorkbench } from './modules/terminus/character/CharacterWorkbench';
import { OrdersView } from './modules/terminus/orders/OrdersView';
import { SpeciesView } from './modules/terminus/species/SpeciesView';
import { PlaytestTools } from './modules/terminus/playtest/PlaytestTools';
import { SceneCardsWorkbench } from './modules/terminus/scene/SceneCardsWorkbench';
import { MagicView } from './modules/terminus/magic/MagicView';
import { RulesPage } from './modules/terminus/rules/RulesPage';
import { NPCWorkbench } from './modules/terminus/npc/NPCWorkbench';
import { MonsterWorkbench } from './modules/terminus/monster/MonsterWorkbench';
import { NomenclatorWorkbench } from './modules/terminus/names/NomenclatorWorkbench';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<App />} />
              <Route path="scene-cards" element={<SceneCardsWorkbench />} />
              <Route path="characters" element={<CharacterWorkbench />} />
              <Route path="npcs" element={<NPCWorkbench />} />
              <Route path="bestiary" element={<MonsterWorkbench />} />
              <Route path="nomenclator" element={<NomenclatorWorkbench />} />
              <Route path="magic" element={<MagicView />} />
              <Route path="species" element={<SpeciesView />} />
              <Route path="orders" element={<OrdersView />} />
              <Route path="playtest" element={<PlaytestTools />} />
              <Route path="rules" element={<RulesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
