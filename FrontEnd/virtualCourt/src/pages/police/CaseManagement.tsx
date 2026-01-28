import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Button } from "./../../component/ui/button";
import { Plus } from "lucide-react";

export default function CaseManagement() {
  return (
    <DashboardLayout role="police">
      <PageHeader
        title="Case Management"
        description="Create and manage cases"
        actions={<Button className="gradient-primary text-white"><Plus className="h-4 w-4 mr-2" />New Case</Button>}
      />
      <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
        Case management interface - Connect to your Python backend
      </div>
    </DashboardLayout>
  );
}
