import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage/HomePage';
import PlanMechanicsSimulator from './components/PlanMechanicsSimulator';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plan-mechanics-simulator" element={<PlanMechanicsSimulator />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;