import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard';
import Exercise from '../features/exercises/Exercise';
import Exercises from '../features/exercises/Exercises';
import Library from '../features/library/Library';
import Lesson from '../features/path/Lesson';
import Path from '../features/path/Path';
import Review from '../features/review/Review';
import Settings from '../features/settings/Settings';

export default function App() {
  return (
    <div className="app">
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exercises/:deckId" element={<Exercises />} />
          <Route path="/exercise/:deckId/:exId" element={<Exercise />} />
          <Route path="/path" element={<Path />} />
          <Route path="/lesson/:deckId" element={<Lesson />} />
          <Route path="/library" element={<Library />} />
          <Route path="/review/:deckId?" element={<Review />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      <nav className="tabs">
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/path">Parcours</NavLink>
        <NavLink to="/library">Cartes</NavLink>
        <NavLink to="/settings">Réglages</NavLink>
      </nav>
    </div>
  );
}
