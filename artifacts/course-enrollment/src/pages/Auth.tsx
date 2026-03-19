import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useRegisterUser, useLoginUser } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Card, useToast } from '@/components/ui';
import { BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
  const [location, setLocation] = useLocation();
  const isRegister = new URLSearchParams(window.location.search).get('mode') === 'register';
  const { login: setAuth } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = useRegisterUser();
  const loginMutation = useLoginUser();

  const isPending = registerMutation.isPending || loginMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      registerMutation.mutate({ data: { name, email, password } }, {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          success("Account created successfully!");
          setLocation('/dashboard');
        },
        onError: (err: any) => error(err.message || "Registration failed")
      });
    } else {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          success("Logged in successfully!");
          setLocation('/dashboard');
        },
        onError: (err: any) => error(err.message || "Invalid credentials")
      });
    }
  };

  return (
    <div className="min-h-[90vh] flex relative">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10 bg-background">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          
          <div className="mb-10">
             <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl p-0.5 mb-6 shadow-lg shadow-primary/20">
               <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                 <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-7 h-7" />
               </div>
             </div>
             <h1 className="text-3xl font-display font-bold text-foreground">
               {isRegister ? 'Create an account' : 'Welcome back'}
             </h1>
             <p className="text-muted-foreground mt-2">
               {isRegister ? 'Join thousands of learners elevating their skills.' : 'Enter your details to access your learning dashboard.'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <Input 
                label="Full Name" 
                placeholder="Jane Doe" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            )}
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="jane@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              minLength={6}
              required 
            />

            <Button type="submit" className="w-full h-14 text-lg mt-4 shadow-primary/25" isLoading={isPending}>
              {isRegister ? 'Sign Up' : 'Log In'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => setLocation(isRegister ? '/auth' : '/auth?mode=register')}
              className="ml-2 text-primary hover:underline font-bold"
            >
              {isRegister ? 'Log in here' : 'Create one now'}
            </button>
          </div>

          {!isRegister && (
            <div className="mt-8 p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground text-center border border-border/50">
              Admin Access: <b>admin@gmail.com</b> / <b>admin123</b>
            </div>
          )}
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative bg-muted overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16">
          <Card className="bg-background/10 backdrop-blur-xl border-white/10 text-white p-8">
            <BookOpen className="w-10 h-10 mb-4 text-primary" />
            <h3 className="text-2xl font-display font-bold mb-2">"SkillElevate completely changed my career trajectory."</h3>
            <p className="text-white/70">Sarah J., Frontend Developer</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
