import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Debate from './pages/Debate';
import Feynman from './pages/Feynman';
import HotSeat from './pages/HotSeat';
import Mood from './pages/Mood';
import Planner from './pages/Planner';
import Flow from './pages/Flow';
import Graph from './pages/Graph';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/debate" element={<Debate />} />
            <Route path="/feynman" element={<Feynman />} />
            <Route path="/hotseat" element={<HotSeat />} />
            <Route path="/mood" element={<Mood />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/flow" element={<Flow />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
