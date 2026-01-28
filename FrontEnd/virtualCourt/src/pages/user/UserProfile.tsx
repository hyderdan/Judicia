import { useState, useEffect } from "react";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Button } from "./../../component/ui/button";
import { Input } from "./../../component/ui/input";
import { Label } from "./../../component/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "./../../hooks/use-toast";

export default function UserProfile() {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [formData, setFormData] = useState({ name: "", email: "", phoneNo: "" });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user.id],
    queryFn: async () => {
      console.log("[UserProfile] Fetching profile for ID:", user.id);
      const res = await fetch(`http://127.0.0.1:8000/user/profile/${user.id}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("[UserProfile] Fetch error:", errData);
        throw new Error(errData.detail || "Failed to fetch profile");
      }
      const data = await res.json();
      console.log("[UserProfile] Profile data received:", data);
      return data;
    },
    enabled: !!user.id
  });

  if (error) {
    console.error("[UserProfile] Query error:", error);
  }

  useEffect(() => {
    if (profile) {
      console.log("[UserProfile] Syncing form data with profile:", profile);
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phoneNo: profile.phoneNo || ""
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: { name: string, phoneNo: string }) => {
      const res = await fetch(`http://127.0.0.1:8000/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
      // Update local storage name if it changed
      const updatedUser = { ...user, name: formData.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name: formData.name, phoneNo: formData.phoneNo });
  };

  if (isLoading) return <DashboardLayout role="user"><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="user">
      <PageHeader title="My Profile" description="Manage your account" />
      <div className="glass-card rounded-xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={formData.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phoneNo}
              onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-fit gradient-primary text-white"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}

