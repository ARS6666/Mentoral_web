import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Onboarding from './components/OnBoarding';
import Tutor from './components/Tutor';
import Today from './components/Today';
import Signin from './components/SignIn';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Practice from './components/Practice';
import PlanningAssistant from './components/PlanningAssistant';
import Login from './components/Login';
import FocusTimer from './components/FocusTimer';

const AppContent = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/today" element={<Today />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/plannignassisatant" element={<PlanningAssistant />} />
        <Route path="/login" element={<Login />} />
        <Route path="/focustimer" element={<FocusTimer />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
