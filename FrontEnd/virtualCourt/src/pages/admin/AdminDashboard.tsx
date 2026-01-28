import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { StatsCard } from "./../../component/shared/StatsCard";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Users, Building2, Shield, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('http://127.0.0.1:8000/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  const statCards = [
    { title: "Total Users", value: stats?.total_users || 0, icon: Users, to: "/admin/users?tab=approved" },
    { title: "Pending Approvals", value: stats?.pending_users || 0, icon: Clock, to: "/admin/users?tab=pending" },
    { title: "Approved Users", value: stats?.approved_users || 0, icon: Clock, to: "/admin/users?tab=approved" },
    { title: "Courts", value: stats?.court_count || 0, icon: Building2, to: "/admin/courts" },
    { title: "Police Stations", value: stats?.police_count || 0, icon: Shield, to: "/admin/police" },
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of system activities and statistics"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>
    </DashboardLayout>
  );
}
