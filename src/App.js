import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage/HomePage';
import PlanMechanicsSimulator from './components/prototypes/PlanMechanicsSimulator';
import AdminPanel from './components/prototypes/AdminPanel';
import GuidedJourney from './components/prototypes/GuidedJourney';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plan-mechanics-simulator" element={<PlanMechanicsSimulator />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/guided-journey" element={<GuidedJourney />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;