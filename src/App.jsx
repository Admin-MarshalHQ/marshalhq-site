import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { C, FONT } from "./lib/theme";
import GatePage from "./pages/GatePage";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MarshalDashboard from "./pages/marshal/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import PostJob from "./pages/manager/PostJob";
import JobApplicants from "./pages/manager/JobApplicants";
import JobDetail from "./pages/JobDetail";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout({ children }) {
  return (
    <div
      style={{
        background: C.bg,
        color: C.t1,
        fontFamily: FONT,
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:#6366f1;color:#fff}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .cta-btn{transition:all .2s !important}
        .cta-btn:hover{transform:translateY(-2px) !important;box-shadow:0 8px 30px rgba(99,102,241,.35) !important}
        .card-hover{transition:all .25s !important}
        .card-hover:hover{border-color:#6366f144 !important;transform:translateY(-4px) !important}
        input:focus{border-color:#6366f1 !important;outline:none}
      `}</style>
      {children}
    </div>
  );
}

function LandingWithNav() {
  return (
    <>
      <Navbar />
      <Landing />
    </>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem("mhq_unlocked") === "true"
  );

  if (!unlocked) {
    return (
      <GatePage
        onUnlock={() => {
          localStorage.setItem("mhq_unlocked", "true");
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingWithNav />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/marshal/dashboard"
            element={
              <ProtectedRoute role="marshal">
                <MarshalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute role="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/post"
            element={
              <ProtectedRoute role="manager">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/job/:id"
            element={
              <ProtectedRoute role="manager">
                <JobApplicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job/:id"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
}
