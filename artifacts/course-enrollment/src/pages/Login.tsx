import React, { useState } from "react";
import { useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button, Input, useToast } from "@/components/ui";
import { ArrowRight, Lock, Mail, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginUser();
  const isPending = loginMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          success("Logged in successfully!");
          setLocation("/dashboard");
        },
        onError: (err: any) => error(err.message || "Invalid credentials"),
      },
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Accent Bar */}
      <div className="hidden lg:block w-1 bg-gradient-to-b from-primary via-accent to-primary" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl p-0.5 mb-8 shadow-xl shadow-primary/30"
            >
              <div className="w-full h-full bg-card rounded-[15px] flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-3">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-lg">
              Continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              type="submit"
              className="w-full"
            >
              <Button
                type="button"
                className="w-full h-13 text-base mt-2 shadow-lg shadow-primary/30"
                isLoading={isPending}
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              No account yet?
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Signup Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setLocation("/signup")}
              className="w-full h-12 border-2 border-primary/30 hover:border-primary/60 text-primary font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              Create New Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl border border-accent/20"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Admin Credentials
            </p>
            <div className="space-y-2 text-sm font-mono">
              <p className="text-foreground">
                📧 <span className="text-primary">admin@gmail.com</span>
              </p>
              <p className="text-foreground">
                🔐 <span className="text-primary">admin123</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Background */}
      <div className="hidden lg:block lg:w-1/3 relative bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <Lock className="w-32 h-32 text-primary/20 mb-8" />
          <h2 className="text-2xl font-display font-bold text-foreground/60">
            Secure Access
          </h2>
          <p className="text-sm text-muted-foreground mt-4">
            Your learning progress is safely stored and accessible anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
