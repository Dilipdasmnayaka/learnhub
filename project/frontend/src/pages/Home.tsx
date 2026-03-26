import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui";
import CourseCard from "@/components/CourseCard";
import {
  useGetCourses,
  useGetMyEnrollments,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { getAuthHeaders } from "@/lib/auth";
import {
  ArrowRight,
  Star,
  Users,
  Zap,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useGetCourses();
  const enrollmentsQuery = useGetMyEnrollments({
    request: { headers: getAuthHeaders() as any },
  });
  const enrollments = enrollmentsQuery.data;

  // Show only up to 3 featured courses
  const featuredCourses = Array.isArray(courses) ? courses.slice(0, 3) : [];

  const isEnrolledInCourse = (courseId: string) => {
    return (
      enrollments?.some((e) => String(e.courseId) === courseId) ||
      user?.role === "admin"
    );
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Absolute Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract Background"
            className="w-full h-full object-cover opacity-90 mix-blend-multiply dark:mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-32">
          <div className="max-w-3xl">
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 mb-6 backdrop-blur-md"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>The future of online learning is here</span>
            </motion.div> */}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight leading-[1.1] mb-6"
            >
              Master New Skills. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Elevate Your Career.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              Start your learning journey with expertly designed courses that
              help you gain real-world skills and confidence to succeed in your
              career.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/courses">
                <Button size="lg" className="w-full sm:w-auto group">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-background/50 backdrop-blur-md"
                >
                  Start for free
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-12 flex items-center gap-8 text-sm font-medium text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" /> Lifetime
                Access
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" /> Best Courses
                Available
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Features Banner */}
      <section className="bg-card border-y border-border py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold text-foreground mb-1">
                4.9/5
              </h3>
              <p className="text-muted-foreground font-medium">
                Average Course Rating
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold text-foreground mb-1">
                50k+
              </h3>
              <p className="text-muted-foreground font-medium">
                Active Students
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-display font-bold text-foreground mb-1">
                100+
              </h3>
              <p className="text-muted-foreground font-medium">
                Premium Courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Featured Courses
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                Accelerate your learning journey today.
              </p>
            </div>
            <Link href="/courses">
              <Button variant="ghost" className="hidden md:flex">
                View all courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[400px] bg-muted/50 animate-pulse rounded-2xl border border-border/50"
                />
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={isEnrolledInCourse(String(course.id))}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                No courses available yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for amazing new content.
              </p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/courses">
              <Button variant="outline" className="w-full">
                View all courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinelinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
