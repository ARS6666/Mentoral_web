import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './index.css';

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
import Home from './components/Home';
import LandingPage from './components/LandingPage';

import AppNavbar from './components/Navbar';
import AppSidebar from './components/SideBar';
import AppFooter from './components/Footer';

function AppLayout({ children }) {
  return (
    <div className="Vazir" style={{ display: 'flex', direction: 'rtl' }}>
      <AppSidebar />
      <div style={{ flexGrow: 1 }}>
        <AppNavbar />
        <div className="main-content p-3">{children}</div>
        <AppFooter />
      </div>
    </div>
  );
}

function MainAppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/today" element={<Today />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/planningassistant" element={<PlanningAssistant />} />
        <Route path="/login" element={<Login />} />
        <Route path="/focustimer" element={<FocusTimer />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<MainAppRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;
