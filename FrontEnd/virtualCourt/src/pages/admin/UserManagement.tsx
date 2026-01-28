import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { DataTable } from "./../../component/shared/Datatable";
import { StatusBadge } from "./../../component/shared/StatusBadge";
import { Button } from "./../../component/ui/button";
import { Input } from "./../../component/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../component/ui/tabs";
import { Check, X, Search, Eye, Trash2 } from "lucide-react";
import { useToast } from "./../../hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./../../component/ui/dialog";
// hello
interface User {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  role: string;
  registeredAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "pending";

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('http://127.0.0.1:8000/admin/users?role=user');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      // Add dummy date for now as API doesn't return it
      return data.map((u: any) => ({ ...u, registeredAt: new Date().toLocaleDateString() }));
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`http://127.0.0.1:8000/admin/users/${userId}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to approve');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast({ title: "User Approved", description: "The user has been approved." });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`http://127.0.0.1:8000/admin/users/${userId}/reject`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to reject');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast({ title: "User Rejected", description: "The user has been rejected.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`http://127.0.0.1:8000/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast({ title: "User Deleted", description: "The user has been deleted.", variant: "destructive" });
    }
  });

  const handleApprove = (userId: number) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: number) => {
    rejectMutation.mutate(userId);
  };

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteMutation.mutate(userId);
    }
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved' || u.status === 'rejected');

  const pendingColumns = [
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Phone", accessor: "phoneNo" as const },
    { header: "Role", accessor: "role" as const },
    {
      header: "Actions",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="h-8 w-8 p-0 bg-success hover:bg-success/90"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(user.id);
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleReject(user.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const approvedColumns = [
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Phone", accessor: "phoneNo" as const },
    { header: "Role", accessor: "role" as const },
    { header: "Registered", accessor: "registeredAt" as const },
    {
      header: "Status",
      accessor: (user: User) => <StatusBadge status={user.status} />,
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filteredPending = pendingUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApproved = approvedUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="User Management"
        description="Approve or reject user registrations"
      />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingUsers.length > 0 && (
              <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable columns={pendingColumns} data={filteredPending} />
        </TabsContent>

        <TabsContent value="approved">
          <DataTable columns={approvedColumns} data={filteredApproved} />
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedUser.phoneNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={selectedUser.status} />
              </div>

              {selectedUser.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => {
                      handleApprove(selectedUser.id);
                      setSelectedUser(null);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedUser.id);
                      setSelectedUser(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
