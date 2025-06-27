
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Files from "./pages/Files";
import Links from "./pages/Links";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";
import Demo from "./pages/Demo";
import DailyLogs from "./pages/DailyLogs";
import Spending from "./pages/Spending";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/demo" element={<Demo />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Tasks />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Calendar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Files />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/links"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Links />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-logs"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <DailyLogs />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spending"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Spending />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Analytics />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <div className="pb-24 md:pb-0">
                      <Search />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
