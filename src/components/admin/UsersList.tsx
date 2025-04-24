import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  handicap: number;
  roundsCount: number;
  coursesCount: number;
  email: string;
  last_sign_in: string;
  created_at: string;
}

interface UsersListProps {
  onUserSelect: (userId: string) => void;
}

export function UsersList({ onUserSelect }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        // Fetch all users from profiles with created_at
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*, created_at');
          
        if (profilesError) throw profilesError;
        
        // Get all users from Auth
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin
          .listUsers();
          
        if (authError) throw authError;
        
        // For each user, count their rounds and unique courses
        const usersWithStats = await Promise.all(
          profiles.map(async (profile) => {
            const authUser = authUsers.find(u => u.id === profile.id);
            
            // Count rounds
            const { count: roundsCount, error: roundsError } = await supabase
              .from('rounds')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);
              
            if (roundsError) throw roundsError;
            
            // Count unique courses
            const { data: uniqueCourses, error: coursesError } = await supabase
              .from('rounds')
              .select('course_id')
              .eq('user_id', profile.id);
              
            if (coursesError) throw coursesError;
            
            const uniqueCourseIds = new Set(uniqueCourses.map(r => r.course_id));
            
            return {
              ...profile,
              email: authUser?.email,
              last_sign_in: authUser?.last_sign_in_at,
              roundsCount: roundsCount || 0,
              coursesCount: uniqueCourseIds.size,
              created_at: profile.created_at
            };
          })
        );
        
        setUsers(usersWithStats);
        setFilteredUsers(usersWithStats);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(lowercaseSearch) || 
      user.first_name?.toLowerCase().includes(lowercaseSearch) || 
      user.last_name?.toLowerCase().includes(lowercaseSearch)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);
  
  useEffect(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'username':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
        case 'name':
          const aName = `${a.first_name || ''} ${a.last_name || ''}`.trim();
          const bName = `${b.first_name || ''} ${b.last_name || ''}`.trim();
          comparison = aName.localeCompare(bName);
          break;
        case 'joined':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'handicap':
          comparison = (a.handicap || 0) - (b.handicap || 0);
          break;
        case 'rounds':
          comparison = (a.roundsCount || 0) - (b.roundsCount || 0);
          break;
        case 'courses':
          comparison = (a.coursesCount || 0) - (b.coursesCount || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(sorted);
  }, [sortBy, sortDirection]);
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 inline ml-1" />
      : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  if (loading) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={sortBy} 
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="username">Username</SelectItem>
              <SelectItem value="name">Full Name</SelectItem>
              <SelectItem value="joined">Date Joined</SelectItem>
              <SelectItem value="handicap">Handicap</SelectItem>
              <SelectItem value="rounds">Rounds</SelectItem>
              <SelectItem value="courses">Courses</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('username')}
              >
                Username {renderSortIcon('username')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {renderSortIcon('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort('joined')}
              >
                Date Joined {renderSortIcon('joined')}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort('handicap')}
              >
                Handicap {renderSortIcon('handicap')}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort('rounds')}
              >
                Rounds {renderSortIcon('rounds')}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort('courses')}
              >
                Courses {renderSortIcon('courses')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 'No users match your search.' : 'No users found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                  <TableCell>
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : (user.first_name || user.last_name || 'N/A')}
                  </TableCell>
                  <TableCell className="text-right">{user.handicap?.toFixed(1) || 'N/A'}</TableCell>
                  <TableCell className="text-right">{user.roundsCount}</TableCell>
                  <TableCell className="text-right">{user.coursesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserSelect(user.id)}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">View details</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Skeleton className="h-10 w-full sm:w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Handicap</TableHead>
              <TableHead className="text-right">Rounds</TableHead>
              <TableHead className="text-right">Courses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(i => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
