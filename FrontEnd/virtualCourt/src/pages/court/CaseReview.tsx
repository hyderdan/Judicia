import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";

export default function CaseReview() {
  return (
    <DashboardLayout role="court">
      <PageHeader title="Case Review" description="Review assigned cases" />
      <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
        Case review interface - Connect to your Python backend
      </div>
    </DashboardLayout>
  );
}
