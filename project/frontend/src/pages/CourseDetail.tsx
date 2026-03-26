import React, { useState } from "react";
import { useRoute } from "wouter";
import { useGetCourse, useGetMyEnrollments } from "@workspace/api-client-react";
import { getAuthHeaders, useAuth } from "@/lib/auth";
import { Button, Card, Spinner } from "@/components/ui";
import PaymentModal from "@/components/PaymentModal";
import {
  Clock,
  BarChart,
  Globe,
  IndianRupee,
  ShieldCheck,
  PlayCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDetail() {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id;
  const { user } = useAuth();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: course, isLoading, isError } = useGetCourse(courseId as any);
  const enrollmentsQuery = useGetMyEnrollments({
    request: { headers: getAuthHeaders() },
  });
  const enrollments = enrollmentsQuery.data;

  const isEnrolled =
    enrollments?.some((e) => String(e.courseId) === courseId) ||
    user?.role === "admin";

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-2">Course not found</h2>
        <p className="text-muted-foreground">
          The course you are looking for does not exist.
        </p>
      </div>
    );
  }

  const fallbackImage = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop&q=80`;

  return (
    <div className="w-full bg-background min-h-screen pb-24">
      {/* Hero Header */}
      <div className="bg-card border-b border-border/50 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs mb-6">
                Premium Course
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" /> Self-paced
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-muted-foreground" /> All
                  levels
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-muted-foreground" /> English
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:mt-0 mt-8 relative"
            >
              <Card className="p-1 overflow-hidden sticky top-28 shadow-2xl shadow-black/10 border-2">
                <div className="aspect-video relative rounded-xl overflow-hidden bg-muted mb-6 group cursor-pointer">
                  <img
                    src={course.thumbnailUrl || fallbackImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {!isEnrolled ? (
                    <>
                      <div className="flex items-end gap-2 mb-6">
                        <span className="text-4xl font-display font-bold text-foreground flex items-center">
                          <IndianRupee className="w-8 h-8 mr-1 text-primary" />
                          {course.price}
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="w-full text-lg h-14 shadow-primary/30"
                        onClick={() =>
                          user
                            ? setIsPaymentModalOpen(true)
                            : (window.location.href = "/auth")
                        }
                      >
                        {user ? "Enroll Now" : "Log in to Enroll"}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Secure enrollment
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-4 bg-success/10 border border-success/20 rounded-xl mb-4">
                      <p className="text-success font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> You are enrolled
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Course Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-foreground mb-8">
            Course Content
          </h2>

          {isEnrolled ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed bg-card p-8 rounded-3xl border border-border/50 shadow-sm"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: course.content.replace(/\n/g, "<br/>"),
                }}
              />
            </motion.div>
          ) : (
            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
              <div className="relative">
                {/* Preview snippet */}
                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/70 line-clamp-[8] select-none filter blur-[1px]">
                  {course.content.substring(0, 500)}...
                  {course.content.substring(0, 500)}...
                </div>

                {/* Overlay lock */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/80 to-card flex flex-col items-center justify-end pb-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 shadow-lg border border-border">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Content Locked
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Enroll in this course to access the full learning materials.
                  </p>
                  <Button
                    onClick={() =>
                      user
                        ? setIsPaymentModalOpen(true)
                        : (window.location.href = "/auth")
                    }
                    className="shadow-primary/20"
                  >
                    Enroll to unlock
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        courseId={course.id as any}
        courseTitle={course.title}
        price={course.price}
      />
    </div>
  );
}
