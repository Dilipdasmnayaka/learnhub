import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { LogOut, User as UserIcon, BookOpen, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';
import Chatbot from './Chatbot';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: <Sparkles className="w-4 h-4 mr-2" /> },
    { href: '/courses', label: 'Explore Courses', icon: <BookOpen className="w-4 h-4 mr-2" /> },
  ];

  if (user) {
    navLinks.push({ 
      href: '/dashboard', 
      label: user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 mr-2" />
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans relative selection:bg-primary/20">
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                  <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
              </div>
              <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                SkillElevate
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 border-l border-border pl-6">
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <UserIcon className="w-4 h-4 text-primary" />
                      {user?.name ? user.name.split(' ')[0] : 'Guest'}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => setLocation('/auth')}>Log in</Button>
                    <Button onClick={() => setLocation('/signup')} className="rounded-full shadow-primary/20">
                      Sign up free
                    </Button>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="flex items-center p-3 rounded-xl hover:bg-muted font-medium text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { setLocation('/auth'); setMobileMenuOpen(false); }}>Log in</Button>
                    <Button className="w-full" onClick={() => { setLocation('/signup'); setMobileMenuOpen(false); }}>Sign up free</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-5 h-5 opacity-80" />
             </div>
             <span className="font-display font-semibold text-muted-foreground">SkillElevate © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
