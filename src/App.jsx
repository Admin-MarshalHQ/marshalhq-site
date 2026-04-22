import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { C, FONT } from "./lib/theme";
import GatePage from "./pages/GatePage";
import Welcome from "./pages/Welcome";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MarshalDashboard from "./pages/marshal/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import PostJob from "./pages/manager/PostJob";
import JobApplicants from "./pages/manager/JobApplicants";
import JobDetail from "./pages/JobDetail";
import MarshalProfile from "./pages/marshal/Profile";
import ManagerProfile from "./pages/manager/Profile";
import ReviewPage from "./pages/ReviewPage";
import NotFound from "./pages/NotFound";
import LandingNavbar from "./components/LandingNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import VersionBeacon from "./components/VersionBeacon";

function AppLayout({ children }) {
  return (
    <div
      style={{
        background: C.bg,
        color: C.t1,
        fontFamily: FONT,
        overflowX: "hidden",
        minHeight: "100dvh",
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;overscroll-behavior:none}
        html,body{min-height:100vh;min-height:100dvh}
        @supports not (min-height:100dvh){html,body{min-height:100vh}}
        ::selection{background:${C.accent};color:#08070b}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .cta-btn{transition:all .25s cubic-bezier(.4,0,.2,1) !important}
        .cta-btn:hover{transform:translateY(-2px) !important;box-shadow:0 12px 40px rgba(201,168,76,.25) !important}
        .card-hover{transition:all .3s cubic-bezier(.4,0,.2,1) !important}
        .card-hover:hover{border-color:${C.b2} !important;transform:translateY(-3px) !important;box-shadow:0 8px 32px rgba(0,0,0,.4) !important}
        input:focus,textarea:focus{border-color:${C.accent} !important;outline:none;box-shadow:0 0 0 3px ${C.accentGlow} !important}
        input::placeholder,textarea::placeholder{color:${C.t4}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:${C.s1}}
        ::-webkit-scrollbar-thumb{background:${C.b1};border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:${C.b2}}
      `}</style>
      {children}
      <VersionBeacon />
    </div>
  );
}

// Public landing page — no login links, just the waitlist
function PublicLanding() {
  return (
    <AppLayout>
      <LandingNavbar />
      <Landing />
    </AppLayout>
  );
}

// Dev password gate wrapping all app routes
function DevGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem("mhq_dev") === "true"
  );

  if (!unlocked) {
    return (
      <GatePage
        onUnlock={() => {
          localStorage.setItem("mhq_dev", "true");
          setUnlocked(true);
        }}
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — anyone can see these */}
      <Route path="/" element={<AppLayout><Welcome /></AppLayout>} />
      <Route path="/join" element={<PublicLanding />} />

      {/* All app routes — behind dev password + auth */}
      <Route
        path="/*"
        element={
          <DevGate>
            <AuthProvider>
              <AppLayout>
                <Routes>
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
                    path="/marshal/profile"
                    element={
                      <ProtectedRoute role="marshal">
                        <MarshalProfile />
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
                    path="/manager/profile"
                    element={
                      <ProtectedRoute role="manager">
                        <ManagerProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manager/edit/:id"
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
                  <Route
                    path="/review/:jobId/:userId"
                    element={
                      <ProtectedRoute>
                        <ReviewPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </AuthProvider>
          </DevGate>
        }
      />
    </Routes>
  );
}
