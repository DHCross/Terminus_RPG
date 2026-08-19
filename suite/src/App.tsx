import { useSettingPack } from './settings/SettingContext';
import './App.css';

/**
 * The app index route renders the active Setting Pack's dashboard.
 * Each pack (Terminus, Generic Fantasy, ...) supplies its own dashboard
 * component; this wrapper just delegates to the active one.
 */
function App() {
  const { pack } = useSettingPack();
  const Dashboard = pack.dashboard;
  return <Dashboard />;
}

export default App;
