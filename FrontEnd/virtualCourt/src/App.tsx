import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "./component/ui/toaster";
import { Toaster as Sonner } from "./component/ui/sonner";
import { TooltipProvider } from "./component/ui/tooltip";

/* -------------------- Pages -------------------- */

// Landing & Auth
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";
import ProtectedRoute from "./component/auth/ProtectedRoute";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourtManagement from "./pages/admin/CourtManagement";
import PoliceManagement from "./pages/admin/PoliceManagement";

// Police
import PoliceDashboard from "./pages/police/PoliceDashboard";
import CaseManagement from "./pages/police/CaseManagement";
import EvidenceUpload from "./pages/police/EvidenceUpload";
import Communication from "./pages/police/Communication";

// Court
import CourtDashboard from "./pages/court/CourtDashboard";
import CaseReview from "./pages/court/CaseReview";
import AIAnalysis from "./pages/court/AIAnalysis";
import EvidenceHistory from "./pages/court/EvidenceHistory";

// User
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import FileCase from "./pages/user/FileCase";
import MyCases from "./pages/user/MyCases";
import NewsFeed from "./pages/user/NewsFeed";
import NewsManagement from "./pages/police/NewsManagement";

import NotFound from "./pages/NotFound";

/* -------------------- Query Client -------------------- */

const queryClient = new QueryClient();

/* -------------------- App -------------------- */

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courts" element={<CourtManagement />} />
              <Route path="/admin/police" element={<PoliceManagement />} />
            </Route>

            {/* Police */}
            <Route element={<ProtectedRoute allowedRoles={['police']} />}>
              <Route path="/police" element={<PoliceDashboard />} />
              <Route path="/police/cases" element={<CaseManagement />} />
              <Route path="/police/evidence" element={<EvidenceUpload />} />
              <Route path="/police/communication" element={<Communication />} />
              <Route path="/police/news-management" element={<NewsManagement />} />
            </Route>

            {/* Court */}
            <Route element={<ProtectedRoute allowedRoles={['CourtOfficial']} />}>
              <Route path="/CourtOfficial" element={<CourtDashboard />} />
              <Route path="/CourtOfficial/cases" element={<CaseReview />} />
              <Route path="/CourtOfficial/ai-analysis" element={<AIAnalysis />} />
              <Route path="/CourtOfficial/history" element={<EvidenceHistory />} />
            </Route>

            {/* User */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/user/file-case" element={<FileCase />} />
              <Route path="/user/cases" element={<MyCases />} />
              <Route path="/user/news-feed" element={<NewsFeed />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
