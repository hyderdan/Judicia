import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { StatsCard } from "./../../component/shared/StatsCard";
import { PageHeader } from "./../../component/shared/PageHeader";
import { FolderOpen, Brain, CheckCircle, AlertTriangle, Shield, User, Mail, Phone, Scale } from "lucide-react";

const stats = [
  { title: "Assigned Cases", value: 0, icon: FolderOpen },
  { title: "AI Analyses", value: 0, icon: Brain },
  { title: "Verified Evidence", value: 0, icon: CheckCircle },
  { title: "Flagged Items", value: 0, icon: AlertTriangle },
];

export default function CourtDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <DashboardLayout role="court">
      <PageHeader title="Court Dashboard" description="Review cases and analyze evidence" />

      {/* Profile Section */}
      {user && (
        <div className="mb-8 p-6 bg-card rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Court Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Court Name</div>
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
