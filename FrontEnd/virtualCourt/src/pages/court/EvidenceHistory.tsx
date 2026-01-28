import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";

export default function EvidenceHistory() {
  return (
    <DashboardLayout role="court">
      <PageHeader title="Evidence History" description="View past analysis results" />
      <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
        Evidence history - Connect to your Python backend
      </div>
    </DashboardLayout>
  );
}
