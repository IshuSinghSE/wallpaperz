
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { search } from "@/lib/search";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, Filter, Loader2, User as UserIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 10;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUserDetails, setCurrentUserDetails] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

  useEffect(() => {
    fetchUsers(true);
  }, [filterRole]);

  const fetchUsers = async (isInitial: boolean = false) => {
    try {
      setLoading(true);
      
      if (isInitial) {
        setLastVisible(null);
      }
      
      let queryConstraints = [];
      
      if (filterRole !== "all") {
        queryConstraints.push(orderBy("role"), where("role", "==", filterRole));
      } else {
        queryConstraints.push(orderBy("role"));
      }
      
      queryConstraints.push(orderBy("displayName"));
      queryConstraints.push(limit(ITEMS_PER_PAGE));
      
      if (!isInitial && lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      const q = query(collection(db, "users"), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        if (isInitial) {
          setUsers([]);
        }
        return;
      }
      
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      
      const usersList = querySnapshot.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() } as User)
      );
      
      if (isInitial) {
        setUsers(usersList);
      } else {
        setUsers(prev => [...prev, ...usersList]);
      }
      
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!currentUserDetails) return;

    try {
      await updateDoc(doc(db, "users", currentUserDetails.uid), {
        role: selectedRole,
      });

      toast({
        title: "Success",
        description: `User role updated to ${selectedRole}`,
      });

      setIsEditDialogOpen(false);
      fetchUsers(true);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUserDetails) return;

    try {
      await deleteDoc(doc(db, "users", currentUserDetails.uid));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchUsers(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUserDetails(user);
    setSelectedRole(user.role);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setCurrentUserDetails(user);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search is cleared, reset to normal view
      fetchUsers(true);
      return;
    }
    
    try {
      setLoading(true);
      
      const filters: Record<string, any> = {};
      if (filterRole !== "all") filters.role = filterRole;
      
      const result = await search<User>({
        collection: "users",
        searchTerm: searchTerm.trim(),
        filters,
        sortField: "displayName",
        sortDirection: "asc",
        pageSize: ITEMS_PER_PAGE
      });
      
      setUsers(result.items);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
      if (result.items.length === 0) {
        toast({
          title: "No users found",
          description: `No users matching "${searchTerm}" were found.`,
        });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Search error",
        description: "Failed to search users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    fetchUsers(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2" 
              onClick={resetSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        <div className="flex gap-2">
          <div className="relative group">
            <Select
              value={filterRole}
              onValueChange={(value: "all" | "admin" | "user") => setFilterRole(value)}
            >
              <SelectTrigger className="w-[150px] backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-white/20">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="bg-primary/80 text-xs">Role</Badge>
            </div>
          </div>
        </div>
      </div>

      <Card className="backdrop-blur-sm bg-white/10 border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users registered to the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-primary/5 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No users found in the database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.uid} className="hover:bg-primary/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="border border-white/20 shadow-md">
                              {user.photoURL ? (
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                              ) : null}
                              <AvatarFallback className="bg-primary/20 text-primary-foreground">
                                {getInitials(user.displayName || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.displayName}</p>
                              {currentUser?.uid === user.uid && (
                                <span className="text-xs text-muted-foreground">
                                  (You)
                                </span>
                              )}
                              {user.isPremium && (
                                <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-300 text-white">Premium</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              } shadow-sm`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(user)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {currentUser?.uid !== user.uid && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openDeleteDialog(user)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={loadMore} 
                className="shadow-lg shadow-primary/10 backdrop-blur-sm bg-primary/80"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load More Users"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update permissions for {currentUserDetails?.displayName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Role</p>
              <Select value={selectedRole} onValueChange={(value: "admin" | "user") => setSelectedRole(value)}>
                <SelectTrigger className="w-full backdrop-blur-sm bg-white/10 border border-white/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
              Cancel
            </Button>
            <Button onClick={handleRoleChange} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentUserDetails?.displayName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="shadow-lg">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
