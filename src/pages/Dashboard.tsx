
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Activity, Award, TrendingDown, Download, ArrowDown, ArrowUp, ArrowUpDown, User, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user data on mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/");
          return;
        }
        
        // Get user profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        setUserData({
          id: session.user.id,
          email: session.user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          username: profile?.username || '',
          handicap: profile?.handicap || 0
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/");
        } else if (session) {
          // Update user data when auth state changes
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUserData({
              id: session.user.id,
              email: session.user.email,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              username: profile.username || '',
              handicap: profile.handicap || 0
            });
          }
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
  
  // Mock golf data - would come from your backend in a real application
  const handicap = userData?.handicap || 0;
  
  // This would come from your backend in a real application
  const stats = {
    roundsPlayed: 24,
    bestGrossScore: 72,
    bestNetScore: 65,
    bestToParGross: 1,
    bestToParNet: -2,
  };

  // Initial courses data with dates for the detail view
  const initialCourses = [
    { 
      id: 1, 
      name: "Pine Valley Golf Club", 
      roundsPlayed: 8, 
      bestGrossScore: 75, 
      bestNetScore: 68, 
      bestToParGross: 3, 
      bestToParNet: -4,
      rounds: [
        { date: "2023-08-15", grossScore: 75, netScore: 68, toParGross: 3, toParNet: -4 },
        { date: "2023-07-22", grossScore: 78, netScore: 71, toParGross: 6, toParNet: -1 },
        { date: "2023-06-10", grossScore: 79, netScore: 72, toParGross: 7, toParNet: 0 }
      ]
    },
    { 
      id: 2, 
      name: "Augusta National Golf Club", 
      roundsPlayed: 6, 
      bestGrossScore: 78, 
      bestNetScore: 71, 
      bestToParGross: 6, 
      bestToParNet: -1,
      rounds: [
        { date: "2023-09-05", grossScore: 78, netScore: 71, toParGross: 6, toParNet: -1 },
        { date: "2023-08-12", grossScore: 80, netScore: 73, toParGross: 8, toParNet: 1 }
      ]
    },
    { 
      id: 3, 
      name: "St Andrews Links", 
      roundsPlayed: 10, 
      bestGrossScore: 72, 
      bestNetScore: 65, 
      bestToParGross: -2, 
      bestToParNet: -7,
      rounds: [
        { date: "2023-09-20", grossScore: 72, netScore: 65, toParGross: -2, toParNet: -7 },
        { date: "2023-08-30", grossScore: 74, netScore: 67, toParGross: 0, toParNet: -5 },
        { date: "2023-07-15", grossScore: 76, netScore: 69, toParGross: 2, toParNet: -3 },
        { date: "2023-06-22", grossScore: 77, netScore: 70, toParGross: 3, toParNet: -2 }
      ]
    },
  ];

  // State for courses and sorting
  const [courses, setCourses] = useState(initialCourses);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  // State for view mode: "gross" or "net"
  const [viewMode, setViewMode] = useState<"gross" | "net">("gross");
  
  // State for the selected course (for detail view)
  const [selectedCourse, setSelectedCourse] = useState<typeof initialCourses[0] | null>(null);
  
  // State for profile edit mode
  const [profileEditMode, setProfileEditMode] = useState<"password" | "email" | "profile" | null>(null);

  // Create schema for profile updates
  const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
  });

  const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      username: userData?.username || "",
    },
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: userData?.email || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update forms when userData changes
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
      });
      
      emailForm.reset({
        email: userData.email || "",
      });
    }
  }, [userData, profileForm, emailForm]);

  // Sorting function
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedCourses = [...courses].sort((a, b) => {
      if (a[key as keyof typeof a] < b[key as keyof typeof b]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key as keyof typeof a] > b[key as keyof typeof b]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setCourses(sortedCourses);
  };

  // Get sort direction icon
  const getSortDirectionIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Helper function to format par scores
  const formatParScore = (score: number | undefined): string => {
    if (score === undefined || score === null) return "N/A";
    return score <= 0 ? score.toString() : `+${score}`;
  };

  // Toggle view mode between gross and net
  const toggleViewMode = () => {
    setViewMode(viewMode === "gross" ? "net" : "gross");
  };
  
  // Handle course click to show detail view
  const handleCourseClick = (course: typeof initialCourses[0]) => {
    setSelectedCourse(course);
  };
  
  // Handle back button click to return to main dashboard
  const handleBackClick = () => {
    setSelectedCourse(null);
  };
  
  // Handle download handicap certificate
  const handleDownloadCertificate = () => {
    // In a real app, this would generate a PDF with the user's handicap information
    toast({
      title: "Downloading certificate",
      description: "Your handicap certificate is being generated.",
    });
    // This would be implemented with a PDF generation library like jsPDF
  };
  
  // Handle view leaderboard button click
  const handleViewLeaderboard = (courseId: number) => {
    // In a real app, this would navigate to the leaderboard page for the course
    toast({
      title: "Leaderboard",
      description: `Viewing leaderboard for course ${courseId}`,
    });
    // This would be implemented with React Router navigation
    // navigate(`/leaderboard/${courseId}`);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (data: any) => {
    try {
      if (profileEditMode === "profile") {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            username: data.username,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id);
          
        if (error) {
          throw error;
        }
        
        // Update local user data
        setUserData({
          ...userData,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
        });
        
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      } else if (profileEditMode === "email") {
        const { error } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Email update initiated",
          description: "Please check your email to confirm the change.",
        });
      } else if (profileEditMode === "password") {
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        });
      }
      
      setProfileEditMode(null);
      profileForm.reset();
      emailForm.reset();
      passwordForm.reset();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Render profile content
  const renderProfileContent = () => {
    if (isLoading || !userData) {
      return <div>Loading user data...</div>;
    }

    return (
      <div className="space-y-4">
        {profileEditMode === null && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <div className="text-lg font-medium">{userData.firstName}</div>
              </div>
              <div>
                <Label>Last Name</Label>
                <div className="text-lg font-medium">{userData.lastName}</div>
              </div>
            </div>
            
            <div>
              <Label>Username</Label>
              <div className="text-lg font-medium">{userData.username}</div>
            </div>
            
            <div>
              <Label>Email Address</Label>
              <div className="text-lg font-medium">{userData.email}</div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setProfileEditMode("profile")}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setProfileEditMode("email")}
              >
                Change Email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setProfileEditMode("password")}
              >
                Change Password
              </Button>
            </div>
          </>
        )}
        
        {profileEditMode === "profile" && (
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setProfileEditMode(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        
        {profileEditMode === "email" && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setProfileEditMode(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Email
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        
        {profileEditMode === "password" && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setProfileEditMode(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </div>
    );
  };
  
  // Render the course detail view
  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    
    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBackClick} className="mr-4">
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold">{selectedCourse.name}</h2>
        </div>
        
        {/* This would be a line chart in a real application */}
        <div className="w-full h-64 bg-muted rounded-lg mb-6 p-4 flex items-center justify-center">
          <p className="text-muted-foreground">
            Score History Chart (X-axis: Dates, Y-axis: {viewMode === "gross" ? "Gross" : "Net"} Scores)
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Round History</h3>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleViewMode}
            >
              Show {viewMode === "gross" ? "Net" : "Gross"} Scores
            </Button>
            <Button 
              onClick={() => handleViewLeaderboard(selectedCourse.id)}
            >
              View Leaderboard
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">
                  Score ({viewMode === "gross" ? "Gross" : "Net"})
                </TableHead>
                <TableHead className="text-right">
                  To Par ({viewMode === "gross" ? "Gross" : "Net"})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCourse.rounds.map((round, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(round.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {viewMode === "gross" ? round.grossScore : round.netScore}
                  </TableCell>
                  <TableCell 
                    className={`text-right ${
                      (viewMode === "gross" ? round.toParGross : round.toParNet) <= 0 
                      ? "text-green-500" 
                      : "text-red-500"
                    }`}
                  >
                    {formatParScore(viewMode === "gross" ? round.toParGross : round.toParNet)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  
  // Render the main dashboard view
  const renderDashboard = () => {
    if (isLoading || !userData) {
      return <div className="flex items-center justify-center h-screen">Loading user data...</div>;
    }

    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">{userData.firstName} {userData.lastName}'s Clubhouse</h1>
        <p className="text-muted-foreground mb-8">Welcome back to your golf dashboard</p>
        
        {/* Stats Section with Handicap Circle and Stats Grid */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Main Stats Grid in 2x2 formation */}
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rounds Played</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.roundsPlayed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Best Score ({viewMode === "gross" ? "Gross" : "Net"})
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0" 
                  onClick={toggleViewMode}
                >
                  <Award className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {viewMode === "gross" ? stats.bestGrossScore : stats.bestNetScore}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Best To Par ({viewMode === "gross" ? "Gross" : "Net"})
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0" 
                  onClick={toggleViewMode}
                >
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (viewMode === "gross" ? stats.bestToParGross : stats.bestToParNet) <= 0 
                  ? "text-green-500" 
                  : "text-red-500"
                }`}>
                  {formatParScore(viewMode === "gross" ? stats.bestToParGross : stats.bestToParNet)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Handicap Circle and Certificate Button */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center rounded-full bg-primary w-36 h-36 shadow-lg">
              <span className="text-sm text-white font-medium mb-1">Handicap</span>
              <span className="text-4xl text-white font-bold">{handicap}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadCertificate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Handicap Certificate
            </Button>
          </div>
        </div>

        {/* Add New Round Button */}
        <div className="mb-8">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add a new round
          </Button>
        </div>

        {/* Table Controls */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleViewMode}
          >
            Show {viewMode === "gross" ? "Net" : "Gross"} Scores
          </Button>
        </div>

        {/* Courses Table */}
        <div className="rounded-md border mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                  <div className="flex items-center">
                    Course Name
                    {getSortDirectionIcon('name')}
                  </div>
                </TableHead>
                <TableHead onClick={() => requestSort('roundsPlayed')} className="text-right cursor-pointer">
                  <div className="flex items-center justify-end">
                    Rounds Played
                    {getSortDirectionIcon('roundsPlayed')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => requestSort(viewMode === "gross" ? 'bestGrossScore' : 'bestNetScore')} 
                  className="text-right cursor-pointer"
                >
                  <div className="flex items-center justify-end">
                    Best {viewMode === "gross" ? "Gross" : "Net"}
                    {getSortDirectionIcon(viewMode === "gross" ? 'bestGrossScore' : 'bestNetScore')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => requestSort(viewMode === "gross" ? 'bestToParGross' : 'bestToParNet')} 
                  className="text-right cursor-pointer"
                >
                  <div className="flex items-center justify-end">
                    To Par ({viewMode === "gross" ? "Gross" : "Net"})
                    {getSortDirectionIcon(viewMode === "gross" ? 'bestToParGross' : 'bestToParNet')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="cursor-pointer hover:bg-muted/60" onClick={() => handleCourseClick(course)}>
                  <TableCell className="font-medium text-primary">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-right">{course.roundsPlayed}</TableCell>
                  <TableCell className="text-right">
                    {viewMode === "gross" ? course.bestGrossScore : course.bestNetScore}
                  </TableCell>
                  <TableCell 
                    className={`text-right ${
                      (viewMode === "gross" ? course.bestToParGross : course.bestToParNet) <= 0 
                      ? "text-green-500" 
                      : "text-red-500"
                    }`}
                  >
                    {formatParScore(viewMode === "gross" ? course.bestToParGross : course.bestToParNet)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading user data...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User Account Menu */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                {renderProfileContent()}
              </DialogContent>
            </Dialog>
            
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedCourse ? renderCourseDetail() : renderDashboard()}
    </div>
  );
};

export default Dashboard;
