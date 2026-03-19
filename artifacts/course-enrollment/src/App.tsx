import React, { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui";
import { AuthProvider, useAuth } from "@/lib/auth";

// Components & Pages
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// A simple wrapper to force unauthenticated users to login for protected routes
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
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
        <Route path="/" component={Home} />
        <Route path="/courses" component={Courses} />
        <Route path="/courses/:id" component={CourseDetail} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
