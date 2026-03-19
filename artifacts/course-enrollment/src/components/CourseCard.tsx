import React from 'react';
import { Link } from 'wouter';
import { Card, Button } from './ui';
import { BookOpen, IndianRupee, ArrowRight } from 'lucide-react';
import type { Course } from '@workspace/api-client-react';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

export default function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  // Use a stunning fallback image if none provided
  const fallbackImage = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&q=80`;

  return (
    <Card className="group flex flex-col h-full hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img 
          src={course.thumbnailUrl || fallbackImage} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold text-foreground shadow-lg flex items-center">
          <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-primary" />
          {course.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
          <BookOpen className="w-4 h-4" />
          <span>Self-Paced Learning</span>
        </div>
        
        <h3 className="font-display text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
          {course.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
          {course.description}
        </p>

        <Link href={`/courses/${course.id}`} className="block w-full">
          <Button variant={isEnrolled ? "secondary" : "default"} className="w-full">
            {isEnrolled ? "Continue Learning" : "View Details"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
