import React, { useState, useEffect } from 'react';
import { useAuth, getAuthHeaders } from '@/lib/auth';
import { useLocation } from 'wouter';
import { useGetMyEnrollments, useGetCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useUpdateProfile } from '@workspace/api-client-react';
import { Tabs, Button, Input, Textarea, Card, Modal, useToast, Spinner } from '@/components/ui';
import CourseCard from '@/components/CourseCard';
import { format } from 'date-fns';
import { IndianRupee, Pencil, Trash2, Plus, LogOut, CheckCircle2, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Welcome, {user.name}</h1>
              <p className="text-muted-foreground font-medium capitalize flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-accent' : 'bg-primary'}`} />
                {user.role} Account
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { logout(); setLocation('/'); }}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user.role === 'admin' ? <AdminView /> : <StudentView />}
      </div>
    </div>
  );
}

// --- STUDENT VIEW ---
function StudentView() {
  const [activeTab, setActiveTab] = useState('courses');
  const { data: enrollments, isLoading } = useGetMyEnrollments({ request: { headers: getAuthHeaders() } });

  if (isLoading) return <div className="py-20 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <Tabs 
        activeTab={activeTab} 
        onChange={setActiveTab}
        tabs={[
          { id: 'courses', label: 'My Learning' },
          { id: 'history', label: 'Payment History' },
          { id: 'profile', label: 'Profile Settings' }
        ]} 
      />

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments?.length ? (
            enrollments.map(e => <CourseCard key={e.id} course={e.course} isEnrolled />)
          ) : (
            <div className="col-span-full py-20 text-center bg-card rounded-2xl border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">Start learning by enrolling in your first course.</p>
              <Button onClick={() => window.location.href='/courses'}>Explore Courses</Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {enrollments?.map(e => {
                  const courseTitle = e.course?.title ?? "Course";
                  return (
                  <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{e.transactionId}</td>
                    <td className="px-6 py-4 font-medium">{courseTitle}</td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(e.enrolledAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 uppercase text-xs font-bold tracking-wider text-muted-foreground">{e.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-right font-semibold">₹{e.amountPaid}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {e.paymentStatus}
                      </span>
                    </td>
                  </tr>
                  );
                })}
                {!enrollments?.length && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No payment history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'profile' && <ProfileSettings />}
    </div>
  );
}

// --- ADMIN VIEW ---
function AdminView() {
  const [activeTab, setActiveTab] = useState('manage');
  const { data: courses, isLoading, refetch } = useGetCourses();
  const { mutate: deleteCourse } = useDeleteCourse({ request: { headers: getAuthHeaders() } });
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    setLoadingNotes(true);
    fetch('/api/admin/notifications', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotes(false));
  }, [activeTab]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const handleDelete = (id: number) => {
    if(confirm("Are you sure you want to delete this course?")) {
      deleteCourse({ id }, {
        onSuccess: () => { success("Course deleted"); refetch(); },
        onError: () => error("Failed to delete course")
      });
    }
  };

  const openEdit = (course: any) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="py-20 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "manage", label: "Manage Courses" },
            { id: "notifications", label: "Notifications" },
            { id: "profile", label: "Profile Settings" },
          ]}
        />
        {activeTab === "manage" && (
          <Button onClick={openCreate} className="shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" /> Add New Course
          </Button>
        )}
      </div>

      {activeTab === 'manage' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Course Details</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {courses?.map(course => (
                  <tr key={course.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-muted-foreground">#{course.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground text-base mb-1">{course.title}</p>
                      <p className="text-muted-foreground line-clamp-1 max-w-md">{course.description}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary flex items-center">
                      <IndianRupee className="w-4 h-4 mr-0.5" />{course.price}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(course.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(course)} className="h-9 w-9 p-0">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(course.id)} className="h-9 w-9 p-0 shadow-none">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Admin Notifications</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoadingNotes(true);
                  fetch("/api/admin/notifications", {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                  })
                    .then(() => fetch("/api/admin/notifications", { headers: getAuthHeaders() }))
                    .then((res) => res.json())
                    .then((data) => setNotifications(Array.isArray(data) ? data : []))
                    .finally(() => setLoadingNotes(false));
                }}
              >
                Clear all
              </Button>
              {loadingNotes && <Spinner />}
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {notifications.length === 0 && !loadingNotes && (
              <div className="p-6 text-center text-muted-foreground">
                No notifications yet.
              </div>
            )}
            {notifications.map((n) => (
              <div key={n._id} className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {n.name || n.email || "Unknown user"} •{" "}
                    {format(new Date(n.createdAt), "MMM d, yyyy h:mm a")}
                  </div>
                  <div className="text-base text-foreground whitespace-pre-wrap">
                    {n.message.replace(/^\[[^\]]+\]\s*/,"")}
                  </div>
                </div>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 shadow-sm hover:bg-rose-100 hover:border-rose-300 active:scale-95 transition"
                  aria-label="Delete notification"
                  onClick={() => {
                    setLoadingNotes(true);
                    fetch(`/api/admin/notifications/${n._id}`, {
                      method: "DELETE",
                      headers: getAuthHeaders(),
                    })
                      .then(() =>
                        fetch("/api/admin/notifications", {
                          headers: getAuthHeaders(),
                        }),
                      )
                      .then((res) => res.json())
                      .then((data) => setNotifications(Array.isArray(data) ? data : []))
                      .finally(() => setLoadingNotes(false));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'profile' && <ProfileSettings />}

      <CourseFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        course={editingCourse}
        onSuccess={() => { setIsModalOpen(false); refetch(); }}
      />
    </div>
  );
}

// --- SHARED PROFILE SETTINGS ---
function ProfileSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const { mutate, isPending } = useUpdateProfile({ request: { headers: getAuthHeaders() } });
  const { success, error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ data: { name } }, {
      onSuccess: () => success("Profile updated successfully"),
      onError: () => error("Failed to update profile")
    });
  };

  return (
    <Card className="max-w-2xl p-8">
      <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-3xl font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Email Address</p>
            <p className="font-medium text-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1 px-2 py-0.5 bg-muted rounded inline-block uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        
        <Input 
          label="Full Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <Button type="submit" isLoading={isPending} className="shadow-primary/20">Save Changes</Button>
      </form>
    </Card>
  );
}

// --- ADMIN COURSE FORM MODAL ---
function CourseFormModal({ isOpen, onClose, course, onSuccess }: any) {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [price, setPrice] = useState(course?.price?.toString() || '');
  const [content, setContent] = useState(course?.content || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl || '');

  const createMutation = useCreateCourse({ request: { headers: getAuthHeaders() } });
  const updateMutation = useUpdateCourse({ request: { headers: getAuthHeaders() } });
  const { success, error } = useToast();

  const isPending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    if (isOpen) {
      setTitle(course?.title || '');
      setDescription(course?.description || '');
      setPrice(course?.price?.toString() || '');
      setContent(course?.content || '');
      setThumbnailUrl(course?.thumbnailUrl || '');
    }
  }, [isOpen, course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, description, price: Number(price), content, thumbnailUrl };
    
    if (course) {
      updateMutation.mutate({ id: course.id, data }, {
        onSuccess: () => { success("Course updated"); onSuccess(); },
        onError: (e: any) => error(e.message || "Failed to update")
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => { success("Course created"); onSuccess(); },
        onError: (e: any) => error(e.message || "Failed to create")
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course ? "Edit Course" : "Add New Course"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Course Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <Textarea label="Short Description" value={description} onChange={e => setDescription(e.target.value)} required className="min-h-[80px]" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (INR)" type="number" min="0" max="500" value={price} onChange={e => setPrice(e.target.value)} required />
          <Input label="Thumbnail URL" placeholder="https://..." value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
        </div>
        <Textarea label="Full Course Content (HTML supported)" value={content} onChange={e => setContent(e.target.value)} required className="min-h-[200px]" />
        
        <div className="pt-4 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isPending} className="shadow-primary/20">
            {course ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
