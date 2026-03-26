import React, { useState } from "react";
import { useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button, Input, useToast } from "@/components/ui";
import {
  ArrowRight,
  User,
  Mail,
  Lock,
  CheckCircle2,
  Zap,
  BookOpen,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const [location, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useRegisterUser();
  const isPending = registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }
    registerMutation.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          success("Account created successfully!");
          setLocation("/dashboard");
        },
        onError: (err: any) => error(err.message || "Registration failed"),
      },
    );
  };

  const benefits = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      desc: "Curated courses from experts",
    },
    {
      icon: Zap,
      title: "Learn at Your Pace",
      desc: "Progress whenever you want",
    },
    {
      icon: Users,
      title: "Join Community",
      desc: "Connect with fellow learners",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -ml-48 -mb-48" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Benefits & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12"
          >
            <div className="max-w-md">
              <h1 className="text-5xl font-display font-bold text-foreground mb-4">
                Start Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Learning Journey
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-12">
                Join thousands of students advancing their careers through
                quality education.
              </p>

              {/* Benefits Grid */}
              <div className="space-y-6">
                {benefits.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {benefit.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 pt-12 border-t border-border flex gap-8"
              >
                <div>
                  <p className="text-3xl font-bold text-primary">2.5K+</p>
                  <p className="text-sm text-muted-foreground">
                    Active Students
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">50+</p>
                  <p className="text-sm text-muted-foreground">
                    Expert Courses
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex items-center justify-center p-8 lg:p-12"
          >
            <div className="w-full max-w-lg">
              {/* Header */}
              <div className="mb-10">
                {/* <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
                  { <CheckCircle2 className="w-4 h-4 text-primary" /> }
                  { <span className="text-sm font-semibold text-primary">
                    Get Started Today
                  </span> }
                </div> */}
                <h2 className="text-4xl font-display font-bold text-foreground mb-3">
                  Create Your Account
                </h2>
                <p className="text-muted-foreground text-lg">
                  Sign up in minutes and access all courses instantly.
                </p>
              </div>

              {/* Form Container */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg shadow-black/5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                      <User className="w-4 h-4 text-primary" />
                      Full Name
                    </label>
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </motion.div>

                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
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
                      minLength={6}
                      required
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      At least 6 characters
                    </p>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-13 text-base mt-4 gradient-bg shadow-lg shadow-primary/30"
                      isLoading={isPending}
                    >
                      Create Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>

                  {/* Terms */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-xs text-center text-muted-foreground"
                  >
                    By signing up, you agree to our{" "}
                    <button className="text-primary hover:underline font-semibold">
                      Terms of Service
                    </button>
                  </motion.p>
                </form>
              </div>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center"
              >
                <p className="text-muted-foreground mb-3">
                  Already have an account?
                </p>
                <button
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:text-primary/80 font-bold text-lg transition-colors"
                >
                  Sign in here
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
