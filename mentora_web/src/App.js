import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./design-system.css";
import { HelmetProvider } from "react-helmet-async";
import Onboarding from "./components/OnBoarding";
import Tutor from "./components/Tutor";
import Today from "./components/Today";
import Signin from "./components/SignIn";
import Reports from "./components/Reports";
import Profile from "./components/Profile";
import Practice from "./components/Practice";
import PlanningAssistant from "./components/PlanningAssistant";
import Login from "./components/Login";
import FocusTimer from "./components/FocusTimer";
import Home from "./components/Home";
import LandingPage from "./components/LandingPage";
import AppNavbar from "./components/Navbar";
import AppSidebar from "./components/SideBar";
import AppFooter from "./components/Footer";
import SubscriptionPlans from "./components/SubscriptionPlans";
import Subscription from "./components/Subscription";
import NotFound from "./components/NotFound";
import BlogPost from "./components/blogpost";
import BlogList from "./components/Bloglist";
import StudyLoading from "./components/StudyLoading";
import SubscriptionSuccessPopup from "./components/SubscriptionSuccessPopup";
import { useApp } from "./context/AppContext";
import FinalExams from "./components/FinalExams";
import AboutUs from "./components/AboutUs";
import Support from "./components/Support";
import AdminConsole from "./components/AdminConsole";
import SupportWidget from "./components/SupportWidget";
import FeatureIntroModal from "./components/FeatureIntroModal";
import AffiliatePortal from "./components/AffiliatePortal";
import RankPredictionAssistant from './components/RankPredictionAssistant'
const ProtectedRoute = ({ isAuthenticated, isLoading }) => {
  const location = useLocation();

  if (isLoading) {
    return <StudyLoading />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

const PublicRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) return <StudyLoading />;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/home" replace />;
};

export const isMarketingHost = hostname => hostname === "marketing.mentoralearn.ir";

export function PublicHome({ hostname = window.location.hostname }) {
  return isMarketingHost(hostname) ? <AffiliatePortal /> : <LandingPage />;
}

function StudentExtras() {
  const { pathname } = useLocation();
  return isMarketingHost(window.location.hostname) || pathname === "/partners" ? null : <><FeatureIntroModal /><SupportWidget /></>;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.update().catch(() => {});
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}

function AppLayout() {
  // سایدبار روی دسکتاپ پیش‌فرض باز، روی موبایل بسته
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 992 : true,
  );
  const { profile } = useApp();
  const hasActiveSubscription = Boolean(profile?.subscriptionActive);

  useEffect(() => {
    let lastIsDesktop = window.innerWidth >= 992;
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 992;
      // فقط وقتی از مرز دسکتاپ/موبایل رد می‌شویم وضعیت را عوض کن
      if (isDesktop !== lastIsDesktop) {
        setSidebarOpen(isDesktop);
        lastIsDesktop = isDesktop;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        direction: "rtl",
        minHeight: "100vh",
        background: "#F5F6F3",
        fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
      }}
    >
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        style={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "#F5F6F3",
        }}
      >
        <AppNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div
          className="main-content"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "clamp(16px, 2.5vw, 32px)",
          }}
        >
          <Outlet />
        </div>

        {hasActiveSubscription && <SubscriptionSuccessPopup isPurchased />}
        <AppFooter />
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, loading } = useApp();

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/partners" element={<AffiliatePortal />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/subscriptionplans" element={<SubscriptionPlans />} />
          <Route path="/pricing" element={<SubscriptionPlans />} />

          <Route
            element={
              <PublicRoute
                isAuthenticated={isAuthenticated}
                isLoading={loading}
              />
            }
          >
            <Route path="/signin" element={<Signin />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={loading}
              />
            }
          >
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/today" element={<Today />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/practice" element={<Practice />} />
              <Route
                path="/planningassistant"
                element={<PlanningAssistant />}
              />
              <Route path="/focustimer" element={<FocusTimer />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin-console" element={<AdminConsole />} />
              <Route path="/loading" element={<StudyLoading />} />
              <Route path="/exams" element={<FinalExams />} />
              <Route path="/predictionassistant" element={<RankPredictionAssistant />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <StudentExtras />
      </Router>
    </HelmetProvider>
  );
}

export default App;
