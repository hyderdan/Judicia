import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { StatsCard } from "./../../component/shared/StatsCard";
import { PageHeader } from "./../../component/shared/PageHeader";
import { FileText, Upload, Send, Clock, User, Mail, Shield, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PoliceDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: statsData } = useQuery({
    queryKey: ['policeStats', user.id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/police/stats/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!user.id
  });

  const stats = [
    {
      title: "Active Cases",
      value: statsData?.active_cases || 0,
      icon: FileText,
      to: "/police/cases"
    },
    {
      title: "Evidence Uploaded",
      value: statsData?.evidence_uploaded || 0,
      icon: Upload,
      to: "/police/evidence"
    },
    {
      title: "Sent to Court",
      value: statsData?.sent_to_court || 0,
      icon: Send,
      to: "/police/cases?status=sent_to_court"
    },
    {
      title: "Pending Review",
      value: statsData?.pending_review || 0,
      icon: Clock,
      to: "/police/cases?status=pending"
    },
  ];

  return (
    <DashboardLayout role="police">
      <PageHeader title="Police Dashboard" description="Manage cases and evidence" />

      {/* Profile Section */}
      {user && (
        <div className="mb-8 p-6 bg-card rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Station Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Station Name</div>
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
              <div className="text-sm text-muted-foreground mb-1">Phone Number</div>
              <div className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 opacity-70" />
                {user.phoneNo || "Not Provided"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>
    </DashboardLayout>
  );
}
