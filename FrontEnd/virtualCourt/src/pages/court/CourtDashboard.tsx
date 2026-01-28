import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { StatsCard } from "./../../component/shared/StatsCard";
import { PageHeader } from "./../../component/shared/PageHeader";
import { FolderOpen, Brain, CheckCircle, AlertTriangle } from "lucide-react";

const stats = [
  { title: "Assigned Cases", value: 32, icon: FolderOpen },
  { title: "AI Analyses", value: 89, icon: Brain },
  { title: "Verified Evidence", value: 76, icon: CheckCircle },
  { title: "Flagged Items", value: 13, icon: AlertTriangle },
];

export default function CourtDashboard() {
  return (
    <DashboardLayout role="court">
      <PageHeader title="Court Dashboard" description="Review cases and analyze evidence" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>
    </DashboardLayout>
  );
}
