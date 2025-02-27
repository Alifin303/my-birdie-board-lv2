
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Activity, 
  Award, 
  TrendingDown, 
  Download, 
  ArrowDown, 
  ArrowUp, 
  ArrowUpDown, 
  User, 
  LogOut,
  Eye,
  Compass,
  ArrowLeft
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddRoundModal } from "@/components/AddRoundModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addRoundModalOpen, setAddRoundModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  
  // Get user data on mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        console.log("Fetching user session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        console.log("Session data:", session ? "Session exists" : "No session");
        
        if (!session) {
          navigate("/");
          return;
        }
        
        // Get user profile from profiles table
        console.log("Fetching user profile...");
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        console.log("User profile data:", profile);
        
        setUserData({
          id: session.user.id,
          email: session.user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          username: profile?.username || '',
          handicap: profile?.handicap || 0
        });
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setApiErrors(prev => [...prev, `User data error: ${error.message || "Unknown error"}`]);
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
        console.log("Auth state changed:", event);
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

  // Fetch user stats from database
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['userStats', userData?.id],
    queryFn: async () => {
      console.log("Fetching user stats for user ID:", userData?.id);
      if (!userData?.id) return null;
      
      try {
        // Check if rounds table exists
        console.log("Checking rounds table...");
        try {
          const { count, error } = await supabase
            .from('rounds')
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error("Error checking rounds table:", error);
            setApiErrors(prev => [...prev, `Rounds table check error: ${error.message}`]);
            throw error;
          }
          
          console.log("Rounds table exists with count:", count);
        } catch (e) {
          console.error("Rounds table may not exist:", e);
          setApiErrors(prev => [...prev, "Rounds table may not exist in the database"]);
          // Continue execution to gather more diagnostics
        }
      
        // Count total rounds played
        console.log("Counting user rounds...");
        const { count: roundsCount, error: roundsError } = await supabase
          .from('rounds')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userData.id);
          
        if (roundsError) {
          console.error("Error counting rounds:", roundsError);
          setApiErrors(prev => [...prev, `Rounds count error: ${roundsError.message}`]);
          throw roundsError;
        }
        
        console.log("User rounds count:", roundsCount);
        
        // Get best gross and net scores
        console.log("Fetching best scores...");
        const { data: bestScores, error: scoresError } = await supabase
          .from('rounds')
          .select('gross_score, net_score, to_par_gross, to_par_net')
          .eq('user_id', userData.id)
          .order('gross_score', { ascending: true })
          .limit(1);
          
        if (scoresError) {
          console.error("Error fetching best scores:", scoresError);
          setApiErrors(prev => [...prev, `Best scores error: ${scoresError.message}`]);
          throw scoresError;
        }
        
        console.log("Best scores data:", bestScores);
        
        // Get best to par scores
        console.log("Fetching best to par gross...");
        const { data: bestToParGross, error: parGrossError } = await supabase
          .from('rounds')
          .select('to_par_gross')
          .eq('user_id', userData.id)
          .order('to_par_gross', { ascending: true })
          .limit(1);
          
        if (parGrossError) {
          console.error("Error fetching best to par gross:", parGrossError);
          setApiErrors(prev => [...prev, `Best to par gross error: ${parGrossError.message}`]);
          throw parGrossError;
        }
        
        console.log("Best to par gross data:", bestToParGross);
        
        console.log("Fetching best to par net...");
        const { data: bestToParNet, error: parNetError } = await supabase
          .from('rounds')
          .select('to_par_net')
          .eq('user_id', userData.id)
          .order('to_par_net', { ascending: true })
          .limit(1);
          
        if (parNetError) {
          console.error("Error fetching best to par net:", parNetError);
          setApiErrors(prev => [...prev, `Best to par net error: ${parNetError.message}`]);
          throw parNetError;
        }
        
        console.log("Best to par net data:", bestToParNet);
        
        return {
          roundsPlayed: roundsCount || 0,
          bestGrossScore: bestScores?.[0]?.gross_score || 0,
          bestNetScore: bestScores?.[0]?.net_score || 0,
          bestToParGross: bestToParGross?.[0]?.to_par_gross || 0,
          bestToParNet: bestToParNet?.[0]?.to_par_net || 0,
        };
      } catch (error: any) {
        console.error("Stats fetch error:", error);
        setApiErrors(prev => [...prev, `Stats error: ${error.message || "Unknown error"}`]);
        return {
          roundsPlayed: 0,
          bestGrossScore: 0,
          bestNetScore: 0,
          bestToParGross: 0,
          bestToParNet: 0,
          error: error.message
        };
      }
    },
    enabled: !!userData?.id,
  });
  
  // Fetch user's courses from database
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['userCourses', userData?.id],
    queryFn: async () => {
      console.log("Fetching user courses for user ID:", userData?.id);
      if (!userData?.id) return [];
      
      try {
        // First get all the courses the user has played using a modified query
        // We'll use a simpler approach - get all rounds, then extract unique course IDs
        console.log("Fetching user rounds to extract course IDs...");
        const { data: rounds, error: roundsError } = await supabase
          .from('rounds')
          .select('course_id')
          .eq('user_id', userData.id);
          
        if (roundsError) {
          console.error("Error fetching rounds for courses:", roundsError);
          setApiErrors(prev => [...prev, `Rounds/courses error: ${roundsError.message}`]);
          throw roundsError;
        }
        
        console.log("User rounds data for courses:", rounds);
        
        // Extract unique course IDs
        const uniqueCourseIds = [...new Set(rounds?.map(round => round.course_id) || [])];
        console.log("Unique course IDs:", uniqueCourseIds);
        
        if (uniqueCourseIds.length === 0) return [];
        
        // Check if courses table exists
        try {
          console.log("Checking courses table...");
          const { count, error } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error("Error checking courses table:", error);
            setApiErrors(prev => [...prev, `Courses table check error: ${error.message}`]);
            throw error;
          }
          
          console.log("Courses table exists with count:", count);
        } catch (e) {
          console.error("Courses table may not exist:", e);
          setApiErrors(prev => [...prev, "Courses table may not exist in the database"]);
          return [];
        }
        
        // For each course, get stats
        const coursePromises = uniqueCourseIds.map(async (course_id) => {
          try {
            // Get course details
            console.log(`Fetching details for course ID: ${course_id}`);
            const { data: course, error: courseError } = await supabase
              .from('courses')
              .select('*')
              .eq('id', course_id)
              .single();
              
            if (courseError) {
              console.error(`Error fetching course ${course_id}:`, courseError);
              throw courseError;
            }
            
            console.log(`Course details for ${course_id}:`, course);
            
            // Count rounds played at this course
            console.log(`Counting rounds for course ${course_id}...`);
            const { count: roundsCount, error: countError } = await supabase
              .from('rounds')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userData.id)
              .eq('course_id', course_id);
              
            if (countError) {
              console.error(`Error counting rounds for course ${course_id}:`, countError);
              throw countError;
            }
            
            console.log(`Rounds count for course ${course_id}:`, roundsCount);
            
            // Get best gross score
            console.log(`Fetching best gross score for course ${course_id}...`);
            const { data: bestGross, error: grossError } = await supabase
              .from('rounds')
              .select('gross_score, to_par_gross')
              .eq('user_id', userData.id)
              .eq('course_id', course_id)
              .order('gross_score', { ascending: true })
              .limit(1);
              
            if (grossError) {
              console.error(`Error fetching best gross for course ${course_id}:`, grossError);
              throw grossError;
            }
            
            console.log(`Best gross for course ${course_id}:`, bestGross);
            
            // Get best net score
            console.log(`Fetching best net score for course ${course_id}...`);
            const { data: bestNet, error: netError } = await supabase
              .from('rounds')
              .select('net_score, to_par_net')
              .eq('user_id', userData.id)
              .eq('course_id', course_id)
              .order('net_score', { ascending: true })
              .limit(1);
              
            if (netError) {
              console.error(`Error fetching best net for course ${course_id}:`, netError);
              throw netError;
            }
            
            console.log(`Best net for course ${course_id}:`, bestNet);
            
            // Get all rounds for this course
            console.log(`Fetching all rounds for course ${course_id}...`);
            const { data: courseRounds, error: roundsError } = await supabase
              .from('rounds')
              .select('date, gross_score, net_score, to_par_gross, to_par_net')
              .eq('user_id', userData.id)
              .eq('course_id', course_id)
              .order('date', { ascending: false });
              
            if (roundsError) {
              console.error(`Error fetching rounds for course ${course_id}:`, roundsError);
              throw roundsError;
            }
            
            console.log(`All rounds for course ${course_id}:`, courseRounds);
            
            return {
              id: course_id,
              name: course.name,
              roundsPlayed: roundsCount || 0,
              bestGrossScore: bestGross?.[0]?.gross_score || 0,
              bestNetScore: bestNet?.[0]?.net_score || 0,
              bestToParGross: bestGross?.[0]?.to_par_gross || 0,
              bestToParNet: bestNet?.[0]?.to_par_net || 0,
              rounds: courseRounds?.map(round => ({
                date: round.date,
                grossScore: round.gross_score,
                netScore: round.net_score,
                toParGross: round.to_par_gross,
                toParNet: round.to_par_net
              })) || []
            };
          } catch (error: any) {
            console.error(`Error processing course ${course_id}:`, error);
            setApiErrors(prev => [...prev, `Course ${course_id} error: ${error.message}`]);
            return null;
          }
        });
        
        const coursesResults = await Promise.all(coursePromises);
        const validCourses = coursesResults.filter(course => course !== null) as any[];
        console.log("Final courses data:", validCourses);
        return validCourses;
      } catch (error: any) {
        console.error("Courses fetch error:", error);
        setApiErrors(prev => [...prev, `Courses error: ${error.message || "Unknown error"}`]);
        return [];
      }
    },
    enabled: !!userData?.id,
  });
  
  // State for courses and sorting
  const [courses, setCourses] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  // Update courses state when data changes
  useEffect(() => {
    if (coursesData) {
      setCourses(coursesData);
    }
  }, [coursesData]);
  
  // State for view mode: "gross" or "net"
  const [viewMode, setViewMode] = useState<"gross" | "net">("gross");
  
  // State for the selected course (for detail view)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  
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

  // Function to test database tables
  const checkDatabaseTables = async () => {
    const tables = ['profiles', 'rounds', 'courses'];
    const results: Record<string, any> = {};
    
    console.log("Testing database tables...");
    
    for (const table of tables) {
      try {
        console.log(`Checking table: ${table}`);
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`Error with table ${table}:`, error);
          results[table] = { exists: false, error: error.message };
        } else {
          console.log(`Table ${table} exists with ${count} records`);
          results[table] = { exists: true, count };
        }
      } catch (error: any) {
        console.error(`Error checking table ${table}:`, error);
        results[table] = { exists: false, error: error.message };
      }
    }
    
    console.log("Database table check results:", results);
    toast({
      title: "Database Check",
      description: `Results: ${Object.entries(results).map(([table, result]) => 
        `${table}: ${(result as any).exists ? 'OK' : 'Missing'}`).join(', ')}`,
      duration: 5000,
    });
    
    return results;
  };

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
  const handleCourseClick = (course: any) => {
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
            <ArrowLeft className="h-4 w-4 mr-2" />
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
              {selectedCourse.rounds.map((round: any, index: number) => (
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
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Activity className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p>Loading user data...</p>
          </div>
        </div>
      );
    }

    // Get stats from query data or use placeholders
    const stats = statsData || {
      roundsPlayed: 0,
      bestGrossScore: 0,
      bestNetScore: 0,
      bestToParGross: 0,
      bestToParNet: 0,
    };

    // Get handicap from user data
    const handicap = userData?.handicap || 0;

    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">{userData.firstName} {userData.lastName}'s Clubhouse</h1>
        <p className="text-muted-foreground mb-8">Welcome back to your golf dashboard</p>
        
        {/* API Test Section */}
        {apiErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <div>
                <p className="font-semibold mb-1">API Diagnostic Information:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {apiErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={checkDatabaseTables}
                >
                  Test Database Tables
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
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
          <Button 
            size="lg" 
            className="gap-2"
            onClick={(e) => {
              e.preventDefault(); // Prevent default navigation
              e.stopPropagation(); // Stop event bubbling
              setAddRoundModalOpen(true);
              console.log("Opening modal, state set to:", true);
            }}
            type="button"
          >
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
        {coursesLoading ? (
          <div className="flex justify-center items-center p-8">
            <Activity className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/10">
            <p className="text-muted-foreground mb-4">You haven't played any courses yet.</p>
            <Button 
              onClick={(e) => {
                e.preventDefault(); // Prevent default navigation
                e.stopPropagation(); // Stop event bubbling
                setAddRoundModalOpen(true);
                console.log("Opening modal from empty state, set to:", true);
              }}
              className="gap-2"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add your first round
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    );
  };

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
      
      {/* Add Round Modal */}
      <AddRoundModal 
        open={addRoundModalOpen} 
        onOpenChange={(open) => {
          console.log("Modal open state changing to:", open);
          setAddRoundModalOpen(open);
        }} 
      />
    </div>
  );
};

export default Dashboard;
