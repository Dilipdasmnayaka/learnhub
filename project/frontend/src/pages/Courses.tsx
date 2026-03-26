import React, { useState } from "react";
import {
  useGetCourses,
  useGetMyEnrollments,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { getAuthHeaders } from "@/lib/auth";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function Courses() {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useGetCourses();
  const enrollmentsQuery = useGetMyEnrollments({
    request: { headers: getAuthHeaders() as any },
  });
  const enrollments = enrollmentsQuery.data;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = Array.isArray(courses)
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const isEnrolledInCourse = (courseId: string) => {
    return (
      enrollments?.some((e) => String(e.courseId) === courseId) ||
      user?.role === "admin"
    );
  };

  return (
    <div className="w-full bg-background min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="mb-12 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
              Explore All Courses
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Discover the perfect course to level up your skills. From
              programming to design, we have something for everyone.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search courses by title or keyword..."
                className="pl-12 h-14 text-base rounded-2xl shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="h-14 px-6 bg-card border border-border rounded-2xl flex items-center justify-center gap-2 font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
              Filters
            </button>
          </motion.div>
        </div>

        {/* Grid */}
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[420px] bg-card/50 border border-border/50 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CourseCard
                  course={course}
                  isEnrolled={isEnrolledInCourse(String(course.id))}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground text-lg">
              Try adjusting your search terms to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
