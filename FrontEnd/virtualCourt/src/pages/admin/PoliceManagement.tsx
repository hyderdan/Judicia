import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { DataTable } from "./../../component/shared/Datatable";
import { Button } from "./../../component/ui/button";
import { Input } from "./../../component/ui/input";
import { Label } from "./../../component/ui/label";
import { Plus, Search, Trash2, Shield, Eye } from "lucide-react";
import { useToast } from "./../../hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./../../component/ui/dialog";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  role: string;
}

export default function PoliceManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch police users
  const { data: stations = [] } = useQuery<User[]>({
    queryKey: ['police'],
    queryFn: async () => {
      const res = await fetch('http://127.0.0.1:8000/admin/users?role=police');
      if (!res.ok) throw new Error('Failed to fetch police users');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('http://127.0.0.1:8000/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'police' })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create police account');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast({ title: "Station Added", description: "New police station account has been added." });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`http://127.0.0.1:8000/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast({ title: "Station Deleted", description: "The police station account has been deleted.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this police station account? This action cannot be undone.")) {
      deleteMutation.mutate(userId);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", password: "" });
  };

  const columns = [
    {
      header: "Station Name",
      accessor: (station: User) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="font-medium">{station.name}</p>
          </div>
        </div>
      ),
    },
    { header: "Email", accessor: "email" as const },
    { header: "Phone", accessor: "phoneNo" as const },
    {
      header: "Actions",
      accessor: (station: User) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStation(station);
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
              handleDelete(station.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Police Management"
        description="Add and manage police stations in the system"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Police Station Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Station Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., NYPD 5th Precinct"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="station@police.gov"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Set password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Station"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
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
            placeholder="Search stations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <DataTable columns={columns} data={filteredStations} />

      {/* Police Detail Dialog */}
      <Dialog open={!!selectedStation} onOpenChange={() => setSelectedStation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Police Station Details</DialogTitle>
          </DialogHeader>
          {selectedStation && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Station Name</p>
                <p className="font-medium">{selectedStation.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedStation.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedStation.phoneNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">Police Station</p>
              </div>
              <div className="pt-4 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedStation.id);
                    setSelectedStation(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
