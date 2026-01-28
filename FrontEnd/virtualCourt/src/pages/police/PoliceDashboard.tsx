import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { StatsCard } from "./../../component/shared/StatsCard";
import { PageHeader } from "./../../component/shared/PageHeader";
import { FileText, Upload, Send, Clock } from "lucide-react";

const stats = [
  { title: "Active Cases", value: 24, icon: FileText },
  { title: "Evidence Uploaded", value: 156, icon: Upload },
  { title: "Sent to Court", value: 18, icon: Send },
  { title: "Pending Review", value: 6, icon: Clock },
];

export default function PoliceDashboard() {
  return (
    <DashboardLayout role="police">
      <PageHeader title="Police Dashboard" description="Manage cases and evidence" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>
    </DashboardLayout>
  );
}
