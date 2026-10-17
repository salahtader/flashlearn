import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard';
import Library from '../features/library/Library';
import Review from '../features/review/Review';
import Settings from '../features/settings/Settings';

export default function App() {
  return (
    <div className="app">
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/review/:deckId?" element={<Review />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      <nav className="tabs">
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/library">Bibliothèque</NavLink>
        <NavLink to="/settings">Réglages</NavLink>
      </nav>
    </div>
  );
}
