import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui";
import { AuthProvider, useAuth } from "@/lib/auth";

// Components & Pages
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PaymentPage from "@/pages/PaymentPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // ❌ stop multiple error calls
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // ❌ stop duplicate errors
      onError: () => {
        // 🚫 disable global error toast
      },
    },
  },
});

// A simple wrapper to force unauthenticated users to login for protected routes
function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return null;
  if (!user) return null;

  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Standalone payment page (no auth wrapper) */}
        <Route path="/payment/:transactionId" component={PaymentPage} />

        <Route path="/" component={Home} />
        <Route path="/courses" component={Courses} />
        <Route path="/courses/:id" component={CourseDetail} />
        <Route path="/auth" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>

        {/* Catch-all */}
        <Route path="/:rest*" component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider />
        <WouterRouter base="/">
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
