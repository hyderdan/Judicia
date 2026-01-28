import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";

export default function Communication() {
  return (
    <DashboardLayout role="police">
      <PageHeader title="Communication" description="Message courts about cases" />
      <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
        Communication interface - Connect to your Python backend
      </div>
    </DashboardLayout>
  );
}
