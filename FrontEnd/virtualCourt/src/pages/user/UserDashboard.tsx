import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { StatsCard } from "./../../component/shared/StatsCard";
import { PageHeader } from "./../../component/shared/PageHeader";
import { FileText, Clock, CheckCircle, User, Mail, Shield } from "lucide-react";

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user.id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/user/stats/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!user.id
  });

  const stats = [
    { title: "My Cases", value: userStats?.total_cases || 0, icon: FileText, to: "/user/cases" },
    { title: "Pending", value: userStats?.pending_cases || 0, icon: Clock, to: "/user/cases" },
    { title: "Resolved", value: userStats?.approved_cases || 0, icon: CheckCircle, to: "/user/cases" },
  ];

  return (
    <DashboardLayout role="user">
      <PageHeader title="My Dashboard" description="Track your cases and profile" />

      {/* Profile Section */}
      {user && (
        <div className="mb-8 p-6 bg-card rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Full Name</div>
              <div className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 opacity-70" />
                {user.name}
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Email Address</div>
              <div className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-70" />
                {user.email}
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Role</div>
              <div className="font-medium flex items-center gap-2 capitalize">
                <Shield className="h-4 w-4 opacity-70" />
                {user.role}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>
    </DashboardLayout>
  );
}
